-- Enhanced Achievement System with New Categories and Ideas
-- Additional achievements to complement existing ones

-- Social & Community Achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Social Butterfly', 'Add 10 friends to your network', 'social', 'friends_count', 10, 100, 'common', '🦋', 0, '[]'),
('Popular Trainer', 'Have 25 friends in your network', 'social', 'friends_count', 25, 250, 'rare', '🌟', 0, '[]'),
('Community Leader', 'Rank in top 10 on weekly leaderboard', 'social', 'weekly_rank', 10, 150, 'rare', '👑', 0, '[]'),
('Motivation Master', 'Stay in top 5 weekly ranking for 4 consecutive weeks', 'social', 'top_5_weeks', 4, 400, 'epic', '🎖️', 0, '[]'),
('Network Champion', 'Have friends from 5 different weekly challenges', 'social', 'friend_diversity', 5, 200, 'rare', '🌐', 0, '[]');

-- Data & Analytics Achievements  
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Data Detective', 'View your statistics 20 times', 'analytics', 'stats_views', 20, 50, 'common', '🔍', 0, '[]'),
('Analytics Expert', 'Check progress section 50 times', 'analytics', 'progress_views', 50, 100, 'common', '📊', 0, '[]'),
('Insight Seeker', 'View leaderboards 30 times', 'analytics', 'leaderboard_views', 30, 75, 'common', '👀', 0, '[]'),
('Pattern Master', 'Complete habits on same days for 4 consecutive weeks', 'analytics', 'pattern_consistency', 4, 300, 'epic', '🧩', 0, '[]'),
('Data Scientist', 'Upload progress photos in all 4 seasons of the year', 'analytics', 'seasonal_uploads', 4, 500, 'legendary', '🧑‍🔬', 0, '[]');

-- Routine & Habit Mastery Achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Routine Master', 'Complete same daily routine for 60 days', 'habits', 'routine_consistency', 60, 600, 'legendary', '⚡', 0, '[]'),
('Morning Champion', 'Complete morning habits before 8 AM for 21 days', 'habits', 'morning_habit_streak', 21, 300, 'epic', '🌅', 0, '[]'),
('Evening Warrior', 'Complete evening habits after 6 PM for 21 days', 'habits', 'evening_habit_streak', 21, 300, 'epic', '🌆', 0, '[]'),
('Weekend Warrior', 'Complete habits on weekends for 12 consecutive weekends', 'habits', 'weekend_consistency', 12, 400, 'epic', '🏃‍♂️', 0, '[]'),
('Habit Architect', 'Create 15 different habit categories', 'habits', 'habit_categories', 15, 200, 'rare', '🏗️', 0, '[]');

-- Enhanced Progress Tracking
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Transformation Artist', 'Upload before/after video comparisons for 3 different months', 'progress', 'monthly_video_comparisons', 3, 400, 'epic', '🎨', 0, '[]'),
('Visual Storyteller', 'Upload progress photos with descriptions 25 times', 'progress', 'described_uploads', 25, 250, 'rare', '📖', 0, '[]'),
('Consistency Photographer', 'Upload progress photo every week for 8 weeks', 'progress', 'weekly_photo_streak', 8, 300, 'epic', '📷', 0, '[]'),
('Video Blogger', 'Upload weekly progress videos for 6 consecutive weeks', 'progress', 'weekly_video_streak', 6, 350, 'epic', '🎬', 0, '[]'),
('Progress Perfectionist', 'Upload progress content for 100 consecutive days', 'progress', 'progress_day_streak', 100, 1000, 'legendary', '💎', 0, '[]');

-- Advanced Nutrition Achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Macro Master', 'Hit all macro targets (protein/carbs/fat) for 14 consecutive days', 'nutrition', 'macro_perfect_streak', 14, 400, 'epic', '⚖️', 0, '[]'),
('Hydration Hero', 'Meet daily water intake goals for 30 consecutive days', 'nutrition', 'hydration_streak', 30, 300, 'epic', '💧', 0, '[]'),
('Recipe Creator', 'Log 20 custom recipes', 'nutrition', 'custom_recipes', 20, 200, 'rare', '👨‍🍳', 0, '[]'),
('Calorie Counter', 'Log food for 90 consecutive days', 'nutrition', 'nutrition_tracking_streak', 90, 500, 'epic', '🔢', 0, '[]'),
('Balanced Eater', 'Maintain balanced macros (within 10% targets) for 21 days', 'nutrition', 'balanced_macro_streak', 21, 350, 'epic', '⚖️', 0, '[]');

-- Challenge & Goals Achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Challenge Master', 'Complete 50 daily challenges', 'challenges', 'daily_challenges_completed', 50, 300, 'rare', '🏆', 0, '[]'),
('Perfect Week', 'Complete 100% of daily challenges in a single week', 'challenges', 'perfect_challenge_week', 1, 200, 'rare', '✨', 0, '[]'),
('Goal Crusher', 'Complete 25 weekly habit goals', 'challenges', 'weekly_goals_completed', 25, 250, 'rare', '💥', 0, '[]'),
('Streak Legend', 'Maintain multiple 30+ day streaks simultaneously', 'challenges', 'simultaneous_streaks', 3, 600, 'legendary', '🔥', 0, '[]'),
('Comeback King', 'Restore a broken 20+ day streak back to 30+ days', 'challenges', 'streak_comeback', 1, 400, 'epic', '👑', 0, '[]');

-- Enhanced Consistency & Streaks
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Login Legend', 'Login for 180 consecutive days', 'consistency', 'login_streak', 180, 800, 'legendary', '🗓️', 0, '[]'),
('Dedication Demon', 'Complete any habit for 100 consecutive days', 'consistency', 'single_habit_streak', 100, 500, 'epic', '👹', 0, '[]'),
('Multi-Streak Master', 'Maintain 5 different 14+ day habit streaks simultaneously', 'consistency', 'multi_habit_streaks', 5, 400, 'epic', '🎯', 0, '[]'),
('Year-Long Warrior', 'Maintain at least one active habit for 365 days', 'consistency', 'yearly_consistency', 365, 1500, 'legendary', '⚔️', 0, '[]'),
('Unstoppable Force', 'Complete habits without missing any day for 200+ days', 'consistency', 'perfect_consistency', 200, 1000, 'legendary', '🚀', 0, '[]');

-- Advanced Onboarding & Engagement  
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
('Feature Explorer', 'Use all main features (habits, progress, nutrition, achievements) in one day', 'onboarding', 'feature_exploration', 1, 100, 'common', '🗺️', 0, '[]'),
('Power User', 'Use the app for 7 consecutive days within first 2 weeks', 'onboarding', 'early_engagement', 7, 150, 'common', '⚡', 0, '[]'),
('App Ambassador', 'Invite 3 friends within first month', 'onboarding', 'early_invites', 3, 200, 'rare', '📢', 0, '[]'),
('Quick Learner', 'Earn first 5 achievements within 2 weeks', 'onboarding', 'fast_achievements', 5, 250, 'rare', '🎓', 0, '[]'),
('Committed Starter', 'Complete first 30 days without missing login', 'onboarding', 'commitment_streak', 30, 300, 'epic', '💪', 0, '[]');