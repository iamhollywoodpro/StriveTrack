-- Critical Fixes for StriveTrack Issues (Corrected Schema)
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

-- 2. Add sample competitions using correct schema (title, competition_type)
INSERT OR IGNORE INTO competitions (id, title, description, competition_type, start_date, end_date, creator_id, status) VALUES
('comp_1', '30-Day Habit Challenge', 'Build consistency with daily habits for 30 days', 'habit_building', date('now'), date('now', '+30 days'), 'system', 'active'),
('comp_2', 'Weight Loss Challenge', 'Healthy weight management competition', 'weight_loss', date('now'), date('now', '+60 days'), 'system', 'active'),
('comp_3', 'Fitness Photo Challenge', 'Document your transformation journey', 'transformation', date('now'), date('now', '+90 days'), 'system', 'active');

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