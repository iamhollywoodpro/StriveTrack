-- Enhanced Achievement System with One-time and Recurring Achievements
-- Plus Notification/Reminder System

-- Enhanced achievements table with more fields
ALTER TABLE achievements ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE achievements ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE achievements ADD COLUMN recurring_period TEXT; -- 'weekly', 'monthly', 'yearly'
ALTER TABLE achievements ADD COLUMN badge_color TEXT DEFAULT '#667eea';
ALTER TABLE achievements ADD COLUMN difficulty TEXT DEFAULT 'easy'; -- 'easy', 'medium', 'hard', 'legendary'

-- User achievement progress tracking (for recurring achievements)
CREATE TABLE IF NOT EXISTS user_achievement_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    period_start DATE NOT NULL, -- For recurring achievements
    period_end DATE NOT NULL,
    current_progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id, period_start)
);

-- Notification reminders system
CREATE TABLE IF NOT EXISTS user_reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL, -- 'achievement', 'habit', 'weekly_photo', 'monthly_photo'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    trigger_day TEXT, -- 'sunday', 'monday', etc. for weekly reminders
    trigger_date INTEGER, -- 1-31 for monthly reminders
    trigger_time TEXT DEFAULT '09:00', -- HH:MM format
    is_active BOOLEAN DEFAULT TRUE,
    last_sent DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Clear existing basic achievements and insert comprehensive achievement system
DELETE FROM achievements;

-- ONE-TIME ACHIEVEMENTS (Milestone-based)
INSERT INTO achievements (id, name, description, icon, points, requirement_type, requirement_value, category, is_recurring, badge_color, difficulty) VALUES

-- Getting Started Category
('achievement_welcome', 'Welcome Aboard! 🚀', 'Sign up for StriveTrack and start your fitness journey', 'fas fa-rocket', 10, 'account_created', 1, 'onboarding', false, '#10b981', 'easy'),
('achievement_first_habit', 'Habit Creator 📝', 'Create your very first habit', 'fas fa-plus-circle', 15, 'habits_created', 1, 'onboarding', false, '#3b82f6', 'easy'),
('achievement_first_completion', 'First Steps 👣', 'Complete your first habit', 'fas fa-check-circle', 20, 'total_completions', 1, 'onboarding', false, '#10b981', 'easy'),
('achievement_profile_complete', 'Profile Master 👤', 'Complete your profile setup', 'fas fa-user-check', 25, 'profile_complete', 1, 'onboarding', false, '#8b5cf6', 'easy'),

-- Progress Tracking Category  
('achievement_first_photo', 'Picture Perfect 📸', 'Upload your first progress photo', 'fas fa-camera', 30, 'photos_uploaded', 1, 'progress', false, '#f59e0b', 'easy'),
('achievement_first_video', 'Video Star 🎬', 'Upload your first progress video', 'fas fa-video', 40, 'videos_uploaded', 1, 'progress', false, '#ef4444', 'easy'),
('achievement_before_after', 'Transformation Tracker 📊', 'Upload both before and after photos in one week', 'fas fa-images', 50, 'weekly_before_after', 1, 'progress', false, '#06b6d4', 'medium'),

-- Consistency Category
('achievement_week_streak', 'Week Warrior 🔥', 'Maintain a 7-day habit streak', 'fas fa-fire', 75, 'habit_streak', 7, 'consistency', false, '#f97316', 'medium'),
('achievement_month_streak', 'Monthly Master 👑', 'Maintain a 30-day habit streak', 'fas fa-crown', 200, 'habit_streak', 30, 'consistency', false, '#eab308', 'hard'),
('achievement_100_days', '100 Day Legend 🏆', 'Maintain a 100-day habit streak', 'fas fa-trophy', 500, 'habit_streak', 100, 'consistency', false, '#dc2626', 'legendary'),

-- Activity Category
('achievement_early_bird', 'Early Bird 🌅', 'Complete 10 morning habits (before 10 AM)', 'fas fa-sun', 60, 'morning_completions', 10, 'activity', false, '#fbbf24', 'medium'),
('achievement_night_owl', 'Night Owl 🌙', 'Complete 10 evening habits (after 6 PM)', 'fas fa-moon', 60, 'evening_completions', 10, 'activity', false, '#6366f1', 'medium'),
('achievement_weekend_warrior', 'Weekend Warrior 💪', 'Complete habits on 10 consecutive weekends', 'fas fa-dumbbell', 80, 'weekend_streaks', 10, 'activity', false, '#10b981', 'medium'),

-- Points Category
('achievement_100_points', 'Century Club 💯', 'Earn your first 100 points', 'fas fa-medal', 0, 'total_points', 100, 'points', false, '#059669', 'easy'),
('achievement_500_points', 'Point Collector 🎯', 'Earn 500 total points', 'fas fa-bullseye', 0, 'total_points', 500, 'points', false, '#0d9488', 'medium'),
('achievement_1000_points', 'Point Master 🌟', 'Earn 1000 total points', 'fas fa-star', 0, 'total_points', 1000, 'points', false, '#7c3aed', 'hard'),
('achievement_5000_points', 'Point Legend ⚡', 'Earn 5000 total points', 'fas fa-bolt', 0, 'total_points', 5000, 'points', false, '#dc2626', 'legendary'),

-- Social Category
('achievement_habit_variety', 'Variety Seeker 🎨', 'Create habits in 5 different categories', 'fas fa-palette', 100, 'habit_categories', 5, 'variety', false, '#ec4899', 'medium'),
('achievement_media_master', 'Media Master 🎥', 'Upload 25 progress photos or videos', 'fas fa-photo-video', 150, 'total_media', 25, 'progress', false, '#8b5cf6', 'hard');

-- RECURRING ACHIEVEMENTS (Weekly/Monthly)
INSERT INTO achievements (id, name, description, icon, points, requirement_type, requirement_value, category, is_recurring, recurring_period, badge_color, difficulty) VALUES

-- Weekly Recurring Achievements
('achievement_weekly_complete', 'Weekly Champion 🏅', 'Complete all your weekly habit targets', 'fas fa-medal', 50, 'weekly_targets_met', 1, 'weekly', true, 'weekly', '#10b981', 'medium'),
('achievement_weekly_photos', 'Weekly Progress 📷', 'Upload before and after photos each week', 'fas fa-camera-retro', 40, 'weekly_progress_photos', 2, 'weekly', true, 'weekly', '#f59e0b', 'medium'),
('achievement_weekly_consistency', 'Consistency King 👑', 'Complete at least 5 habits every day this week', 'fas fa-calendar-check', 75, 'weekly_daily_completions', 35, 'weekly', true, 'weekly', '#8b5cf6', 'hard'),

-- Monthly Recurring Achievements  
('achievement_monthly_streak', 'Monthly Momentum 🚀', 'Maintain streaks for all habits this month', 'fas fa-rocket', 200, 'monthly_all_streaks', 1, 'monthly', true, 'monthly', '#06b6d4', 'hard'),
('achievement_monthly_transformation', 'Monthly Transformation 🦋', 'Upload monthly progress comparison photos', 'fas fa-images', 100, 'monthly_comparison_photos', 2, 'monthly', true, 'monthly', '#ec4899', 'medium'),
('achievement_monthly_points', 'Monthly Point Goal 🎯', 'Earn 500 points in a single month', 'fas fa-target', 150, 'monthly_points', 500, 'monthly', true, 'monthly', '#f97316', 'hard');

-- Insert default reminders for all users (these will be created when a user signs up)
-- Weekly reminder templates that will be customized per user
INSERT OR IGNORE INTO user_reminders (id, user_id, reminder_type, title, message, trigger_day, trigger_time) VALUES
-- These are template reminders - actual user-specific ones will be created on signup
('reminder_weekly_before_photo_template', 'template', 'weekly_photo', '📸 Weekly Before Photo', 'Time to take your weekly before photo! Document your starting point for this week.', 'sunday', '09:00'),
('reminder_weekly_after_photo_template', 'template', 'weekly_photo', '📸 Weekly After Photo', 'Great week! Time to take your weekly after photo and see your progress.', 'saturday', '18:00'),
('reminder_habit_check_template', 'template', 'habit', '⏰ Habit Check-in', 'Don''t forget to complete your daily habits! You''ve got this! 💪', 'sunday', '10:00'),
('reminder_weekly_review_template', 'template', 'achievement', '🏆 Weekly Review', 'Review your achievements and see what you''ve accomplished this week!', 'sunday', '20:00');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_id ON user_achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_period ON user_achievement_progress(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_active ON user_reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_recurring ON achievements(is_recurring);