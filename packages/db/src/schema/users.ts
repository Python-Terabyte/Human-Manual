import {
  pgTable, uuid, varchar, text, boolean, timestamp,
  integer, smallint, jsonb, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userRoleEnum } from './enums';

export const users = pgTable(
  'users',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    firebaseUid:    varchar('firebase_uid', { length: 128 }).unique().notNull(),
    email:          varchar('email', { length: 255 }).unique().notNull(),
    emailVerified:  boolean('email_verified').default(false),
    username:       varchar('username', { length: 50 }).unique(),
    displayName:    varchar('display_name', { length: 255 }),
    firstName:      varchar('first_name', { length: 100 }),
    lastName:       varchar('last_name', { length: 100 }),
    avatarUrl:      text('avatar_url'),
    coverUrl:       text('cover_url'),
    bio:            text('bio'),
    role:           userRoleEnum('role').notNull().default('individual'),
    tenantId:       uuid('tenant_id'),
    isActive:       boolean('is_active').default(true),
    onboardingStep: integer('onboarding_step').default(0),
    locale:         varchar('locale', { length: 10 }).default('en'),
    timezone:       varchar('timezone', { length: 50 }).default('UTC'),
    settings:       jsonb('settings').$type<Record<string, unknown>>().default({}),
    createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt:      timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    firebaseIdx: uniqueIndex('users_firebase_uid_idx').on(t.firebaseUid),
    emailIdx:    uniqueIndex('users_email_idx').on(t.email),
    usernameIdx: uniqueIndex('users_username_idx').on(t.username),
    tenantIdx:   index('users_tenant_idx').on(t.tenantId),
  }),
);

// ── Example row ──────────────────────────────────────────────────────────────
// id: 'a1b2-...', firebaseUid: 'xYzFirebase123', email: 'asim@techcorp.com',
// username: 'asim_saleem', displayName: 'Asim Saleem', role: 'individual'
// settings: { theme: 'dark', emailNotifications: true }

export const usersRelations = relations(users, ({ one, many }) => ({
  manual:    one(manuals, { fields: [users.id], references: [manuals.userId] }),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  reactions: many(manualReactions),
  comments:  many(comments),
}));

// Circular dependency resolved with lazy imports below
import { manuals } from './manuals';
import { follows, manualReactions, comments } from './social';
