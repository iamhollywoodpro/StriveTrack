-- Fix achievements system by adding missing columns and updating achievements
ALTER TABLE achievements ADD COLUMN is_recurring BOOLEAN DEFAULT 0;

-- Add sample achievements for testing (using INSERT OR IGNORE to avoid duplicates)
INSERT OR IGNORE INTO achievements (id, name, description, requirement_type, requirement_value, points, category, icon, rarity, is_recurring) VALUES
('media_uploads_1', 'First Upload', 'Upload your first media file', 'media_uploads', 1, 10, 'progress', '📸', 'common', 0),
('media_uploads_5', 'Media Enthusiast', 'Upload 5 media files', 'media_uploads', 5, 50, 'progress', '📷', 'uncommon', 0),
('media_uploads_10', 'Content Creator', 'Upload 10 media files', 'media_uploads', 10, 100, 'progress', '🎬', 'rare', 0),
('before_after_1', 'Comparison Master', 'Create your first before/after pair', 'before_after_pairs', 1, 75, 'progress', '↔️', 'rare', 0),
('nutrition_logs_1', 'Nutrition Novice', 'Log your first meal', 'nutrition_logs', 1, 15, 'nutrition', '🍎', 'common', 0),
('nutrition_logs_7', 'Week Tracker', 'Log nutrition for 7 days', 'nutrition_logs', 7, 75, 'nutrition', '📊', 'uncommon', 0),
('total_points_100', 'Century Club', 'Earn 100 total points', 'total_points', 100, 0, 'points', '💯', 'uncommon', 0),
('total_points_500', 'Point Master', 'Earn 500 total points', 'total_points', 500, 0, 'points', '👑', 'rare', 0),
('weight_logs_1', 'Weight Tracker', 'Log your first weight entry', 'weight_logs', 1, 20, 'health', '⚖️', 'common', 0);

-- Update existing achievements to have proper is_recurring values
UPDATE achievements SET is_recurring = 0 WHERE is_recurring IS NULL;