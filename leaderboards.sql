-- Friends and Leaderboards System
CREATE TABLE IF NOT EXISTS user_friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (friend_id) REFERENCES users (id),
    UNIQUE(user_id, friend_id)
);

-- Friend requests table for better tracking
CREATE TABLE IF NOT EXISTS friend_requests (
    id TEXT PRIMARY KEY,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    FOREIGN KEY (from_user_id) REFERENCES users (id),
    FOREIGN KEY (to_user_id) REFERENCES users (id),
    UNIQUE(from_user_id, to_user_id)
);

-- Leaderboard entries for different competition types
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    leaderboard_type TEXT NOT NULL, -- 'weekly_points', 'total_achievements', 'current_streaks', 'daily_challenges'
    score INTEGER NOT NULL,
    period_identifier TEXT NOT NULL, -- e.g., '2025-W09' for weekly, 'all-time' for lifetime
    additional_data TEXT NULL, -- JSON for extra stats
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, leaderboard_type, period_identifier)
);

-- Social activity feed for friends to see each other's achievements
CREATE TABLE IF NOT EXISTS social_activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'achievement_unlocked', 'streak_milestone', 'challenge_completed', 'habit_created'
    activity_data TEXT NOT NULL, -- JSON with activity details
    visibility TEXT NOT NULL DEFAULT 'friends', -- 'friends', 'public', 'private'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Add social stats columns to users table
ALTER TABLE users ADD COLUMN total_friends INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN weekly_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_weekly_reset DATE DEFAULT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_id ON user_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_type_period ON leaderboard_entries(leaderboard_type, period_identifier);
CREATE INDEX IF NOT EXISTS idx_social_activities_user ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_created ON social_activities(created_at);