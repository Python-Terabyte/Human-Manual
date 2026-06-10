-- Run this once against your PostgreSQL / Neon database
-- to add the invites table and its status enum.

CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'revoked');

CREATE TABLE IF NOT EXISTS invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email      VARCHAR(255) NOT NULL,
  to_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  message       TEXT,
  token         VARCHAR(64) UNIQUE NOT NULL,
  status        invite_status NOT NULL DEFAULT 'pending',
  expires_at    TIMESTAMPTZ NOT NULL,
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invites_token_idx     ON invites(token);
CREATE INDEX IF NOT EXISTS invites_from_user_idx ON invites(from_user_id);
CREATE INDEX IF NOT EXISTS invites_to_email_idx  ON invites(to_email);
