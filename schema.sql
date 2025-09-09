-- StriveTrack Database Schema for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_frequency INTEGER DEFAULT 1,
    color TEXT DEFAULT '#667eea',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Habit completions table
CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Media uploads table
CREATE TABLE IF NOT EXISTS media_uploads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    r2_key TEXT NOT NULL,
    description TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    requirement_type TEXT NOT NULL, -- 'habit_streak', 'total_completions', 'media_uploads', etc.
    requirement_value INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table (many-to-many)
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_media_uploads_user_id ON media_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Nutrition logging tables
CREATE TABLE IF NOT EXISTS user_nutrition_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    protein_g REAL DEFAULT 0,
    carbs_g REAL DEFAULT 0,
    fat_g REAL DEFAULT 0,
    sugar_g REAL DEFAULT 0,
    fiber_g REAL DEFAULT 0,
    water_ml INTEGER DEFAULT 0,
    is_custom_recipe BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_daily_nutrition (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    total_calories INTEGER DEFAULT 0,
    total_protein_g REAL DEFAULT 0,
    total_carbs_g REAL DEFAULT 0,
    total_fat_g REAL DEFAULT 0,
    total_sugar_g REAL DEFAULT 0,
    total_fiber_g REAL DEFAULT 0,
    total_water_ml INTEGER DEFAULT 0,
    calorie_goal INTEGER DEFAULT 2000,
    protein_goal_g REAL DEFAULT 150,
    carbs_goal_g REAL DEFAULT 200,
    fat_goal_g REAL DEFAULT 65,
    met_calorie_goal BOOLEAN DEFAULT FALSE,
    met_protein_goal BOOLEAN DEFAULT FALSE,
    met_carbs_goal BOOLEAN DEFAULT FALSE,
    met_fat_goal BOOLEAN DEFAULT FALSE,
    macro_balance_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, log_date)
);

-- Body tracking tables for weight/BMI functionality
CREATE TABLE IF NOT EXISTS user_body_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    weight_lbs REAL,
    height_inches REAL,
    body_fat_percent REAL,
    muscle_mass_percent REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Enhanced media uploads table with media_type
ALTER TABLE media_uploads ADD COLUMN media_type TEXT DEFAULT 'progress';

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    points INTEGER NOT NULL,
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User challenge completions
CREATE TABLE IF NOT EXISTS user_challenge_completions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    completed_date DATE NOT NULL,
    progress_value INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges (id) ON DELETE CASCADE,
    UNIQUE(user_id, challenge_id, completed_date)
);

-- Friend system tables
CREATE TABLE IF NOT EXISTS user_friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, friend_id)
);

-- Add weekly_target and category to habits table
ALTER TABLE habits ADD COLUMN weekly_target INTEGER DEFAULT 5;
ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE habits ADD COLUMN difficulty TEXT DEFAULT 'medium';

-- Add weekly_points to users table
ALTER TABLE users ADD COLUMN weekly_points INTEGER DEFAULT 0;

-- Indexes for nutrition tables
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON user_nutrition_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON user_daily_nutrition(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_body_logs_user_date ON user_body_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_date ON user_challenge_completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON user_friends(friend_id);

-- Insert default achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, points, requirement_type, requirement_value) VALUES
('achievement_first_habit', 'Getting Started', 'Create your first habit', 'fas fa-star', 10, 'habits_created', 1),
('achievement_first_completion', 'First Step', 'Complete your first habit', 'fas fa-check-circle', 15, 'total_completions', 1),
('achievement_week_streak', 'Week Warrior', 'Maintain a 7-day streak', 'fas fa-fire', 50, 'habit_streak', 7),
('achievement_month_streak', 'Monthly Master', 'Maintain a 30-day streak', 'fas fa-trophy', 200, 'habit_streak', 30),
('achievement_first_photo', 'Picture Perfect', 'Upload your first progress photo', 'fas fa-camera', 25, 'media_uploads', 1),
('achievement_100_points', 'Century Club', 'Earn 100 total points', 'fas fa-medal', 0, 'total_points', 100),
('achievement_500_points', 'Point Master', 'Earn 500 total points', 'fas fa-crown', 0, 'total_points', 500);

-- Weekly habit completions table for calendar view
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

-- Insert default daily challenges
INSERT OR IGNORE INTO daily_challenges (id, name, description, icon, category, target_value, points, rarity, is_active) VALUES
('daily_habit_streak', 'Streak Master', 'Complete 3 habits today', '🔥', 'habits', 3, 30, 'common', 1),
('daily_nutrition_logger', 'Nutrition Logger', 'Log 3 meals with macros today', '🍽️', 'nutrition', 3, 40, 'common', 1),
('daily_macro_tracker', 'Macro Tracker', 'Hit all 3 macro goals today', '⚖️', 'macros', 1, 75, 'rare', 1),
('daily_hydration_hero', 'Hydration Hero', 'Drink 8 glasses of water today', '💧', 'hydration', 8, 25, 'common', 1),
('daily_progress_photo', 'Progress Photographer', 'Upload 1 progress photo today', '📸', 'media', 1, 50, 'epic', 1),
('daily_healthy_eater', 'Healthy Eater', 'Log only healthy foods today', '🥗', 'healthy_foods', 5, 50, 'epic', 1),
('daily_protein_power', 'Protein Power', 'Meet your protein goal today', '🍖', 'protein_goal', 1, 35, 'common', 1);