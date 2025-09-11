-- Add username column to users table
ALTER TABLE users ADD COLUMN username TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);