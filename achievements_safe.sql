-- Enhanced Achievement System - Safe Migration
-- First, let's safely add columns and tables

-- Add new columns to achievements table (if they don't exist)
ALTER TABLE achievements ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE achievements ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;  
ALTER TABLE achievements ADD COLUMN recurring_period TEXT;
ALTER TABLE achievements ADD COLUMN badge_color TEXT DEFAULT '#667eea';
ALTER TABLE achievements ADD COLUMN difficulty TEXT DEFAULT 'easy';

-- Create new tables for enhanced system
CREATE TABLE IF NOT EXISTS user_achievement_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    current_progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id, period_start)
);

CREATE TABLE IF NOT EXISTS user_reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    trigger_day TEXT,
    trigger_date INTEGER,
    trigger_time TEXT DEFAULT '09:00',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Clear and repopulate achievements (safe approach)
DELETE FROM user_achievements;
DELETE FROM achievements;

-- Insert comprehensive achievement system
INSERT INTO achievements (id, name, description, icon, points, requirement_type, requirement_value, category, is_recurring, badge_color, difficulty) VALUES

-- ONE-TIME ACHIEVEMENTS
('achievement_welcome', 'Welcome Aboard! 🚀', 'Sign up for StriveTrack and start your fitness journey', 'fas fa-rocket', 10, 'account_created', 1, 'onboarding', 0, '#10b981', 'easy'),
('achievement_first_habit', 'Habit Creator 📝', 'Create your very first habit', 'fas fa-plus-circle', 15, 'habits_created', 1, 'onboarding', 0, '#3b82f6', 'easy'),
('achievement_first_completion', 'First Steps 👣', 'Complete your first habit', 'fas fa-check-circle', 20, 'total_completions', 1, 'onboarding', 0, '#10b981', 'easy'),
('achievement_first_photo', 'Picture Perfect 📸', 'Upload your first progress photo', 'fas fa-camera', 30, 'photos_uploaded', 1, 'progress', 0, '#f59e0b', 'easy'),
('achievement_first_video', 'Video Star 🎬', 'Upload your first progress video', 'fas fa-video', 40, 'videos_uploaded', 1, 'progress', 0, '#ef4444', 'easy'),
('achievement_week_streak', 'Week Warrior 🔥', 'Maintain a 7-day habit streak', 'fas fa-fire', 75, 'habit_streak', 7, 'consistency', 0, '#f97316', 'medium'),
('achievement_month_streak', 'Monthly Master 👑', 'Maintain a 30-day habit streak', 'fas fa-crown', 200, 'habit_streak', 30, 'consistency', 0, '#eab308', 'hard'),
('achievement_100_days', '100 Day Legend 🏆', 'Maintain a 100-day habit streak', 'fas fa-trophy', 500, 'habit_streak', 100, 'consistency', 0, '#dc2626', 'legendary'),
('achievement_early_bird', 'Early Bird 🌅', 'Complete 10 morning habits before 10 AM', 'fas fa-sun', 60, 'morning_completions', 10, 'activity', 0, '#fbbf24', 'medium'),
('achievement_weekend_warrior', 'Weekend Warrior 💪', 'Complete habits on 10 consecutive weekends', 'fas fa-dumbbell', 80, 'weekend_streaks', 10, 'activity', 0, '#10b981', 'medium'),
('achievement_100_points', 'Century Club 💯', 'Earn your first 100 points', 'fas fa-medal', 0, 'total_points', 100, 'points', 0, '#059669', 'easy'),
('achievement_500_points', 'Point Collector 🎯', 'Earn 500 total points', 'fas fa-bullseye', 0, 'total_points', 500, 'points', 0, '#0d9488', 'medium'),
('achievement_1000_points', 'Point Master 🌟', 'Earn 1000 total points', 'fas fa-star', 0, 'total_points', 1000, 'points', 0, '#7c3aed', 'hard'),
('achievement_habit_variety', 'Variety Seeker 🎨', 'Create habits in 5 different categories', 'fas fa-palette', 100, 'habit_categories', 5, 'variety', 0, '#ec4899', 'medium'),
('achievement_media_master', 'Media Master 🎥', 'Upload 25 progress photos or videos', 'fas fa-photo-video', 150, 'total_media', 25, 'progress', 0, '#8b5cf6', 'hard'),

-- RECURRING ACHIEVEMENTS  
('achievement_weekly_complete', 'Weekly Champion 🏅', 'Complete all your weekly habit targets', 'fas fa-medal', 50, 'weekly_targets_met', 1, 'weekly', 1, '#10b981', 'medium'),
('achievement_weekly_photos', 'Weekly Progress 📷', 'Upload before and after photos each week', 'fas fa-camera-retro', 40, 'weekly_progress_photos', 2, 'weekly', 1, '#f59e0b', 'medium'),
('achievement_monthly_streak', 'Monthly Momentum 🚀', 'Maintain streaks for all habits this month', 'fas fa-rocket', 200, 'monthly_all_streaks', 1, 'monthly', 1, '#06b6d4', 'hard'),
('achievement_monthly_transformation', 'Monthly Transformation 🦋', 'Upload monthly progress comparison photos', 'fas fa-images', 100, 'monthly_comparison_photos', 2, 'monthly', 1, '#ec4899', 'medium');

-- Update recurring_period for recurring achievements
UPDATE achievements SET recurring_period = 'weekly' WHERE category = 'weekly';
UPDATE achievements SET recurring_period = 'monthly' WHERE category = 'monthly';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_id ON user_achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_recurring ON achievements(is_recurring);