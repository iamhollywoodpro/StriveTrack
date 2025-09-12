-- StriveTrack Database Schema Fixes
-- This script ensures all required columns exist and fixes schema inconsistencies

-- Check and add missing columns to habits table
ALTER TABLE habits ADD COLUMN weekly_target INTEGER DEFAULT 5;
ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE habits ADD COLUMN difficulty TEXT DEFAULT 'medium';

-- Check and add missing columns to users table  
ALTER TABLE users ADD COLUMN weekly_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN admin_notes TEXT;
ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Ensure weekly_habit_completions table exists with proper structure
CREATE TABLE IF NOT EXISTS weekly_habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completion_date DATE NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
    week_start_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completion_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_completions_user_week ON weekly_habit_completions(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_completions_habit_date ON weekly_habit_completions(habit_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Update any existing habits to have reasonable defaults
UPDATE habits SET weekly_target = 5 WHERE weekly_target IS NULL;
UPDATE habits SET category = 'general' WHERE category IS NULL;
UPDATE habits SET difficulty = 'medium' WHERE difficulty IS NULL;

-- Ensure users have proper points
UPDATE users SET points = 0 WHERE points IS NULL;
UPDATE users SET weekly_points = 0 WHERE weekly_points IS NULL;