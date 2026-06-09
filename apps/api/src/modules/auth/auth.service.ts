import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../database/drizzle.module';
import { users } from '../../../../../packages/db/src/schema';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDb) {}

  /**
   * Called on every authenticated request.
   * If the Firebase user doesn't exist in our DB yet, creates a record.
   * Returns the DB user row.
   */
  async syncUser(token: DecodedIdToken) {
    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, token.uid))
      .limit(1);

    if (existing.length > 0) return existing[0];

    const username = await this.generateUsername(
      token.name ?? token.email?.split('@')[0] ?? 'user',
    );

    const [created] = await this.db
      .insert(users)
      .values({
        firebaseUid:   token.uid,
        email:         token.email ?? '',
        emailVerified: token.email_verified ?? false,
        displayName:   token.name ?? null,
        avatarUrl:     token.picture ?? null,
        username,
        role:          'individual',
      })
      .returning();

    return created;
  }

  private async generateUsername(base: string): Promise<string> {
    // Slugify: lowercase, replace spaces/special chars with underscore
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);

    // Check for collision, append random suffix if needed
    const existing = await this.db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, slug))
      .limit(1);

    if (existing.length === 0) return slug;
    return `${slug}_${Math.floor(Math.random() * 9000 + 1000)}`;
  }
}
