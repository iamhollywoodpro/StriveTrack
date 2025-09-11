-- StriveTrack 2.0 - Realistic & Engaging Achievement System
-- Based on actual user actions users will want to complete

-- Clear existing unrealistic achievements
DELETE FROM achievements WHERE name IN (
    'Rainbow Plate', 'Color Explorer', 'Nutrition Rainbow', 'Seasonal Eater'
);

-- CATEGORY 1: APP ENGAGEMENT (Getting users started and engaged)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('first_steps', 'First Steps', 'Complete your profile setup', 'engagement', 'profile_complete', 1, 25, 'common', '👋', 0, CURRENT_TIMESTAMP),
('welcome_aboard', 'Welcome Aboard', 'Upload your first progress photo', 'engagement', 'media_upload', 1, 50, 'common', '📸', 0, CURRENT_TIMESTAMP),
('habit_creator', 'Habit Creator', 'Create your first habit', 'engagement', 'habit_created', 1, 30, 'common', '✨', 0, CURRENT_TIMESTAMP),
('goal_setter', 'Goal Setter', 'Set your first fitness goal', 'engagement', 'goal_created', 1, 30, 'common', '🎯', 0, CURRENT_TIMESTAMP),
('app_explorer', 'App Explorer', 'Visit all 6 main sections of the app', 'engagement', 'sections_visited', 6, 75, 'rare', '🗺️', 0, CURRENT_TIMESTAMP);

-- CATEGORY 2: PROGRESS TRACKING (Visual progress documentation)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('shutterbugg', 'Shutterbug', 'Upload 10 progress photos', 'progress', 'media_upload_photos', 10, 100, 'common', '📷', 0, CURRENT_TIMESTAMP),
('transformation_tracker', 'Transformation Tracker', 'Upload before/after photo comparison', 'progress', 'before_after_upload', 1, 150, 'rare', '🔄', 0, CURRENT_TIMESTAMP),
('video_blogger', 'Video Blogger', 'Upload 5 progress videos', 'progress', 'media_upload_videos', 5, 200, 'rare', '🎬', 0, CURRENT_TIMESTAMP),
('consistent_documenter', 'Consistent Documenter', 'Upload progress content for 7 consecutive days', 'progress', 'upload_streak_days', 7, 300, 'epic', '📅', 0, CURRENT_TIMESTAMP),
('visual_storyteller', 'Visual Storyteller', 'Upload 50 progress photos total', 'progress', 'media_upload_photos', 50, 500, 'epic', '📖', 0, CURRENT_TIMESTAMP),
('content_creator', 'Content Creator', 'Upload 100 pieces of media (photos + videos)', 'progress', 'media_upload_total', 100, 1000, 'legendary', '🌟', 0, CURRENT_TIMESTAMP);

-- CATEGORY 3: HABIT MASTERY (Daily consistency and habit building)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('consistency_starter', 'Consistency Starter', 'Complete habits for 3 consecutive days', 'habits', 'habit_streak_days', 3, 75, 'common', '🔥', 0, CURRENT_TIMESTAMP),
('week_warrior', 'Week Warrior', 'Complete habits for 7 consecutive days', 'habits', 'habit_streak_days', 7, 200, 'rare', '⚔️', 0, CURRENT_TIMESTAMP),
('habit_master', 'Habit Master', 'Complete 100 individual habit instances', 'habits', 'habits_completed_total', 100, 300, 'rare', '👑', 0, CURRENT_TIMESTAMP),
('streak_legend', 'Streak Legend', 'Maintain a 30-day habit streak', 'habits', 'habit_streak_days', 30, 750, 'epic', '🏆', 0, CURRENT_TIMESTAMP),
('routine_king', 'Routine King', 'Complete habits for 100 consecutive days', 'habits', 'habit_streak_days', 100, 2000, 'legendary', '💎', 0, CURRENT_TIMESTAMP),
('multi_habit_master', 'Multi-Habit Master', 'Create and maintain 5 different active habits', 'habits', 'active_habits_count', 5, 400, 'epic', '🎪', 0, CURRENT_TIMESTAMP);

-- CATEGORY 4: GOAL ACHIEVEMENT (Accomplishing fitness objectives)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('goal_getter', 'Goal Getter', 'Complete your first goal', 'goals', 'goals_completed', 1, 100, 'common', '🎯', 0, CURRENT_TIMESTAMP),
('overachiever', 'Overachiever', 'Complete 5 goals', 'goals', 'goals_completed', 5, 300, 'rare', '🚀', 0, CURRENT_TIMESTAMP),
('ambitious_planner', 'Ambitious Planner', 'Have 3 active goals at once', 'goals', 'active_goals_count', 3, 150, 'rare', '📋', 0, CURRENT_TIMESTAMP),
('goal_crusher', 'Goal Crusher', 'Complete 10 goals', 'goals', 'goals_completed', 10, 750, 'epic', '💪', 0, CURRENT_TIMESTAMP),
('achievement_hunter', 'Achievement Hunter', 'Complete goals in 3 different categories', 'goals', 'goal_categories_completed', 3, 500, 'epic', '🏅', 0, CURRENT_TIMESTAMP);

-- CATEGORY 5: SOCIAL ENGAGEMENT (Community interaction)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('social_butterfly', 'Social Butterfly', 'Add your first friend', 'social', 'friends_added', 1, 50, 'common', '🦋', 0, CURRENT_TIMESTAMP),
('networker', 'Networker', 'Connect with 5 friends', 'social', 'friends_added', 5, 150, 'rare', '🌐', 0, CURRENT_TIMESTAMP),
('challenge_creator', 'Challenge Creator', 'Create your first challenge', 'social', 'challenges_created', 1, 100, 'common', '⚡', 0, CURRENT_TIMESTAMP),
('challenge_champion', 'Challenge Champion', 'Complete 5 challenges', 'social', 'challenges_completed', 5, 300, 'rare', '🏆', 0, CURRENT_TIMESTAMP),
('community_leader', 'Community Leader', 'Appear on weekly leaderboard top 10', 'social', 'leaderboard_top_10', 1, 200, 'epic', '👑', 0, CURRENT_TIMESTAMP);

-- CATEGORY 6: POINTS & ENGAGEMENT (App usage and progression)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('point_starter', 'Point Starter', 'Earn your first 100 points', 'points', 'total_points', 100, 25, 'common', '⭐', 0, CURRENT_TIMESTAMP),
('rising_star', 'Rising Star', 'Earn 500 points', 'points', 'total_points', 500, 100, 'common', '🌟', 0, CURRENT_TIMESTAMP),
('point_collector', 'Point Collector', 'Earn 1,000 points', 'points', 'total_points', 1000, 200, 'rare', '💫', 0, CURRENT_TIMESTAMP),
('elite_member', 'Elite Member', 'Earn 5,000 points', 'points', 'total_points', 5000, 500, 'epic', '💎', 0, CURRENT_TIMESTAMP),
('legend_status', 'Legend Status', 'Earn 10,000 points', 'points', 'total_points', 10000, 1000, 'legendary', '🔥', 0, CURRENT_TIMESTAMP),
('daily_grinder', 'Daily Grinder', 'Use the app for 30 consecutive days', 'engagement', 'login_streak_days', 30, 400, 'epic', '📱', 0, CURRENT_TIMESTAMP);

-- CATEGORY 7: SPECIAL MILESTONES (Long-term engagement)
INSERT OR REPLACE INTO achievements (
    id, name, description, category, requirement_type, requirement_value, 
    points, rarity, icon_emoji, is_hidden, created_at
) VALUES 
('comeback_kid', 'Comeback Kid', 'Return to complete habits after a 3+ day break', 'special', 'streak_recovery', 1, 200, 'rare', '💪', 0, CURRENT_TIMESTAMP),
('perfectionist', 'Perfectionist', 'Complete 100% of habits in a week', 'special', 'perfect_week', 1, 300, 'epic', '✨', 0, CURRENT_TIMESTAMP),
('early_bird', 'Early Bird', 'Complete morning habits (before 9 AM) for 7 consecutive days', 'special', 'morning_streak', 7, 250, 'rare', '🌅', 0, CURRENT_TIMESTAMP),
('night_owl', 'Night Owl', 'Complete evening habits (after 7 PM) for 7 consecutive days', 'special', 'evening_streak', 7, 250, 'rare', '🌙', 0, CURRENT_TIMESTAMP),
('weekend_warrior', 'Weekend Warrior', 'Maintain habits on weekends for 4 consecutive weeks', 'special', 'weekend_consistency', 4, 400, 'epic', '🏃‍♂️', 0, CURRENT_TIMESTAMP),
('transformation_champion', 'Transformation Champion', 'Use StriveTrack for 100 consecutive days', 'special', 'app_usage_days', 100, 2500, 'legendary', '🏅', 0, CURRENT_TIMESTAMP);

-- Add rarity-based point bonuses
UPDATE achievements SET points = points * 1.5 WHERE rarity = 'epic';
UPDATE achievements SET points = points * 2 WHERE rarity = 'legendary';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_requirement ON achievements(requirement_type);