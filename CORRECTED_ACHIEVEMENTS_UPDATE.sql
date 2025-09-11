-- Corrected achievements update using actual table schema
-- Schema: id, name, description, icon, points, requirement_type, requirement_value, created_at, category, rarity, is_recurring

-- Remove unrealistic achievements
DELETE FROM achievements WHERE name IN (
    'Rainbow Plate Challenge', 
    'Color Explorer', 
    'Nutrition Rainbow',
    'Seasonal Eater',
    'Macro Color Master'
);

-- Add practical, engaging achievements that users will actually want to complete
INSERT OR REPLACE INTO achievements (
    name, description, icon, points, requirement_type, requirement_value, 
    category, rarity, is_recurring
) VALUES 

-- Progress Tracking Achievements (based on actual app usage)
('First Upload', 'Upload your first progress photo or video', '📸', 50, 'media_upload', 1, 'progress', 'common', 0),
('Shutterbugg', 'Upload 10 progress photos', '📷', 150, 'media_upload_photos', 10, 'progress', 'common', 0),
('Video Creator', 'Upload 5 progress videos', '🎬', 200, 'media_upload_videos', 5, 'progress', 'rare', 0),
('Transformation Tracker', 'Upload before/after comparison photos', '🔄', 250, 'before_after_upload', 1, 'progress', 'rare', 0),
('Visual Storyteller', 'Upload 50 progress photos total', '📖', 500, 'media_upload_photos', 50, 'progress', 'epic', 0),
('Content Creator', 'Upload 100 pieces of media total', '🌟', 1000, 'media_upload_total', 100, 'progress', 'legendary', 0),

-- Habit Building Achievements (based on actual habit system)
('Habit Creator', 'Create your first habit', '✨', 30, 'habit_created', 1, 'habits', 'common', 0),
('Consistency Starter', 'Complete habits for 3 consecutive days', '🔥', 75, 'habit_streak_days', 3, 'habits', 'common', 0),
('Week Warrior', 'Complete habits for 7 consecutive days', '⚔️', 200, 'habit_streak_days', 7, 'habits', 'rare', 0),
('Habit Master', 'Complete 100 individual habit instances', '👑', 300, 'habits_completed_total', 100, 'habits', 'rare', 0),
('Streak Legend', 'Maintain a 30-day habit streak', '🏆', 750, 'habit_streak_days', 30, 'habits', 'epic', 0),
('Routine King', 'Complete habits for 100 consecutive days', '💎', 2000, 'habit_streak_days', 100, 'habits', 'legendary', 0),

-- Goal Achievement (based on actual goals system)
('Goal Setter', 'Create your first fitness goal', '🎯', 30, 'goal_created', 1, 'goals', 'common', 0),
('Goal Getter', 'Complete your first goal', '🎯', 100, 'goals_completed', 1, 'goals', 'common', 0),
('Overachiever', 'Complete 5 goals', '🚀', 300, 'goals_completed', 5, 'goals', 'rare', 0),
('Goal Crusher', 'Complete 10 goals', '💪', 750, 'goals_completed', 10, 'goals', 'epic', 0),
('Achievement Hunter', 'Complete goals in 3 different categories', '🏅', 500, 'goal_categories_completed', 3, 'goals', 'epic', 0),

-- Social Engagement (based on actual social features)
('Social Butterfly', 'Add your first friend', '🦋', 50, 'friends_added', 1, 'social', 'common', 0),
('Networker', 'Connect with 5 friends', '🌐', 150, 'friends_added', 5, 'social', 'rare', 0),
('Challenge Creator', 'Create your first challenge', '⚡', 100, 'challenges_created', 1, 'social', 'common', 0),
('Challenge Champion', 'Complete 5 challenges', '🏆', 300, 'challenges_completed', 5, 'social', 'rare', 0),
('Community Leader', 'Appear on weekly leaderboard top 10', '👑', 200, 'leaderboard_top_10', 1, 'social', 'epic', 0),

-- App Engagement (based on actual app usage)
('First Steps', 'Complete your profile setup', '👋', 25, 'profile_complete', 1, 'engagement', 'common', 0),
('App Explorer', 'Visit all main sections of the app', '🗺️', 75, 'sections_visited', 6, 'engagement', 'rare', 0),
('Daily Grinder', 'Use the app for 30 consecutive days', '📱', 400, 'login_streak_days', 30, 'engagement', 'epic', 0),

-- Points & Progress (motivational milestones)
('Point Starter', 'Earn your first 100 points', '⭐', 25, 'total_points', 100, 'points', 'common', 0),
('Rising Star', 'Earn 500 points', '🌟', 100, 'total_points', 500, 'points', 'common', 0),
('Point Collector', 'Earn 1,000 points', '💫', 200, 'total_points', 1000, 'points', 'rare', 0),
('Elite Member', 'Earn 5,000 points', '💎', 500, 'total_points', 5000, 'points', 'epic', 0),
('Legend Status', 'Earn 10,000 points', '🔥', 1000, 'total_points', 10000, 'points', 'legendary', 0),

-- Special Achievements (engaging and fun)
('Early Bird', 'Complete morning habits before 9 AM for 7 consecutive days', '🌅', 250, 'morning_streak', 7, 'special', 'rare', 0),
('Night Owl', 'Complete evening habits after 7 PM for 7 consecutive days', '🌙', 250, 'evening_streak', 7, 'special', 'rare', 0),
('Weekend Warrior', 'Maintain habits on weekends for 4 consecutive weeks', '🏃‍♂️', 400, 'weekend_consistency', 4, 'special', 'epic', 0),
('Comeback Kid', 'Return to complete habits after a 3+ day break', '💪', 200, 'streak_recovery', 1, 'special', 'rare', 0),
('Perfectionist', 'Complete 100% of habits in a week', '✨', 300, 'perfect_week', 1, 'special', 'epic', 0),
('Transformation Champion', 'Use StriveTrack for 100 consecutive days', '🏅', 2500, 'app_usage_days', 100, 'special', 'legendary', 0);

-- Remove any remaining unrealistic achievements
DELETE FROM achievements WHERE description LIKE '%color%' AND description LIKE '%food%';
DELETE FROM achievements WHERE description LIKE '%rainbow%';
DELETE FROM achievements WHERE name LIKE '%Rainbow%';