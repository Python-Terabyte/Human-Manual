import {
  pgTable, pgEnum, uuid, varchar, text,
  timestamp, index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'revoked',
]);

export const invites = pgTable(
  'invites',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    fromUserId: uuid('from_user_id')
                  .notNull()
                  .references(() => users.id, { onDelete: 'cascade' }),
    toEmail:    varchar('to_email', { length: 255 }).notNull(),
    toUserId:   uuid('to_user_id')
                  .references(() => users.id, { onDelete: 'set null' }),
    message:    text('message'),
    token:      varchar('token', { length: 64 }).unique().notNull(),
    status:     inviteStatusEnum('status').notNull().default('pending'),
    expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    tokenIdx:    index('invites_token_idx').on(t.token),
    fromUserIdx: index('invites_from_user_idx').on(t.fromUserId),
    toEmailIdx:  index('invites_to_email_idx').on(t.toEmail),
  }),
);

export const invitesRelations = relations(invites, ({ one }) => ({
  fromUser: one(users, { fields: [invites.fromUserId], references: [users.id] }),
  toUser:   one(users, { fields: [invites.toUserId],   references: [users.id] }),
}));
