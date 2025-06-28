-- Add imported_at column to decisions table
ALTER TABLE decisions ADD COLUMN imported_at TIMESTAMP DEFAULT NOW();
