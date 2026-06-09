import {
  pgTable, uuid, timestamp, text, boolean, primaryKey,
  index, uniqueIndex, varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { reactionTypeEnum } from './enums';
import { users } from './users';
import { manuals, manualSections } from './manuals';

export const follows = pgTable(
  'follows',
  {
    followerId:  uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk:           primaryKey({ columns: [t.followerId, t.followingId] }),
    followingIdx: index('follows_following_idx').on(t.followingId),
  }),
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower:  one(users, { fields: [follows.followerId],  references: [users.id], relationName: 'follower' }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: 'following' }),
}));

export const manualReactions = pgTable(
  'manual_reactions',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    manualId:  uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:      reactionTypeEnum('type').notNull().default('like'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unique:    uniqueIndex('manual_reactions_unique').on(t.manualId, t.userId, t.type),
    manualIdx: index('manual_reactions_manual_idx').on(t.manualId),
  }),
);

export const manualReactionsRelations = relations(manualReactions, ({ one }) => ({
  manual: one(manuals, { fields: [manualReactions.manualId], references: [manuals.id] }),
  user:   one(users,   { fields: [manualReactions.userId],   references: [users.id] }),
}));

export const sectionReactions = pgTable(
  'section_reactions',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    sectionId: uuid('section_id').notNull().references(() => manualSections.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:      reactionTypeEnum('type').notNull().default('like'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unique: uniqueIndex('section_reactions_unique').on(t.sectionId, t.userId, t.type),
  }),
);

export const comments = pgTable(
  'comments',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    manualId:  uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
    sectionId: uuid('section_id').references(() => manualSections.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    parentId:  uuid('parent_id'),
    content:   text('content').notNull(),
    isEdited:  boolean('is_edited').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    manualIdx:  index('comments_manual_idx').on(t.manualId),
    sectionIdx: index('comments_section_idx').on(t.sectionId),
  }),
);

export const commentsRelations = relations(comments, ({ one }) => ({
  manual:  one(manuals, { fields: [comments.manualId], references: [manuals.id] }),
  user:    one(users,   { fields: [comments.userId],   references: [users.id] }),
  parent:  one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'replies' }),
}));

export const bookmarks = pgTable(
  'bookmarks',
  {
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    manualId:  uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.manualId] }),
  }),
);
