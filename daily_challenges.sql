-- Daily Challenges System
CREATE TABLE IF NOT EXISTS daily_challenges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL, -- 'habits', 'media', 'streaks', 'points'
    requirement_value INTEGER NOT NULL,
    points_reward INTEGER NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Daily Challenge Progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    challenge_date DATE NOT NULL, -- YYYY-MM-DD format
    progress_count INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME NULL,
    points_earned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges (id),
    UNIQUE(user_id, challenge_id, challenge_date)
);

-- Achievement Streaks Tracking
CREATE TABLE IF NOT EXISTS user_streaks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    streak_type TEXT NOT NULL, -- 'daily_login', 'habit_completion', 'weekly_goals'
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_update_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, streak_type)
);

-- Insert Daily Challenges
INSERT OR REPLACE INTO daily_challenges VALUES 
('daily_habit_hero', 'Habit Hero', 'Complete 3 habits today', '💪', 'habits', 3, 50, 'common', 1, CURRENT_TIMESTAMP),
('daily_progress_pic', 'Picture Perfect', 'Upload 1 progress photo today', '📸', 'media', 1, 30, 'common', 1, CURRENT_TIMESTAMP),
('daily_consistency_king', 'Consistency King', 'Complete 5 habits today', '👑', 'habits', 5, 100, 'rare', 1, CURRENT_TIMESTAMP),
('daily_streak_master', 'Streak Master', 'Maintain your login streak', '🔥', 'streaks', 1, 25, 'common', 1, CURRENT_TIMESTAMP),
('daily_point_crusher', 'Point Crusher', 'Earn 100 points today', '💎', 'points', 100, 75, 'epic', 1, CURRENT_TIMESTAMP),
('daily_weekly_warrior', 'Weekly Warrior', 'Complete 80% of your weekly habits today', '⚔️', 'weekly_progress', 80, 150, 'legendary', 1, CURRENT_TIMESTAMP);

-- Add rarity column to achievements if it doesn't exist
ALTER TABLE achievements ADD COLUMN rarity TEXT DEFAULT 'common';

-- Insert Achievement Rarity Levels into existing achievements
UPDATE achievements SET rarity = 'common' WHERE difficulty = 'easy';
UPDATE achievements SET rarity = 'rare' WHERE difficulty = 'medium';  
UPDATE achievements SET rarity = 'epic' WHERE difficulty = 'hard';
UPDATE achievements SET rarity = 'legendary' WHERE difficulty = 'legendary';