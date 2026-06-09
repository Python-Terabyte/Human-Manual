import {
  Injectable, Inject, NotFoundException, ConflictException,
} from '@nestjs/common';
import { eq, ilike, isNull, and, or, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../database/drizzle.module';
import { users, manuals, follows } from '../../../../../packages/db/src/schema';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDb) {}

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return user ?? null;
  }

  async findByUsername(username: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)))
      .limit(1);
    return user ?? null;
  }

  async findByFirebaseUid(uid: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, uid))
      .limit(1);
    return user ?? null;
  }

  async update(userId: string, dto: UpdateUserDto) {
    // Check username uniqueness
    if (dto.username) {
      const conflict = await this.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.username, dto.username), isNull(users.deletedAt)))
        .limit(1);
      if (conflict.length > 0 && conflict[0].id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    const [updated] = await this.db
      .update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async getProfileWithStats(username: string) {
    const user = await this.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    // Get manual, follower count, following count in parallel
    const [manual, followerCount, followingCount] = await Promise.all([
      this.db
        .select({
          id: manuals.id,
          slug: manuals.slug,
          title: manuals.title,
          tagline: manuals.tagline,
          completionPct: manuals.completionPct,
          viewCount: manuals.viewCount,
          isPublished: manuals.isPublished,
        })
        .from(manuals)
        .where(eq(manuals.userId, user.id))
        .limit(1),

      this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(follows)
        .where(eq(follows.followingId, user.id)),

      this.db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(follows)
        .where(eq(follows.followerId, user.id)),
    ]);

    return {
      ...user,
      manual: manual[0] ?? null,
      stats: {
        followersCount: followerCount[0]?.count ?? 0,
        followingCount: followingCount[0]?.count ?? 0,
      },
    };
  }

  async searchUsers(query: string, limit = 20, offset = 0) {
    return this.db
      .select({
        id:          users.id,
        username:    users.username,
        displayName: users.displayName,
        avatarUrl:   users.avatarUrl,
        bio:         users.bio,
      })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          or(
            ilike(users.displayName, `%${query}%`),
            ilike(users.username,    `%${query}%`),
          ),
        ),
      )
      .limit(limit)
      .offset(offset);
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }
    await this.db
      .insert(follows)
      .values({ followerId, followingId })
      .onConflictDoNothing();
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId),
        ),
      );
  }

  async softDelete(userId: string) {
    await this.db
      .update(users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(users.id, userId));
  }
}
