import {
  pgTable, uuid, varchar, text, boolean, timestamp,
  bigint, smallint, jsonb, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { visibilityEnum, sectionTypeEnum } from './enums';
import { users } from './users';

export const manuals = pgTable(
  'manuals',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    userId:        uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    tenantId:      uuid('tenant_id'),
    title:         varchar('title', { length: 255 }).default('My Manual'),
    tagline:       varchar('tagline', { length: 255 }),
    coverUrl:      text('cover_url'),
    themeColor:    varchar('theme_color', { length: 7 }).default('#6366F1'),
    themePreset:   varchar('theme_preset', { length: 50 }).default('purple_dream'),
    visibility:    visibilityEnum('visibility').notNull().default('public'),
    slug:          varchar('slug', { length: 100 }).unique().notNull(),
    viewCount:     bigint('view_count', { mode: 'number' }).default(0),
    completionPct: smallint('completion_pct').default(0),
    isPublished:   boolean('is_published').default(false),
    isFeatured:    boolean('is_featured').default(false),
    seoTitle:      varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),
    publishedAt:   timestamp('published_at', { withTimezone: true }),
    createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx:   index('manuals_user_idx').on(t.userId),
    slugIdx:   uniqueIndex('manuals_slug_idx').on(t.slug),
    tenantIdx: index('manuals_tenant_idx').on(t.tenantId),
    publicIdx: index('manuals_public_idx').on(t.visibility, t.isPublished),
  }),
);

// ── Example row ──────────────────────────────────────────────────────────────
// id: 'b2c3-...', userId: 'a1b2-...', title: "Asim's Manual",
// tagline: "Builder. Dreamer. Coffee Addict.", slug: "asim-saleem",
// visibility: 'public', isPublished: true, completionPct: 87, viewCount: 1247

export const manualsRelations = relations(manuals, ({ one, many }) => ({
  user:      one(users, { fields: [manuals.userId], references: [users.id] }),
  sections:  many(manualSections),
  reactions: many(manualReactions),
  comments:  many(comments),
}));

export const manualSections = pgTable(
  'manual_sections',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    manualId:    uuid('manual_id').notNull().references(() => manuals.id, { onDelete: 'cascade' }),
    sectionType: sectionTypeEnum('section_type').notNull(),
    title:       varchar('title', { length: 255 }),
    subtitle:    varchar('subtitle', { length: 255 }),
    position:    smallint('position').notNull().default(0),
    isVisible:   boolean('is_visible').default(true),
    visibility:  visibilityEnum('visibility').default('public'),

    // All section content stored as JSONB — typed per section on the frontend
    // This avoids 24 separate tables and keeps the schema MVP-friendly.
    // TypeScript types enforce shape via SectionData union type.
    data:        jsonb('data').$type<SectionData>().default({}),

    createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    manualPosIdx: index('sections_manual_pos_idx').on(t.manualId, t.position),
  }),
);

export const manualSectionsRelations = relations(manualSections, ({ one, many }) => ({
  manual:    one(manuals, { fields: [manualSections.manualId], references: [manuals.id] }),
  reactions: many(sectionReactions),
}));

// Circular
import { manualReactions, sectionReactions, comments } from './social';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DATA TYPES — what goes in each section's `data` JSONB field
// ─────────────────────────────────────────────────────────────────────────────

export type BasicInfoData = {
  fullName?: string;          // "Asim Saleem"
  nickname?: string;          // "Sim"
  pronouns?: string;          // "he/him"
  locationCity?: string;      // "Lahore"
  locationCountry?: string;   // "Pakistan"
  occupation?: string;        // "Senior Software Engineer"
  company?: string;           // "TechCorp"
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
};

export type AboutMeData = {
  content?: string;           // Rich text HTML (sanitized server-side)
};

export type StoryEvent = {
  id: string;
  year: number;               // 2022
  month?: number;             // 6
  title: string;              // "Joined TechCorp"
  description?: string;
  emoji?: string;             // "💼"
  color?: string;             // "#6366F1"
};

export type MyStoryData = {
  events?: StoryEvent[];
};

export type WorkWithMeData = {
  communicationStyle?: string;  // "Direct & concise"
  meetingPreference?: string;   // "Async first"
  feedbackStyle?: string;       // "Radical candor"
  peakHours?: string;           // "9am–1pm (PKT)"
  responseTime?: string;        // "Within 2 hours on Slack"
  doNotDisturb?: string;        // "2pm–4pm deep work"
  preferredTools?: string[];    // ["Slack","Notion","Figma"]
  workLocation?: string;        // "Hybrid"
  timezoneNote?: string;
  customTips?: string[];
};

export type StrengthItem = { id: string; title: string; description?: string; emoji?: string; color?: string };
export type StrengthsData = { items?: StrengthItem[] };
export type WeaknessesData = { items?: Array<StrengthItem & { growthNote?: string }> };

export type InterestItem = { id: string; label: string; emoji?: string };
export type ThingsLoveData = { items?: InterestItem[] };
export type ThingsHateData = { items?: InterestItem[] };

export type FunFactsData = { facts?: Array<{ id: string; fact: string; emoji?: string }> };

export type QuotesData = { quotes?: Array<{ id: string; quote: string; author?: string; source?: string }> };

export type GoalsData = {
  goals?: Array<{
    id: string;
    title: string;
    description?: string;
    category?: 'career' | 'personal' | 'health' | 'financial' | 'travel';
    targetDate?: string;
    isCompleted?: boolean;
    progressPct?: number;
    emoji?: string;
  }>;
};

export type SkillItem = { id: string; name: string; category?: string; level: 1 | 2 | 3 | 4 | 5; yearsExp?: number };
export type SkillsData = { skills?: SkillItem[] };

export type PersonalityData = {
  system?: 'mbti' | 'big_five' | 'enneagram' | 'disc';
  typeCode?: string;            // "INTJ"
  typeName?: string;            // "The Architect"
  description?: string;
  traits?: string[];            // ["strategic","independent","analytical"]
  strengths?: string[];
  weaknesses?: string[];
  resultUrl?: string;
};

export type MediaItem = {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  year?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  externalUrl?: string;
  genre?: string;
};
export type BooksData  = { items?: MediaItem[] };
export type MoviesData = { items?: MediaItem[] };
export type GamesData  = { items?: MediaItem[] };

export type TravelData = {
  visits?: Array<{
    id: string;
    country: string;
    city?: string;
    year?: number;
    note?: string;
    photoUrl?: string;
    lat?: number;
    lng?: number;
  }>;
};

export type MusicData = {
  tracks?: Array<{
    id: string;
    source: 'spotify' | 'youtube' | 'apple_music' | 'custom';
    trackId?: string;
    title?: string;
    artist?: string;
    embedUrl?: string;
    note?: string;
  }>;
};

export type PhotosData = { items?: Array<{ id: string; url: string; caption?: string; alt?: string }> };
export type MemesData  = { items?: Array<{ id: string; url: string; caption?: string }> };
export type GifsData   = { items?: Array<{ id: string; giphyId: string; url: string; title?: string }> };

export type SectionData =
  | BasicInfoData
  | AboutMeData
  | MyStoryData
  | WorkWithMeData
  | StrengthsData
  | WeaknessesData
  | ThingsLoveData
  | ThingsHateData
  | FunFactsData
  | QuotesData
  | GoalsData
  | SkillsData
  | PersonalityData
  | BooksData
  | MoviesData
  | GamesData
  | TravelData
  | MusicData
  | PhotosData
  | MemesData
  | GifsData
  | Record<string, unknown>;
