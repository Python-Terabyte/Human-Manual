import {
  Injectable, Inject, NotFoundException,
  ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE, type DrizzleDb } from '../../database/drizzle.module';
import { invites, users } from '../../../../../packages/db/src/schema';
import { EmailService } from './email.service';
import type { CreateInviteDto } from './dto/invite.dto';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);
  private readonly appUrl: string;

  constructor(
    @Inject(DRIZZLE) private db: DrizzleDb,
    private email: EmailService,
    private config: ConfigService,
  ) {
    this.appUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
  }

  // ── Create invites (one per email) ─────────────────────────────────────────
  async create(fromUserId: string, dto: CreateInviteDto) {
    // Resolve sender profile
    const [sender] = await this.db
      .select({
        id:          users.id,
        displayName: users.displayName,
        username:    users.username,
        email:       users.email,
      })
      .from(users)
      .where(eq(users.id, fromUserId))
      .limit(1);

    if (!sender) throw new NotFoundException('Sender not found');

    const fromName     = sender.displayName ?? sender.username ?? 'Someone';
    const fromUsername = sender.username ?? 'user';

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const results: Array<{ email: string; token: string; emailSent: boolean }> = [];

    for (const toEmail of dto.emails) {
      // Don't invite yourself
      if (toEmail.toLowerCase() === sender.email.toLowerCase()) continue;

      // Check for existing pending invite to the same address from the same user
      const existing = await this.db
        .select({ id: invites.id, status: invites.status })
        .from(invites)
        .where(
          and(
            eq(invites.fromUserId, fromUserId),
            eq(invites.toEmail, toEmail.toLowerCase()),
            eq(invites.status, 'pending'),
          ),
        )
        .limit(1);

      let token: string;

      if (existing.length > 0) {
        // Re-use existing pending invite token (idempotent re-send)
        const [row] = await this.db
          .select({ token: invites.token })
          .from(invites)
          .where(eq(invites.id, existing[0].id))
          .limit(1);
        token = row.token;
      } else {
        token = nanoid(40);
        await this.db.insert(invites).values({
          fromUserId,
          toEmail:   toEmail.toLowerCase(),
          message:   dto.message ?? null,
          token,
          expiresAt,
        });
      }

      const inviteLink = `${this.appUrl}/invite/${token}`;
      const { ok } = await this.email.sendInvite({
        toEmail,
        fromName,
        fromUsername,
        message:    dto.message,
        inviteLink,
      });

      results.push({ email: toEmail, token, emailSent: ok });
    }

    return results;
  }

  // ── List invites sent by a user ─────────────────────────────────────────────
  async listByUser(fromUserId: string) {
    return this.db
      .select({
        id:         invites.id,
        toEmail:    invites.toEmail,
        status:     invites.status,
        createdAt:  invites.createdAt,
        expiresAt:  invites.expiresAt,
        acceptedAt: invites.acceptedAt,
      })
      .from(invites)
      .where(eq(invites.fromUserId, fromUserId))
      .orderBy(desc(invites.createdAt));
  }

  // ── Get invite by token (public) ────────────────────────────────────────────
  async getByToken(token: string) {
    const rows = await this.db
      .select({
        id:          invites.id,
        toEmail:     invites.toEmail,
        status:      invites.status,
        message:     invites.message,
        expiresAt:   invites.expiresAt,
        createdAt:   invites.createdAt,
        fromName:    users.displayName,
        fromUsername: users.username,
        fromAvatar:  users.avatarUrl,
      })
      .from(invites)
      .innerJoin(users, eq(invites.fromUserId, users.id))
      .where(eq(invites.token, token))
      .limit(1);

    if (rows.length === 0) throw new NotFoundException('Invite not found');

    const invite = rows[0];

    if (invite.status === 'revoked') {
      throw new BadRequestException('This invite has been revoked');
    }
    if (invite.status === 'accepted') {
      return { ...invite, alreadyAccepted: true };
    }
    if (new Date() > new Date(invite.expiresAt)) {
      // Auto-expire stale invites
      await this.db
        .update(invites)
        .set({ status: 'revoked' })
        .where(eq(invites.token, token));
      throw new BadRequestException('This invite has expired');
    }

    return invite;
  }

  // ── Accept invite ───────────────────────────────────────────────────────────
  async accept(token: string, acceptingUserId?: string) {
    const invite = await this.getByToken(token);

    if ((invite as any).alreadyAccepted) return invite;

    await this.db
      .update(invites)
      .set({
        status:     'accepted',
        acceptedAt: new Date(),
        toUserId:   acceptingUserId ?? null,
      })
      .where(eq(invites.token, token));

    return { accepted: true };
  }

  // ── Revoke invite ───────────────────────────────────────────────────────────
  async revoke(inviteId: string, fromUserId: string) {
    const [invite] = await this.db
      .select({ id: invites.id, fromUserId: invites.fromUserId })
      .from(invites)
      .where(eq(invites.id, inviteId))
      .limit(1);

    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.fromUserId !== fromUserId) {
      throw new ForbiddenException('You do not own this invite');
    }

    await this.db
      .update(invites)
      .set({ status: 'revoked' })
      .where(eq(invites.id, inviteId));

    return { revoked: true };
  }
}
