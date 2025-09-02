-- Weekly habit tracking enhancement
-- This adds support for tracking specific days of the week for each habit

-- Create weekly completions table for tracking specific dates
CREATE TABLE IF NOT EXISTS weekly_habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completion_date DATE NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    week_start_date DATE NOT NULL, -- Start of the week (Sunday)
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(habit_id, completion_date) -- One completion per habit per day
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_completions_habit_date ON weekly_habit_completions(habit_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_weekly_completions_user_week ON weekly_habit_completions(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_completions_week_day ON weekly_habit_completions(week_start_date, day_of_week);

-- Add weekly target to habits table
ALTER TABLE habits ADD COLUMN weekly_target INTEGER DEFAULT 7; -- How many days per week target