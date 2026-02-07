-- Echo AI Digital Twin - Database Schema
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,

  -- AI & Memory references
  backboard_assistant_id TEXT,  -- Reference to Backboard assistant
  personality_completed BOOLEAN DEFAULT FALSE,
  diary_entry_count INTEGER DEFAULT 0,

  -- Voice references
  elevenlabs_voice_id TEXT,  -- Reference to ElevenLabs cloned voice
  voice_sample_uploaded BOOLEAN DEFAULT FALSE,

  -- Blockchain references (optional)
  wallet_address TEXT,
  solana_tx_hash TEXT,
  blockchain_committed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on auth0_id for fast lookups
CREATE INDEX idx_users_auth0_id ON users(auth0_id);

-- Create index on email
CREATE INDEX idx_users_email ON users(email);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth0_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth0_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Note: INSERT will be handled by the API using the service role key
-- This is because users don't exist yet when they first log in

-- Optional: Create a view for user stats
CREATE VIEW user_stats AS
SELECT
  id,
  email,
  name,
  personality_completed,
  diary_entry_count,
  voice_sample_uploaded,
  blockchain_committed_at IS NOT NULL as is_blockchain_committed,
  created_at,
  last_login_at
FROM users;
