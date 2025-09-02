-- New Achievement Categories: Video Progress & Nutrition Tracking

-- First, let's add new achievement categories and update existing ones
INSERT OR REPLACE INTO achievements VALUES 
-- Video & Visual Progress Achievements
('video_first_upload', 'First Video', 'Upload your first progress video', '🎬', 25, 'upload_first_video', 1, CURRENT_TIMESTAMP, 'video', 0, NULL, '#667eea', 'easy', 'common'),
('video_weekly_creator', 'Weekly Creator', 'Upload a video every week for 4 weeks', '📹', 100, 'upload_videos_weekly', 4, CURRENT_TIMESTAMP, 'video', 0, NULL, '#3b82f6', 'medium', 'rare'),
('video_monthly_diary', 'Video Diary', 'Upload 7 videos in a single month', '🎥', 150, 'upload_videos_month', 7, CURRENT_TIMESTAMP, 'video', 0, NULL, '#3b82f6', 'medium', 'rare'),
('video_master', 'Video Master', 'Upload 30 total progress videos', '📺', 300, 'upload_videos_total', 30, CURRENT_TIMESTAMP, 'video', 0, NULL, '#f59e0b', 'hard', 'epic'),
('before_after_video', 'Transformation Video', 'Upload before and after videos 30 days apart', '🎞️', 200, 'before_after_videos', 1, CURRENT_TIMESTAMP, 'video', 0, NULL, '#f59e0b', 'hard', 'epic'),
('video_consistency_pro', 'Video Consistency Pro', 'Upload videos for 12 consecutive weeks', '🏆', 500, 'video_consistency', 12, CURRENT_TIMESTAMP, 'video', 0, NULL, '#8b5cf6', 'legendary', 'legendary'),

-- Enhanced Photo Progress Achievements  
('transformation_timeline', 'Transformation Timeline', 'Upload before/after photos 90 days apart', '📸', 250, 'before_after_photos_90', 1, CURRENT_TIMESTAMP, 'progress', 0, NULL, '#f59e0b', 'hard', 'epic'),
('photo_monthly_milestone', 'Monthly Milestones', 'Upload photos on the same day each month for 6 months', '📅', 300, 'monthly_photo_consistency', 6, CURRENT_TIMESTAMP, 'progress', 0, NULL, '#f59e0b', 'hard', 'epic'),
('photo_weekly_warrior', 'Photo Weekly Warrior', 'Upload photos weekly for 8 consecutive weeks', '📷', 200, 'weekly_photo_uploads', 8, CURRENT_TIMESTAMP, 'progress', 0, NULL, '#3b82f6', 'medium', 'rare'),
('progress_documenter', 'Progress Documenter', 'Upload 100 total progress photos', '🖼️', 400, 'total_photos', 100, CURRENT_TIMESTAMP, 'progress', 0, NULL, '#f59e0b', 'hard', 'epic'),

-- Nutrition & Macro Tracking Achievements
('nutrition_first_log', 'Nutrition Newbie', 'Log your first meal and macros', '🍽️', 25, 'first_nutrition_log', 1, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('protein_champion', 'Protein Champion', 'Hit your protein goal 7 days in a row', '🍖', 100, 'protein_streak', 7, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#3b82f6', 'medium', 'rare'),
('carb_counter', 'Carb Counter', 'Track carbs for 14 consecutive days', '🥖', 75, 'carb_tracking_streak', 14, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('fat_balance_master', 'Fat Balance Master', 'Maintain fat macro balance for 7 days', '🥑', 75, 'fat_balance_streak', 7, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('macro_perfect', 'Macro Perfect', 'Hit all 3 macros within target range for 3 days', '⚖️', 150, 'macro_precision', 3, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#3b82f6', 'medium', 'rare'),
('nutrition_ninja', 'Nutrition Ninja', 'Track all macros for 30 consecutive days', '🥷', 300, 'nutrition_tracking_month', 30, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#f59e0b', 'hard', 'epic'),
('calorie_conscious', 'Calorie Conscious', 'Track calories for 7 consecutive days', '🔥', 50, 'calorie_tracking_week', 7, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('target_hitter', 'Target Hitter', 'Meet calorie goals 5 days in a row', '🎯', 100, 'calorie_goal_streak', 5, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#3b82f6', 'medium', 'rare'),
('sugar_tracker', 'Sugar Tracker', 'Monitor sugar intake for 14 days', '🍯', 75, 'sugar_tracking', 14, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('hydration_hero', 'Hydration Hero', 'Log water intake daily for 10 days', '💧', 50, 'water_tracking', 10, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('fiber_focus', 'Fiber Focus', 'Track fiber intake for 7 days', '🥬', 50, 'fiber_tracking', 7, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#667eea', 'easy', 'common'),
('macro_mastery', 'Macro Mastery', 'Achieve perfect macro balance 10 times', '👑', 500, 'macro_perfection_count', 10, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#8b5cf6', 'legendary', 'legendary'),
('nutrition_consistency', 'Nutrition Consistency', 'Track nutrition for 100 consecutive days', '📊', 1000, 'nutrition_super_streak', 100, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#8b5cf6', 'legendary', 'legendary'),

-- Enhanced Variety & Exploration Achievements
('meal_variety', 'Meal Variety Explorer', 'Log 50 different meals/foods', '🌈', 200, 'unique_foods', 50, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#3b82f6', 'medium', 'rare'),
('recipe_creator', 'Recipe Creator', 'Create and log 10 custom meal recipes', '👨‍🍳', 150, 'custom_recipes', 10, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#3b82f6', 'medium', 'rare'),
('healthy_choices', 'Healthy Choices', 'Choose healthy options 20 days in a month', '🥗', 200, 'healthy_meal_choices', 20, CURRENT_TIMESTAMP, 'nutrition', 0, NULL, '#3b82f6', 'medium', 'rare'),

-- Social & Challenge Achievements
('nutrition_mentor', 'Nutrition Mentor', 'Help 5 friends with nutrition tracking', '🤝', 250, 'nutrition_help_friends', 5, CURRENT_TIMESTAMP, 'social', 0, NULL, '#f59e0b', 'hard', 'epic'),
('challenge_nutritionist', 'Challenge Nutritionist', 'Complete 20 nutrition-related daily challenges', '🏅', 300, 'nutrition_challenges', 20, CURRENT_TIMESTAMP, 'challenges', 0, NULL, '#f59e0b', 'hard', 'epic');

-- Add new progress tracking tables for video and nutrition achievements
CREATE TABLE IF NOT EXISTS user_video_uploads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    video_url TEXT NOT NULL,
    video_type TEXT NOT NULL, -- 'progress', 'before', 'after', 'general'
    upload_date DATE NOT NULL,
    week_number INTEGER, -- Week of year for weekly tracking
    month_year TEXT, -- YYYY-MM format for monthly tracking
    is_before_after BOOLEAN DEFAULT 0,
    comparison_video_id TEXT NULL, -- Links before/after videos
    tags TEXT, -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS user_nutrition_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name TEXT NOT NULL,
    calories INTEGER,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    sugar_g REAL,
    fiber_g REAL,
    water_ml INTEGER DEFAULT 0,
    is_custom_recipe BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
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
    calorie_goal INTEGER,
    protein_goal_g REAL,
    carbs_goal_g REAL,
    fat_goal_g REAL,
    met_calorie_goal BOOLEAN DEFAULT 0,
    met_protein_goal BOOLEAN DEFAULT 0,
    met_carbs_goal BOOLEAN DEFAULT 0,
    met_fat_goal BOOLEAN DEFAULT 0,
    macro_balance_score REAL DEFAULT 0, -- 0-100 score for how well macros were balanced
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, log_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_uploads_user_date ON user_video_uploads(user_id, upload_date);
CREATE INDEX IF NOT EXISTS idx_video_uploads_type ON user_video_uploads(video_type);
CREATE INDEX IF NOT EXISTS idx_video_uploads_week ON user_video_uploads(user_id, week_number);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON user_nutrition_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON user_daily_nutrition(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_goals ON user_daily_nutrition(user_id, met_calorie_goal, met_protein_goal);