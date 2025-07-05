-- ============================================
-- Enable extension for UUID generation
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Safe ENUM creation
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END
$$;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR,
  email VARCHAR NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  institution VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'guest',
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- DECISIONS
-- ============================================
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id UUID UNIQUE, -- ✅ UUID → fait le lien avec archive.id
  title TEXT NOT NULL,
  content TEXT,
  date DATE,
  jurisdiction VARCHAR,
  case_type VARCHAR,
  source VARCHAR NOT NULL DEFAULT 'judilibre',
  pdf_link TEXT, -- ✅ lien vers ton PDF
  public BOOLEAN DEFAULT TRUE,
  imported_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS decisions_index_0 ON decisions (date);
CREATE INDEX IF NOT EXISTS decisions_index_1 ON decisions (jurisdiction);

-- ============================================
-- ARCHIVES
-- ============================================
CREATE TABLE IF NOT EXISTS archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  date DATE,
  jurisdiction VARCHAR,
  location VARCHAR,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  file_path TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS archives_index_0 ON archives (user_id);
CREATE INDEX IF NOT EXISTS archives_index_1 ON archives (jurisdiction);

-- ============================================
-- NOTES
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR NOT NULL DEFAULT 'decision',
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR NOT NULL UNIQUE
);

CREATE UNIQUE INDEX IF NOT EXISTS tags_index_0 ON tags (label);

-- ============================================
-- DECISION_TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS decision_tags (
  decision_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (decision_id, tag_id),
  FOREIGN KEY (decision_id) REFERENCES decisions(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);
