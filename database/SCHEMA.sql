-- =============================================================
-- HUMAN MANUAL — COMPLETE DATABASE SCHEMA
-- PostgreSQL 16 | Drizzle ORM compatible
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- composite indexes
CREATE EXTENSION IF NOT EXISTS "citext";           -- case-insensitive text

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
CREATE TYPE user_role         AS ENUM ('super_admin','company_admin','employee','individual','friend_circle_owner');
CREATE TYPE auth_provider     AS ENUM ('email','google','microsoft','apple','linkedin');
CREATE TYPE visibility        AS ENUM ('public','private','friends','company','department','team','group','password','invite');
CREATE TYPE media_type        AS ENUM ('image','gif','meme','video','audio','document');
CREATE TYPE section_type      AS ENUM (
  'basic_info','about_me','my_story','work_with_me','strengths','weaknesses',
  'things_love','things_hate','fun_facts','quotes','goals','skills',
  'hobbies','travel','books','movies','games','music','memes','gifs',
  'photos','videos','voice_notes','personality','custom'
);
CREATE TYPE reaction_type     AS ENUM ('like','love','fire','clap','laugh','wow','sad','hug');
CREATE TYPE badge_type        AS ENUM ('profile_complete','first_manual','social_butterfly','storyteller','culture_champion','media_master','ai_powered','streak_7','streak_30','top_contributor');
CREATE TYPE notification_type AS ENUM ('like','comment','follow','friend_request','mention','achievement','spotlight','birthday','new_joiner','reaction');
CREATE TYPE org_plan          AS ENUM ('starter','growth','enterprise','custom');
CREATE TYPE challenge_type    AS ENUM ('profile_completion','culture','social','media','learning');
CREATE TYPE personality_system AS ENUM ('mbti','big_five','enneagram','disc','custom');

-- ─────────────────────────────────────────────────────────────
-- TENANTS (Organizations)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,                          -- e.g. "TechCorp Inc."
  slug              CITEXT UNIQUE NOT NULL,                         -- e.g. "techcorp"
  domain            VARCHAR(255),                                   -- e.g. "techcorp.com"
  logo_url          TEXT,
  cover_url         TEXT,
  industry          VARCHAR(100),                                   -- e.g. "Software & Technology"
  company_size      VARCHAR(50),                                    -- e.g. "51-200"
  website           TEXT,
  description       TEXT,
  plan              org_plan NOT NULL DEFAULT 'starter',
  is_verified       BOOLEAN DEFAULT FALSE,
  settings          JSONB DEFAULT '{}',                             -- feature flags, branding, etc.
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- Example row:
-- ('uuid', 'TechCorp Inc.', 'techcorp', 'techcorp.com', 'https://s3.../logo.png', null, 'Software & Technology', '51-200', 'https://techcorp.com', 'We build the future.', 'growth', true, '{"ai_enabled": true, "max_users": 500}', NOW(), NOW(), null)

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID REFERENCES tenants(id) ON DELETE SET NULL,
  email             CITEXT UNIQUE NOT NULL,                         -- e.g. "asim@techcorp.com"
  email_verified    BOOLEAN DEFAULT FALSE,
  username          CITEXT UNIQUE,                                  -- e.g. "asim_saleem"
  display_name      VARCHAR(255),                                   -- e.g. "Asim Saleem"
  first_name        VARCHAR(100),                                   -- e.g. "Asim"
  last_name         VARCHAR(100),                                   -- e.g. "Saleem"
  avatar_url        TEXT,                                           -- e.g. "https://cdn.humanmanual.app/avatars/uuid.jpg"
  cover_url         TEXT,
  bio               TEXT,                                           -- short bio, max 280 chars
  role              user_role NOT NULL DEFAULT 'individual',
  is_active         BOOLEAN DEFAULT TRUE,
  is_suspended      BOOLEAN DEFAULT FALSE,
  last_seen_at      TIMESTAMPTZ,
  onboarding_step   INTEGER DEFAULT 0,                              -- 0-5 onboarding steps
  locale            VARCHAR(10) DEFAULT 'en',
  timezone          VARCHAR(50) DEFAULT 'UTC',
  settings          JSONB DEFAULT '{}',                             -- notification prefs, theme, etc.
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_users_tenant      ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email       ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username    ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_display_trgm ON users USING gin(display_name gin_trgm_ops);

-- Example row:
-- id: 'a1b2c3d4-...', tenant_id: 'uuid', email: 'asim@techcorp.com', username: 'asim_saleem',
-- display_name: 'Asim Saleem', first_name: 'Asim', last_name: 'Saleem',
-- avatar_url: 'https://cdn.humanmanual.app/avatars/asim.jpg', role: 'employee',
-- settings: '{"theme":"dark","email_notifications":true,"ai_suggestions":true}'

-- ─────────────────────────────────────────────────────────────
-- AUTH — IDENTITIES & SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE auth_identities (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          auth_provider NOT NULL,
  provider_user_id  VARCHAR(255) NOT NULL,                          -- e.g. Google sub "1187364..."
  access_token      TEXT,
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  raw_profile       JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(512) UNIQUE NOT NULL,                       -- bcrypt hash of token
  device_info   JSONB DEFAULT '{}',                                 -- {"ua":"Chrome/120","ip":"1.2.3.4"}
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_credentials (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(512) NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- DEPARTMENTS & TEAMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,                              -- e.g. "Engineering"
  slug          CITEXT NOT NULL,                                    -- e.g. "engineering"
  description   TEXT,
  head_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  icon          VARCHAR(50),                                        -- emoji or icon key
  color         VARCHAR(7),                                         -- e.g. "#6366F1"
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Example: Engineering, Product, Design, Marketing, Sales, HR, Finance, Operations

CREATE TABLE teams (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,                            -- e.g. "Backend Team"
  slug            CITEXT NOT NULL,
  description     TEXT,
  lead_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, slug)
);

CREATE TABLE team_members (
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(50) DEFAULT 'member',                       -- 'lead', 'member', 'contributor'
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(team_id, user_id)
);

CREATE TABLE department_members (
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(department_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- FRIEND CIRCLES (Private Groups)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE friend_circles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,                              -- e.g. "Weekend Crew"
  description   TEXT,
  avatar_url    TEXT,
  is_private    BOOLEAN DEFAULT TRUE,
  invite_code   VARCHAR(20) UNIQUE,                                 -- random 8-char code
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE friend_circle_members (
  circle_id     UUID NOT NULL REFERENCES friend_circles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(20) DEFAULT 'member',                       -- 'owner', 'admin', 'member'
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(circle_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- MANUALS (Core Entity)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE manuals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
  title           VARCHAR(255) DEFAULT 'My Manual',                 -- e.g. "Asim's Manual"
  tagline         VARCHAR(255),                                     -- e.g. "Builder. Dreamer. Coffee Addict."
  cover_url       TEXT,
  theme_color     VARCHAR(7) DEFAULT '#6366F1',                     -- primary accent color
  theme_preset    VARCHAR(50) DEFAULT 'purple_dream',               -- named theme preset
  visibility      visibility NOT NULL DEFAULT 'public',
  password_hash   VARCHAR(512),                                     -- for password-protected manuals
  custom_domain   VARCHAR(255),                                     -- e.g. "asim.me"
  slug            CITEXT UNIQUE NOT NULL,                           -- e.g. "asim-saleem"
  view_count      BIGINT DEFAULT 0,
  completion_pct  SMALLINT DEFAULT 0,                               -- 0–100
  is_published    BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  seo_title       VARCHAR(255),
  seo_description TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manuals_user    ON manuals(user_id);
CREATE INDEX idx_manuals_tenant  ON manuals(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_manuals_slug    ON manuals(slug);
CREATE INDEX idx_manuals_public  ON manuals(visibility, is_published) WHERE is_published = TRUE;

-- ─────────────────────────────────────────────────────────────
-- MANUAL SECTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE manual_sections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manual_id       UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  section_type    section_type NOT NULL,
  title           VARCHAR(255),                                     -- e.g. "How To Work With Me"
  subtitle        VARCHAR(255),
  position        SMALLINT NOT NULL DEFAULT 0,                      -- drag-and-drop ordering
  is_visible      BOOLEAN DEFAULT TRUE,
  visibility      visibility DEFAULT 'public',
  settings        JSONB DEFAULT '{}',                               -- per-section display config
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_manual ON manual_sections(manual_id, position);

-- ─────────────────────────────────────────────────────────────
-- SECTION: BASIC INFO
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_basic_info (
  section_id        UUID PRIMARY KEY REFERENCES manual_sections(id) ON DELETE CASCADE,
  full_name         VARCHAR(255),                                   -- e.g. "Asim Saleem"
  nickname          VARCHAR(100),                                   -- e.g. "Sim"
  pronouns          VARCHAR(50),                                    -- e.g. "he/him"
  birth_date        DATE,
  location_city     VARCHAR(100),                                   -- e.g. "Lahore"
  location_country  VARCHAR(100),                                   -- e.g. "Pakistan"
  location_coords   POINT,                                         -- for map
  occupation        VARCHAR(255),                                   -- e.g. "Senior Software Engineer"
  company           VARCHAR(255),                                   -- e.g. "TechCorp"
  website           TEXT,
  linkedin_url      TEXT,
  github_url        TEXT,
  twitter_url       TEXT,
  instagram_url     TEXT
);

-- ─────────────────────────────────────────────────────────────
-- SECTION: ABOUT ME (Rich Text)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_about_me (
  section_id    UUID PRIMARY KEY REFERENCES manual_sections(id) ON DELETE CASCADE,
  content       TEXT,                                              -- TipTap/ProseMirror JSON or HTML
  word_count    INTEGER DEFAULT 0
);

-- Example content: "I'm a software engineer who builds products that matter. I love clean code,
-- strong coffee, and good books. I grew up in Lahore and moved to Dubai chasing ambitious ideas."

-- ─────────────────────────────────────────────────────────────
-- SECTION: MY STORY (Timeline)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_story_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id    UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  year          SMALLINT NOT NULL,                                  -- e.g. 2018
  month         SMALLINT,                                          -- 1-12, optional
  title         VARCHAR(255) NOT NULL,                             -- e.g. "Joined TechCorp"
  description   TEXT,                                              -- e.g. "Started as intern, built the auth system in 3 weeks"
  icon          VARCHAR(50),                                       -- emoji or icon key
  color         VARCHAR(7),                                        -- e.g. "#10B981"
  media_url     TEXT,
  position      SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Examples:
-- 2010: "Born in Lahore, Pakistan" 🌍
-- 2015: "Won first hackathon" 🏆
-- 2018: "Started CS degree at FAST-NUCES" 🎓
-- 2020: "Built my first SaaS — failed, but learned everything" 💡
-- 2022: "Joined TechCorp as Backend Engineer" 💼
-- 2024: "Promoted to Tech Lead" 🚀

-- ─────────────────────────────────────────────────────────────
-- SECTION: HOW TO WORK WITH ME
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_work_style (
  section_id              UUID PRIMARY KEY REFERENCES manual_sections(id) ON DELETE CASCADE,
  communication_style     VARCHAR(100),                            -- e.g. "Direct & concise"
  meeting_preference      VARCHAR(100),                            -- e.g. "Async first, calls when needed"
  feedback_style          VARCHAR(100),                            -- e.g. "Radical candor — be blunt"
  peak_hours              VARCHAR(100),                            -- e.g. "9am–1pm, then 8pm–11pm"
  response_time           VARCHAR(100),                            -- e.g. "Replies within 2 hours on Slack"
  do_not_disturb          VARCHAR(100),                            -- e.g. "2pm–4pm (deep work block)"
  collaboration_style     VARCHAR(100),                            -- e.g. "Love pair programming"
  decision_making         VARCHAR(100),                            -- e.g. "Data-driven, bias toward action"
  conflict_resolution     VARCHAR(100),                            -- e.g. "Address it immediately, privately"
  preferred_tools         TEXT[],                                  -- e.g. ['Slack','Notion','Figma']
  work_location           VARCHAR(50),                             -- e.g. "Hybrid"
  timezone_note           TEXT,                                    -- e.g. "PKT (UTC+5), flexible for calls"
  custom_tips             JSONB DEFAULT '[]'                       -- array of custom tips
);

-- ─────────────────────────────────────────────────────────────
-- SECTION: STRENGTHS & WEAKNESSES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_strengths (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  title       VARCHAR(100) NOT NULL,                               -- e.g. "System Thinking"
  description TEXT,                                               -- e.g. "I can see how complex parts interact"
  icon        VARCHAR(50),                                        -- emoji: "🧠"
  color       VARCHAR(7),                                         -- e.g. "#6366F1"
  position    SMALLINT DEFAULT 0
);

-- Example strengths: System Thinking 🧠, Fast Learner ⚡, Empathy 💛, Leadership 🎯, Problem Solving 🔍

CREATE TABLE section_weaknesses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  title       VARCHAR(100) NOT NULL,                               -- e.g. "Perfectionism"
  description TEXT,                                               -- e.g. "Sometimes I over-engineer solutions"
  icon        VARCHAR(50),
  growth_note TEXT,                                               -- e.g. "Working on shipping MVPs faster"
  position    SMALLINT DEFAULT 0
);

-- Example weaknesses: Perfectionism 🎯, Over-committing 📋, Impatience ⚡, Public Speaking 🎤

-- ─────────────────────────────────────────────────────────────
-- SECTION: THINGS I LOVE / HATE (Interests)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_interests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,                               -- e.g. "Specialty Coffee"
  emoji       VARCHAR(10),                                        -- e.g. "☕"
  is_love     BOOLEAN NOT NULL DEFAULT TRUE,                       -- TRUE = love, FALSE = hate
  position    SMALLINT DEFAULT 0
);

-- Love examples: Specialty Coffee ☕, Dark Mode 🌙, Clean Code 🧹, Hiking 🥾, Sushi 🍣
-- Hate examples: Meetings without agendas 😤, Slow Wi-Fi 📶, Micromanagement 🙅

-- ─────────────────────────────────────────────────────────────
-- SECTION: FUN FACTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_fun_facts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  fact        TEXT NOT NULL,                                       -- e.g. "I type at 120 WPM"
  emoji       VARCHAR(10),
  position    SMALLINT DEFAULT 0
);

-- Examples:
-- ⌨️ "I type at 120 WPM"
-- 🎸 "I taught myself guitar in 30 days"
-- 🌍 "I've visited 14 countries before 30"
-- 🧩 "I can solve a Rubik's cube in under 2 minutes"
-- 🦷 "I've never had a cavity"

-- ─────────────────────────────────────────────────────────────
-- SECTION: QUOTES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_quotes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  quote       TEXT NOT NULL,                                       -- e.g. "Stay hungry, stay foolish."
  author      VARCHAR(255),                                        -- e.g. "Steve Jobs"
  source      VARCHAR(255),                                        -- e.g. "Stanford Commencement 2005"
  position    SMALLINT DEFAULT 0
);

-- Examples:
-- "The best way to predict the future is to create it." — Abraham Lincoln
-- "Move fast and break things." — Mark Zuckerberg
-- "Simplicity is the ultimate sophistication." — Leonardo da Vinci

-- ─────────────────────────────────────────────────────────────
-- SECTION: GOALS & MILESTONES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id      UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,                           -- e.g. "Build a $1M ARR SaaS"
  description     TEXT,
  category        VARCHAR(50),                                     -- 'career','personal','health','financial','travel'
  target_date     DATE,
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  progress_pct    SMALLINT DEFAULT 0,                              -- 0–100
  emoji           VARCHAR(10),
  position        SMALLINT DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────
-- SECTION: SKILLS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,                               -- e.g. "TypeScript"
  category    VARCHAR(50),                                         -- e.g. "Frontend"
  level       SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),    -- 1=beginner, 5=expert
  years_exp   SMALLINT,                                           -- e.g. 4
  icon_url    TEXT,
  color       VARCHAR(7),
  position    SMALLINT DEFAULT 0
);

-- Examples:
-- TypeScript (Frontend), level 5, 4 years
-- NestJS (Backend), level 4, 3 years
-- PostgreSQL (Database), level 4, 5 years
-- AWS (Cloud), level 3, 2 years
-- Flutter (Mobile), level 3, 1 year
-- System Design, level 4, 3 years

-- ─────────────────────────────────────────────────────────────
-- SECTION: TRAVEL HISTORY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_travel (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  country     VARCHAR(100) NOT NULL,                               -- e.g. "Japan"
  city        VARCHAR(100),                                        -- e.g. "Tokyo"
  year        SMALLINT,                                           -- e.g. 2023
  note        TEXT,                                               -- e.g. "Cherry blossom season — surreal"
  photo_url   TEXT,
  lat         DECIMAL(9,6),
  lng         DECIMAL(9,6),
  position    SMALLINT DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────
-- SECTION: MEDIA LIBRARIES (Books, Movies, Games)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_media_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id    UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  media_kind    VARCHAR(20) NOT NULL,                              -- 'book','movie','game','show'
  title         VARCHAR(255) NOT NULL,                             -- e.g. "The Pragmatic Programmer"
  author        VARCHAR(255),                                      -- e.g. "Andrew Hunt"
  cover_url     TEXT,
  year          SMALLINT,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  note          TEXT,                                             -- e.g. "Changed how I think about software"
  external_url  TEXT,                                             -- IMDB, Goodreads, etc.
  genre         VARCHAR(100),
  position      SMALLINT DEFAULT 0
);

-- Book examples: "The Pragmatic Programmer", "Clean Code", "Atomic Habits", "Shoe Dog"
-- Movie examples: "Interstellar", "The Social Network", "Parasite", "Inception"
-- Game examples: "The Last of Us", "Minecraft", "Age of Empires II", "Chess"

-- ─────────────────────────────────────────────────────────────
-- SECTION: MUSIC
-- ─────────────────────────────────────────────────────────────
CREATE TABLE section_music (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id      UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  source          VARCHAR(20) NOT NULL,                            -- 'spotify','youtube_music','apple_music','custom'
  track_id        VARCHAR(255),                                    -- platform track ID
  title           VARCHAR(255),                                    -- e.g. "Bohemian Rhapsody"
  artist          VARCHAR(255),                                    -- e.g. "Queen"
  album           VARCHAR(255),
  cover_url       TEXT,
  embed_url       TEXT,                                           -- embed iframe URL
  genre           VARCHAR(100),
  note            TEXT,                                           -- e.g. "Always on during deep work"
  position        SMALLINT DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────
-- PERSONALITY PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE personality_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id      UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  system          personality_system NOT NULL DEFAULT 'mbti',
  type_code       VARCHAR(20),                                     -- e.g. "INTJ", "Type 5", "D-style"
  type_name       VARCHAR(100),                                    -- e.g. "The Architect"
  description     TEXT,
  traits          JSONB DEFAULT '[]',                             -- ["strategic","independent","analytical"]
  strengths       JSONB DEFAULT '[]',                             -- ["long-term thinking","pattern recognition"]
  weaknesses      JSONB DEFAULT '[]',                             -- ["arrogance","perfectionism"]
  result_url      TEXT,                                           -- link to external test result
  screenshot_url  TEXT,                                           -- uploaded screenshot
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Example MBTI INTJ:
-- type_code: "INTJ", type_name: "The Architect"
-- traits: ["strategic","independent","analytical","decisive"]
-- strengths: ["long-term thinking","pattern recognition","self-confidence"]
-- weaknesses: ["arrogance","dismissiveness","perfectionism"]

-- ─────────────────────────────────────────────────────────────
-- MEDIA ASSETS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
  section_id      UUID REFERENCES manual_sections(id) ON DELETE SET NULL,
  media_type      media_type NOT NULL,
  original_url    TEXT NOT NULL,                                   -- S3 original URL
  cdn_url         TEXT,                                           -- CloudFront URL
  thumbnail_url   TEXT,
  filename        VARCHAR(255) NOT NULL,
  mime_type       VARCHAR(100),
  file_size       BIGINT,                                         -- bytes
  width           INTEGER,
  height          INTEGER,
  duration_secs   DECIMAL(10,2),                                  -- for video/audio
  alt_text        TEXT,
  caption         TEXT,
  giphy_id        VARCHAR(100),                                   -- for Giphy GIFs
  metadata        JSONB DEFAULT '{}',
  position        SMALLINT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_user    ON media_assets(user_id);
CREATE INDEX idx_media_section ON media_assets(section_id) WHERE section_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- SOCIAL: FOLLOWS & FRIENDS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE follows (
  follower_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);

CREATE TABLE friend_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          VARCHAR(20) DEFAULT 'pending',                   -- 'pending','accepted','rejected','blocked'
  message         TEXT,                                           -- optional request note
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,
  UNIQUE(from_user_id, to_user_id)
);

-- ─────────────────────────────────────────────────────────────
-- SOCIAL: REACTIONS & COMMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE manual_reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manual_id   UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        reaction_type NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manual_id, user_id, type)
);

CREATE TABLE section_reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        reaction_type NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, user_id, type)
);

CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manual_id     UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  section_id    UUID REFERENCES manual_sections(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES comments(id) ON DELETE CASCADE,    -- threaded comments
  content       TEXT NOT NULL,
  is_edited     BOOLEAN DEFAULT FALSE,
  edited_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_comments_manual  ON comments(manual_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_section ON comments(section_id) WHERE section_id IS NOT NULL AND deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────
-- BOOKMARKS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE bookmarks (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manual_id   UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, manual_id)
);

-- ─────────────────────────────────────────────────────────────
-- GAMIFICATION
-- ─────────────────────────────────────────────────────────────
CREATE TABLE user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type  badge_type NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

CREATE TABLE user_points (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points  INTEGER DEFAULT 0,
  level         SMALLINT DEFAULT 1,
  streak_days   SMALLINT DEFAULT 0,
  last_active   DATE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,    -- NULL = global challenge
  title         VARCHAR(255) NOT NULL,                            -- e.g. "Complete Your Story Section"
  description   TEXT,
  type          challenge_type NOT NULL,
  points_reward INTEGER DEFAULT 10,
  badge_reward  badge_type,
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_challenge_progress (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id  UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  is_completed  BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  PRIMARY KEY(user_id, challenge_id)
);

-- ─────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  actor_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  manual_id       UUID REFERENCES manuals(id) ON DELETE CASCADE,
  section_id      UUID REFERENCES manual_sections(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  metadata        JSONB DEFAULT '{}',
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = FALSE;

-- ─────────────────────────────────────────────────────────────
-- AI GENERATIONS LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ai_generations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manual_id     UUID REFERENCES manuals(id) ON DELETE SET NULL,
  feature       VARCHAR(100) NOT NULL,                             -- 'bio','strengths','work_style','icebreaker'
  prompt        TEXT,
  result        TEXT,
  model         VARCHAR(100),                                      -- e.g. "claude-sonnet-4-6"
  tokens_used   INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE analytics_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manual_id     UUID REFERENCES manuals(id) ON DELETE CASCADE,
  section_id    UUID REFERENCES manual_sections(id) ON DELETE CASCADE,
  viewer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type    VARCHAR(50) NOT NULL,                              -- 'view','scroll','section_view','share','click'
  referrer      TEXT,
  device_type   VARCHAR(20),                                       -- 'desktop','mobile','tablet'
  country       VARCHAR(2),                                        -- ISO country code
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Partition by month
CREATE TABLE analytics_events_2025_01 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
-- ... more partitions

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,                               -- 'user.created','manual.published','section.deleted'
  entity_type VARCHAR(50),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- ─────────────────────────────────────────────────────────────
-- MANUAL TEMPLATES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE manual_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL = global template
  name            VARCHAR(255) NOT NULL,                           -- e.g. "Engineering Onboarding"
  description     TEXT,
  thumbnail_url   TEXT,
  structure       JSONB NOT NULL DEFAULT '[]',                     -- default sections config
  is_public       BOOLEAN DEFAULT FALSE,
  usage_count     INTEGER DEFAULT 0,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- MENTION INDEX (for @mentions in content)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE mentions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentioned_user  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
