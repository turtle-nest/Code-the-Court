-- Enable extension for UUID generation (required!)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'guest',
  status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- DECISIONS
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  date DATE,
  jurisdiction VARCHAR,
  source VARCHAR NOT NULL DEFAULT 'api',
  public BOOLEAN DEFAULT TRUE
);

CREATE INDEX decisions_index_0 ON decisions (date);
CREATE INDEX decisions_index_1 ON decisions (jurisdiction);

-- ARCHIVES
CREATE TABLE IF NOT EXISTS archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  date DATE,
  jurisdiction VARCHAR,
  location VARCHAR,
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX archives_index_0 ON archives (user_id);
CREATE INDEX archives_index_1 ON archives (jurisdiction);

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR NOT NULL DEFAULT 'decision', -- ENUM: 'decision' or 'archive'
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TAGS
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR NOT NULL UNIQUE
);

CREATE UNIQUE INDEX tags_index_0 ON tags (label);

-- DECISION_TAGS (many-to-many)
CREATE TABLE IF NOT EXISTS decision_tags (
  decision_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (decision_id, tag_id),
  FOREIGN KEY (decision_id) REFERENCES decisions(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- REGISTRATION REQUESTS
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  motivation TEXT,
  affiliation VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ADD FILE_PATH IN ARCHIVES TABLE
ALTER TABLE archives ADD COLUMN file_path TEXT;
