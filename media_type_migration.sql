-- Migration to add media_type column to media_uploads table
-- Run this to add categorization support for before/after/progress media

-- Add media_type column to existing media_uploads table
ALTER TABLE media_uploads ADD COLUMN media_type TEXT DEFAULT 'progress';

-- Update existing records based on description content
UPDATE media_uploads SET media_type = 'before' WHERE LOWER(description) LIKE '%before%';
UPDATE media_uploads SET media_type = 'after' WHERE LOWER(description) LIKE '%after%';

-- Create index for better performance on media_type queries
CREATE INDEX IF NOT EXISTS idx_media_uploads_media_type ON media_uploads(media_type);
CREATE INDEX IF NOT EXISTS idx_media_uploads_user_type ON media_uploads(user_id, media_type);

-- Add some new achievements for before/after functionality
INSERT OR IGNORE INTO achievements (id, name, description, icon, points, requirement_type, requirement_value) VALUES
('achievement_first_before', 'Starting Point', 'Upload your first "before" photo', 'fas fa-calendar-week', 15, 'before_uploads', 1),
('achievement_first_after', 'Progress Made', 'Upload your first "after" photo', 'fas fa-trophy', 20, 'after_uploads', 1),
('achievement_first_pair', 'Transformation Tracker', 'Complete your first before/after pair in one week', 'fas fa-exchange-alt', 50, 'before_after_pairs', 1),
('achievement_weekly_documenter', 'Weekly Warrior', 'Upload media for 7 consecutive weeks', 'fas fa-camera-retro', 100, 'weekly_upload_streak', 7),
('achievement_transformation_master', 'Transformation Master', 'Complete 5 before/after pairs', 'fas fa-star', 150, 'before_after_pairs', 5);