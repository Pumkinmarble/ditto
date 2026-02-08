-- Migration: Add AI-related fields to users table
-- This ensures proper RAG isolation and voice cloning persistence

-- Add Backboard.io assistant and thread IDs for RAG isolation
ALTER TABLE users
ADD COLUMN IF NOT EXISTS assistant_id TEXT,
ADD COLUMN IF NOT EXISTS thread_id TEXT,
ADD COLUMN IF NOT EXISTS voice_id TEXT,
ADD COLUMN IF NOT EXISTS voice_name TEXT;

-- Add comments for clarity
COMMENT ON COLUMN users.assistant_id IS 'Backboard.io assistant ID for this user (RAG isolation)';
COMMENT ON COLUMN users.thread_id IS 'Backboard.io thread ID for this user (RAG isolation)';
COMMENT ON COLUMN users.voice_id IS 'ElevenLabs cloned voice ID for this user';
COMMENT ON COLUMN users.voice_name IS 'Name of the cloned voice';
