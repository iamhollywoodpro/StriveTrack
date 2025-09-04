-- Critical Fixes for StriveTrack Issues
-- This script fixes the specific issues reported

-- 1. Ensure achievements table has sample data
INSERT OR IGNORE INTO achievements (id, name, description, requirement_type, requirement_value, points, category, icon, rarity) VALUES
('onboarding_1', 'Welcome to StriveTrack', 'Created your account', 'account_created', 1, 10, 'onboarding', '🚀', 'common'),
('habit_1', 'First Habit', 'Created your first habit', 'habits_created', 1, 15, 'habits', '🔥', 'common'),
('habit_5', 'Habit Builder', 'Created 5 habits', 'habits_created', 5, 50, 'habits', '🏗️', 'uncommon'),
('completion_1', 'First Success', 'Completed your first habit', 'habit_completions', 1, 20, 'habits', '✅', 'common'),
('completion_10', 'Consistency Champion', 'Completed habits 10 times', 'habit_completions', 10, 100, 'habits', '👑', 'rare'),
('media_1', 'First Photo', 'Uploaded your first progress photo', 'media_uploads', 1, 25, 'progress', '📸', 'common'),
('nutrition_1', 'Nutrition Tracker', 'Logged your first meal', 'nutrition_logs', 1, 15, 'nutrition', '🍎', 'common'),
('weight_1', 'Weight Watcher', 'Logged your first weight', 'weight_logs', 1, 20, 'health', '⚖️', 'common');

-- 2. Ensure competitions table exists and has sample data
CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'individual',
    metric_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    max_participants INTEGER,
    prize_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competition_participants (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(competition_id, user_id)
);

-- Add sample competitions
INSERT OR IGNORE INTO competitions (id, name, description, type, metric_type, start_date, end_date, creator_id, status) VALUES
('comp_1', '30-Day Habit Challenge', 'Build consistency with daily habits', 'individual', 'habit_completions', date('now'), date('now', '+30 days'), 'system', 'active'),
('comp_2', 'Weight Loss Challenge', 'Healthy weight management competition', 'individual', 'weight_loss', date('now'), date('now', '+60 days'), 'system', 'active'),
('comp_3', 'Fitness Photo Challenge', 'Document your transformation', 'individual', 'media_uploads', date('now'), date('now', '+90 days'), 'system', 'active');

-- 3. Ensure user weight preferences are set (default to lbs for US users)
UPDATE users SET weight_unit = 'lbs' WHERE weight_unit IS NULL OR weight_unit = '';
UPDATE users SET height_cm = 170 WHERE height_cm IS NULL OR height_cm = 0;

-- 4. Fix any existing weight entries that may have wrong BMI calculations
UPDATE user_weight_logs SET bmi = 
    CASE 
        WHEN (SELECT height_cm FROM users WHERE id = user_weight_logs.user_id) > 0 
        THEN ROUND((weight_kg / ((SELECT height_cm FROM users WHERE id = user_weight_logs.user_id) / 100.0 * (SELECT height_cm FROM users WHERE id = user_weight_logs.user_id) / 100.0)), 1)
        ELSE NULL 
    END
WHERE bmi IS NULL OR bmi = 0;

-- 5. Ensure achievement categories are properly set up
UPDATE achievements SET category = 'onboarding' WHERE category IS NULL OR category = '';

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_id ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weight_logs_user_id ON user_weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_logs_user_id ON user_nutrition_logs(user_id);

-- 7. Grant sample achievements to existing users to test the system
-- This will be handled by the backend when users perform actions