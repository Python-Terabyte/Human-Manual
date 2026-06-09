import {
  Injectable, Inject, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { eq, and, desc, isNull, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../database/drizzle.module';
import { manuals, users, manualReactions, comments } from '../../../../../packages/db/src/schema';
import type { CreateManualDto, UpdateManualDto } from './dto/create-manual.dto';

@Injectable()
export class ManualsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDb) {}

  async findBySlug(slug: string) {
    const [manual] = await this.db
      .select()
      .from(manuals)
      .where(eq(manuals.slug, slug))
      .limit(1);
    return manual ?? null;
  }

  async findByUserId(userId: string) {
    const [manual] = await this.db
      .select()
      .from(manuals)
      .where(eq(manuals.userId, userId))
      .limit(1);
    return manual ?? null;
  }

  async listPublic(limit = 20, offset = 0) {
    return this.db
      .select({
        id:            manuals.id,
        slug:          manuals.slug,
        title:         manuals.title,
        tagline:       manuals.tagline,
        coverUrl:      manuals.coverUrl,
        themeColor:    manuals.themeColor,
        completionPct: manuals.completionPct,
        viewCount:     manuals.viewCount,
        publishedAt:   manuals.publishedAt,
        user: {
          id:          users.id,
          username:    users.username,
          displayName: users.displayName,
          avatarUrl:   users.avatarUrl,
        },
      })
      .from(manuals)
      .leftJoin(users, eq(manuals.userId, users.id))
      .where(and(eq(manuals.isPublished, true), eq(manuals.visibility, 'public')))
      .orderBy(desc(manuals.viewCount))
      .limit(limit)
      .offset(offset);
  }

  async create(userId: string, dto: CreateManualDto, displayName?: string) {
    const slug = await this.generateSlug(displayName ?? 'my-manual', userId);

    const [manual] = await this.db
      .insert(manuals)
      .values({
        userId,
        slug,
        title:       dto.title ?? `My Manual`,
        tagline:     dto.tagline,
        visibility:  (dto.visibility as any) ?? 'public',
        themePreset: dto.themePreset ?? 'purple_dream',
        themeColor:  dto.themeColor ?? '#6366F1',
      })
      .returning();

    return manual;
  }

  async update(manualId: string, userId: string, dto: UpdateManualDto) {
    await this.assertOwner(manualId, userId);
    const [updated] = await this.db
      .update(manuals)
      .set({ ...dto, visibility: dto.visibility as any, updatedAt: new Date() })
      .where(eq(manuals.id, manualId))
      .returning();
    return updated;
  }

  async publish(manualId: string, userId: string) {
    await this.assertOwner(manualId, userId);
    const [updated] = await this.db
      .update(manuals)
      .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(manuals.id, manualId))
      .returning();
    return updated;
  }

  async unpublish(manualId: string, userId: string) {
    await this.assertOwner(manualId, userId);
    const [updated] = await this.db
      .update(manuals)
      .set({ isPublished: false, updatedAt: new Date() })
      .where(eq(manuals.id, manualId))
      .returning();
    return updated;
  }

  async delete(manualId: string, userId: string) {
    await this.assertOwner(manualId, userId);
    await this.db.delete(manuals).where(eq(manuals.id, manualId));
  }

  async incrementView(manualId: string) {
    await this.db
      .update(manuals)
      .set({ viewCount: sql`${manuals.viewCount} + 1` })
      .where(eq(manuals.id, manualId));
  }

  async addReaction(manualId: string, userId: string, type: string) {
    await this.db
      .insert(manualReactions)
      .values({ manualId, userId, type: type as any })
      .onConflictDoNothing();
  }

  async removeReaction(manualId: string, userId: string, type: string) {
    await this.db
      .delete(manualReactions)
      .where(
        and(
          eq(manualReactions.manualId, manualId),
          eq(manualReactions.userId, userId),
          eq(manualReactions.type, type as any),
        ),
      );
  }

  async getReactions(manualId: string) {
    return this.db
      .select()
      .from(manualReactions)
      .where(eq(manualReactions.manualId, manualId));
  }

  async getComments(manualId: string) {
    return this.db
      .select({
        id:        comments.id,
        content:   comments.content,
        parentId:  comments.parentId,
        createdAt: comments.createdAt,
        isEdited:  comments.isEdited,
        user: {
          id:          users.id,
          username:    users.username,
          displayName: users.displayName,
          avatarUrl:   users.avatarUrl,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.manualId, manualId), isNull(comments.deletedAt)))
      .orderBy(comments.createdAt);
  }

  async addComment(manualId: string, userId: string, content: string, parentId?: string) {
    const [comment] = await this.db
      .insert(comments)
      .values({ manualId, userId, content, parentId })
      .returning();
    return comment;
  }

  private async assertOwner(manualId: string, userId: string) {
    const [manual] = await this.db
      .select({ userId: manuals.userId })
      .from(manuals)
      .where(eq(manuals.id, manualId))
      .limit(1);

    if (!manual) throw new NotFoundException('Manual not found');
    if (manual.userId !== userId) throw new ForbiddenException('Not your manual');
  }

  private async generateSlug(base: string, userId: string): Promise<string> {
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    const existing = await this.db
      .select({ slug: manuals.slug })
      .from(manuals)
      .where(eq(manuals.slug, slug))
      .limit(1);

    if (existing.length === 0) return slug;
    return `${slug}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
}
