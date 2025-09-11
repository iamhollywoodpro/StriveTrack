-- Simple achievements update to replace unrealistic ones with practical ones
-- Works with existing schema

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
    name, description, requirement_type, requirement_value, 
    points, difficulty, icon_emoji, is_hidden
) VALUES 

-- Progress Tracking Achievements (based on actual app usage)
('First Upload', 'Upload your first progress photo or video', 'media_upload', 1, 50, 'easy', '📸', 0),
('Documenter', 'Upload 10 progress photos', 'media_upload_photos', 10, 150, 'medium', '📷', 0),
('Video Creator', 'Upload 5 progress videos', 'media_upload_videos', 5, 200, 'medium', '🎬', 0),
('Transformation Tracker', 'Upload before/after comparison photos', 'before_after_upload', 1, 250, 'medium', '🔄', 0),
('Content Creator', 'Upload 50 pieces of media total', 'media_upload_total', 50, 500, 'hard', '🌟', 0),

-- Habit Building Achievements (based on actual habit system)
('Habit Starter', 'Create your first habit', 'habit_created', 1, 30, 'easy', '✨', 0),
('Three Day Streak', 'Complete habits for 3 consecutive days', 'habit_streak_days', 3, 75, 'easy', '🔥', 0),
('Week Warrior', 'Complete habits for 7 consecutive days', 'habit_streak_days', 7, 200, 'medium', '⚔️', 0),
('Habit Master', 'Complete 100 individual habit instances', 'habits_completed_total', 100, 300, 'medium', '👑', 0),
('Streak Legend', 'Maintain a 30-day habit streak', 'habit_streak_days', 30, 750, 'hard', '🏆', 0),

-- Goal Achievement (based on actual goals system)
('Goal Setter', 'Create your first goal', 'goal_created', 1, 30, 'easy', '🎯', 0),
('Goal Getter', 'Complete your first goal', 'goals_completed', 1, 100, 'easy', '🎯', 0),
('Overachiever', 'Complete 5 goals', 'goals_completed', 5, 300, 'medium', '🚀', 0),
('Goal Crusher', 'Complete 10 goals', 'goals_completed', 10, 750, 'hard', '💪', 0),

-- Social Engagement (based on actual social features)
('Social Starter', 'Add your first friend', 'friends_added', 1, 50, 'easy', '🦋', 0),
('Networker', 'Connect with 5 friends', 'friends_added', 5, 150, 'medium', '🌐', 0),
('Challenge Creator', 'Create your first challenge', 'challenges_created', 1, 100, 'easy', '⚡', 0),
('Challenge Champion', 'Complete 5 challenges', 'challenges_completed', 5, 300, 'medium', '🏆', 0),

-- App Engagement (based on actual app usage)
('Welcome Aboard', 'Complete your profile setup', 'profile_complete', 1, 25, 'easy', '👋', 0),
('App Explorer', 'Visit all main sections of the app', 'sections_visited', 6, 75, 'easy', '🗺️', 0),
('Daily User', 'Use the app for 7 consecutive days', 'login_streak_days', 7, 100, 'easy', '📱', 0),
('Dedicated User', 'Use the app for 30 consecutive days', 'login_streak_days', 30, 400, 'medium', '📱', 0),

-- Points & Progress (motivational milestones)
('Point Starter', 'Earn your first 100 points', 'total_points', 100, 25, 'easy', '⭐', 0),
('Rising Star', 'Earn 500 points', 'total_points', 500, 100, 'easy', '🌟', 0),
('Point Collector', 'Earn 1,000 points', 'total_points', 1000, 200, 'medium', '💫', 0),
('Elite Member', 'Earn 5,000 points', 'total_points', 5000, 500, 'hard', '💎', 0),

-- Special Achievements (engaging and fun)
('Early Bird', 'Complete habits before 9 AM for 7 consecutive days', 'morning_streak', 7, 250, 'medium', '🌅', 0),
('Night Owl', 'Complete habits after 7 PM for 7 consecutive days', 'evening_streak', 7, 250, 'medium', '🌙', 0),
('Weekend Warrior', 'Maintain habits on weekends for 4 consecutive weeks', 'weekend_consistency', 4, 400, 'hard', '🏃‍♂️', 0),
('Comeback Kid', 'Return to complete habits after a 3+ day break', 'streak_recovery', 1, 200, 'medium', '💪', 0),
('Perfectionist', 'Complete 100% of habits in a week', 'perfect_week', 1, 300, 'hard', '✨', 0);

-- Update existing achievements to have better descriptions
UPDATE achievements 
SET description = 'Upload your first progress photo to document your fitness journey'
WHERE name = 'First Upload';

UPDATE achievements 
SET description = 'Create meaningful fitness habits that support your goals'
WHERE name = 'Habit Starter';

UPDATE achievements 
SET description = 'Set specific, achievable fitness goals to work towards'
WHERE name = 'Goal Setter';