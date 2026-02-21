-- Migration: Add OAuth token columns to connections_platforms table
-- Run this in Supabase SQL editor or via supabase db push

ALTER TABLE connections_platforms
    ADD COLUMN IF NOT EXISTS access_token  TEXT,
    ADD COLUMN IF NOT EXISTS refresh_token TEXT,
    ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS scope         TEXT;

-- Row Level Security: ensure users can only see their own tokens
ALTER TABLE connections_platforms ENABLE ROW LEVEL SECURITY;

-- Policy: user can read their own rows
DROP POLICY IF EXISTS "Users can view own connections" ON connections_platforms;
CREATE POLICY "Users can view own connections"
    ON connections_platforms FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: user can insert their own rows
DROP POLICY IF EXISTS "Users can insert own connections" ON connections_platforms;
CREATE POLICY "Users can insert own connections"
    ON connections_platforms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: user can update their own rows
DROP POLICY IF EXISTS "Users can update own connections" ON connections_platforms;
CREATE POLICY "Users can update own connections"
    ON connections_platforms FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: user can delete their own rows
DROP POLICY IF EXISTS "Users can delete own connections" ON connections_platforms;
CREATE POLICY "Users can delete own connections"
    ON connections_platforms FOR DELETE
    USING (auth.uid() = user_id);
