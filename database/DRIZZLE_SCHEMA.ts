// =============================================================
// HUMAN MANUAL — DRIZZLE ORM SCHEMA (TypeScript)
// PostgreSQL + Drizzle ORM
// =============================================================

import {
  pgTable, pgEnum, uuid, varchar, text, boolean, timestamp,
  integer, smallint, bigint, jsonb, citext, date, decimal,
  point, inet, index, uniqueIndex, primaryKey, pgSchema,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', [
  'super_admin', 'company_admin', 'employee', 'individual', 'friend_circle_owner',
]);

export const authProviderEnum = pgEnum('auth_provider', [
  'email', 'google', 'microsoft', 'apple', 'linkedin',
]);

export const visibilityEnum = pgEnum('visibility', [
  'public', 'private', 'friends', 'company', 'department', 'team', 'group', 'password', 'invite',
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'image', 'gif', 'meme', 'video', 'audio', 'document',
]);

export const sectionTypeEnum = pgEnum('section_type', [
  'basic_info', 'about_me', 'my_story', 'work_with_me', 'strengths', 'weaknesses',
  'things_love', 'things_hate', 'fun_facts', 'quotes', 'goals', 'skills',
  'hobbies', 'travel', 'books', 'movies', 'games', 'music', 'memes', 'gifs',
  'photos', 'videos', 'voice_notes', 'personality', 'custom',
]);

export const reactionTypeEnum = pgEnum('reaction_type', [
  'like', 'love', 'fire', 'clap', 'laugh', 'wow', 'sad', 'hug',
]);

export const orgPlanEnum = pgEnum('org_plan', [
  'starter', 'growth', 'enterprise', 'custom',
]);

export const personalitySystemEnum = pgEnum('personality_system', [
  'mbti', 'big_five', 'enneagram', 'disc', 'custom',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'like', 'comment', 'follow', 'friend_request', 'mention',
  'achievement', 'spotlight', 'birthday', 'new_joiner', 'reaction',
]);

// ─────────────────────────────────────────────────────────────
// TENANTS
// ─────────────────────────────────────────────────────────────
export const tenants = pgTable('tenants', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 255 }).notNull(),
  slug:        citext('slug').unique().notNull(),
  domain:      varchar('domain', { length: 255 }),
  logoUrl:     text('logo_url'),
  coverUrl:    text('cover_url'),
  industry:    varchar('industry', { length: 100 }),
  companySize: varchar('company_size', { length: 50 }),
  website:     text('website'),
  description: text('description'),
  plan:        orgPlanEnum('plan').notNull().default('starter'),
  isVerified:  boolean('is_verified').default(false),
  settings:    jsonb('settings').default({}),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt:   timestamp('deleted_at', { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  tenantId:       uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  email:          citext('email').unique().notNull(),
  emailVerified:  boolean('email_verified').default(false),
  username:       citext('username').unique(),
  displayName:    varchar('display_name', { length: 255 }),
  firstName:      varchar('first_name', { length: 100 }),
  lastName:       varchar('last_name', { length: 100 }),
  avatarUrl:      text('avatar_url'),
  coverUrl:       text('cover_url'),
  bio:            text('bio'),
  role:           userRoleEnum('role').notNull().default('individual'),
  isActive:       boolean('is_active').default(true),
  isSuspended:    boolean('is_suspended').default(false),
  lastSeenAt:     timestamp('last_seen_at', { withTimezone: true }),
  onboardingStep: integer('onboarding_step').default(0),
  locale:         varchar('locale', { length: 10 }).default('en'),
  timezone:       varchar('timezone', { length: 50 }).default('UTC'),
  settings:       jsonb('settings').default({}),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt:      timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  tenantIdx:       index('idx_users_tenant').on(table.tenantId),
  emailIdx:        uniqueIndex('idx_users_email').on(table.email),
  usernameIdx:     uniqueIndex('idx_users_username').on(table.username),
}));

// ─────────────────────────────────────────────────────────────
// MANUALS
// ─────────────────────────────────────────────────────────────
export const manuals = pgTable('manuals', {
  id:            uuid('id').primaryKey().defaultRandom(),
  userId:        uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  tenantId:      uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  title:         varchar('title', { length: 255 }).default("My Manual"),
  tagline:       varchar('tagline', { length: 255 }),
  coverUrl:      text('cover_url'),
  themeColor:    varchar('theme_color', { length: 7 }).default('#6366F1'),
  themePreset:   varchar('theme_preset', { length: 50 }).default('purple_dream'),
  visibility:    visibilityEnum('visibility').notNull().default('public'),
  passwordHash:  varchar('password_hash', { length: 512 }),
  customDomain:  varchar('custom_domain', { length: 255 }),
  slug:          citext('slug').unique().notNull(),
  viewCount:     bigint('view_count', { mode: 'number' }).default(0),
  completionPct: smallint('completion_pct').default(0),
  isPublished:   boolean('is_published').default(false),
  isFeatured:    boolean('is_featured').default(false),
  seoTitle:      varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  publishedAt:   timestamp('published_at', { withTimezone: true }),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx:   index('idx_manuals_user').on(table.userId),
  tenantIdx: index('idx_manuals_tenant').on(table.tenantId),
  slugIdx:   uniqueIndex('idx_manuals_slug').on(table.slug),
}));

// ─────────────────────────────────────────────────────────────
// MANUAL SECTIONS
// ─────────────────────────────────────────────────────────────
export const manualSections = pgTable('manual_sections', {
  id:          uuid('id').primaryKey().defaultRandom(),
  manualId:    uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
  sectionType: sectionTypeEnum('section_type').notNull(),
  title:       varchar('title', { length: 255 }),
  subtitle:    varchar('subtitle', { length: 255 }),
  position:    smallint('position').notNull().default(0),
  isVisible:   boolean('is_visible').default(true),
  visibility:  visibilityEnum('visibility').default('public'),
  settings:    jsonb('settings').default({}),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  manualPositionIdx: index('idx_sections_manual_pos').on(table.manualId, table.position),
}));

// ─────────────────────────────────────────────────────────────
// DRIZZLE RELATIONS
// ─────────────────────────────────────────────────────────────
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  manuals: many(manuals),
  departments: many(departments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant:    one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  manual:    one(manuals, { fields: [users.id], references: [manuals.userId] }),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
}));

export const manualsRelations = relations(manuals, ({ one, many }) => ({
  user:     one(users, { fields: [manuals.userId], references: [users.id] }),
  tenant:   one(tenants, { fields: [manuals.tenantId], references: [tenants.id] }),
  sections: many(manualSections),
  reactions: many(manualReactions),
  comments: many(comments),
}));

// ─────────────────────────────────────────────────────────────
// DEPARTMENTS & TEAMS
// ─────────────────────────────────────────────────────────────
export const departments = pgTable('departments', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:       varchar('name', { length: 255 }).notNull(),
  slug:       citext('slug').notNull(),
  description: text('description'),
  headUserId: uuid('head_user_id').references(() => users.id, { onDelete: 'set null' }),
  icon:       varchar('icon', { length: 50 }),
  color:      varchar('color', { length: 7 }),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const teams = pgTable('teams', {
  id:           uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
  tenantId:     uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:         varchar('name', { length: 255 }).notNull(),
  slug:         citext('slug').notNull(),
  description:  text('description'),
  leadUserId:   uuid('lead_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// SOCIAL
// ─────────────────────────────────────────────────────────────
export const follows = pgTable('follows', {
  followerId:  uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.followerId, table.followingId] }),
}));

export const manualReactions = pgTable('manual_reactions', {
  id:        uuid('id').primaryKey().defaultRandom(),
  manualId:  uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      reactionTypeEnum('type').notNull().default('like'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const comments = pgTable('comments', {
  id:        uuid('id').primaryKey().defaultRandom(),
  manualId:  uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id').references(() => manualSections.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId:  uuid('parent_id'),
  content:   text('content').notNull(),
  isEdited:  boolean('is_edited').default(false),
  editedAt:  timestamp('edited_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────
// GAMIFICATION
// ─────────────────────────────────────────────────────────────
export const userPoints = pgTable('user_points', {
  userId:      uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  totalPoints: integer('total_points').default(0),
  level:       smallint('level').default(1),
  streakDays:  smallint('streak_days').default(0),
  lastActive:  date('last_active'),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:        notificationTypeEnum('type').notNull(),
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  manualId:    uuid('manual_id').references(() => manuals.id, { onDelete: 'cascade' }),
  title:       varchar('title', { length: 255 }).notNull(),
  body:        text('body'),
  metadata:    jsonb('metadata').default({}),
  isRead:      boolean('is_read').default(false),
  readAt:      timestamp('read_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  unreadIdx: index('idx_notif_unread').on(table.userId, table.isRead, table.createdAt),
}));
