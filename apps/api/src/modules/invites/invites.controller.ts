import {
  Controller, Post, Get, Delete, Param, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FirebaseAuthGuard, Public } from '../../common/guards/firebase-auth.guard';
import { FirebaseUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/invite.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('invites')
@UseGuards(FirebaseAuthGuard)
export class InvitesController {
  constructor(
    private invites: InvitesService,
    private auth: AuthService,
  ) {}

  /**
   * POST /api/v1/invites
   * Send one or more invite emails.
   * Body: { emails: string[], message?: string }
   */
  @Post()
  async create(
    @Body() dto: CreateInviteDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.invites.create(user.id, dto);
  }

  /**
   * GET /api/v1/invites
   * List all invites sent by the current user.
   */
  @Get()
  async list(@FirebaseUser() firebaseUser: DecodedIdToken) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.invites.listByUser(user.id);
  }

  /**
   * GET /api/v1/invites/:token
   * Get invite details by token (public — used on the accept page).
   */
  @Get(':token')
  @Public()
  getByToken(@Param('token') token: string) {
    return this.invites.getByToken(token);
  }

  /**
   * POST /api/v1/invites/:token/accept
   * Accept an invite. Works logged-in (records user) or as a guest.
   */
  @Post(':token/accept')
  @Public()
  @HttpCode(HttpStatus.OK)
  async accept(
    @Param('token') token: string,
    @FirebaseUser() firebaseUser: DecodedIdToken | null,
  ) {
    let userId: string | undefined;
    if (firebaseUser) {
      const user = await this.auth.syncUser(firebaseUser).catch(() => undefined);
      userId = user?.id;
    }
    return this.invites.accept(token, userId);
  }

  /**
   * DELETE /api/v1/invites/:id
   * Revoke a sent invite.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async revoke(
    @Param('id') id: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.invites.revoke(id, user.id);
  }
}
