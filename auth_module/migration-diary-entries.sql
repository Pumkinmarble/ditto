-- Diary Entries Table Migration
-- Run this in your Supabase SQL Editor

-- Create diary_entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Entry content
  content TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_entry_date ON diary_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON diary_entries(user_id, entry_date DESC);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_diary_entries_updated_at
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own diary entries
CREATE POLICY "Users can view own diary entries"
  ON diary_entries
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Policy: Users can insert their own diary entries
CREATE POLICY "Users can insert own diary entries"
  ON diary_entries
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Policy: Users can update their own diary entries
CREATE POLICY "Users can update own diary entries"
  ON diary_entries
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Policy: Users can delete their own diary entries
CREATE POLICY "Users can delete own diary entries"
  ON diary_entries
  FOR DELETE
  USING (user_id IN (
    SELECT id FROM users WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Function to update diary_entry_count when entries are added/deleted
CREATE OR REPLACE FUNCTION update_diary_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE users
    SET diary_entry_count = diary_entry_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE users
    SET diary_entry_count = diary_entry_count - 1
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update diary_entry_count
CREATE TRIGGER update_user_diary_count
AFTER INSERT OR DELETE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION update_diary_count();
