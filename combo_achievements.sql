-- Achievement Streaks & Combos System
-- These are special achievements for earning multiple achievements

INSERT INTO achievements (name, description, category, requirement_type, requirement_value, points, rarity, icon_emoji, is_hidden, prerequisite_achievement_ids) VALUES
-- Achievement Combo Achievements
('Achievement Spree', 'Unlock 3 achievements in quick succession', 'challenges', 'achievement_combo', 3, 150, 'rare', '🌟', 0, '[]'),
('Achievement Frenzy', 'Unlock 5 achievements in a short time', 'challenges', 'achievement_combo', 5, 300, 'epic', '⚡', 0, '[]'),
('Achievement Hurricane', 'Unlock 10 achievements in one day', 'challenges', 'daily_achievement_count', 10, 500, 'epic', '🌪️', 0, '[]'),

-- Category Mastery Achievements
('Onboarding Master', 'Complete all achievements in Getting Started category', 'onboarding', 'category_mastery', 100, 400, 'epic', '🎓', 0, '[]'),
('Habit Guru', 'Complete all achievements in Habit Building category', 'habits', 'category_mastery', 100, 400, 'epic', '🧘', 0, '[]'),
('Progress Pioneer', 'Complete all achievements in Progress Tracking category', 'progress', 'category_mastery', 100, 400, 'epic', '📈', 0, '[]'),
('Nutrition Ninja', 'Complete all achievements in Nutrition & Health category', 'nutrition', 'category_mastery', 100, 400, 'epic', '🥷', 0, '[]'),
('Social Superstar', 'Complete all achievements in Social & Community category', 'social', 'category_mastery', 100, 400, 'epic', '⭐', 0, '[]'),
('Consistency Champion', 'Complete all achievements in Consistency & Streaks category', 'consistency', 'category_mastery', 100, 400, 'epic', '🏅', 0, '[]'),
('Challenge Conqueror', 'Complete all achievements in Challenges & Goals category', 'challenges', 'category_mastery', 100, 400, 'epic', '👑', 0, '[]'),
('Analytics Ace', 'Complete all achievements in Data & Analytics category', 'analytics', 'category_mastery', 100, 400, 'epic', '🎯', 0, '[]'),

-- Time-based Achievement Streaks
('Daily Achiever', 'Unlock at least 1 achievement every day for 7 days', 'consistency', 'daily_achievement_streak', 7, 350, 'epic', '🗓️', 0, '[]'),
('Weekly Warrior', 'Unlock achievements for 4 consecutive weeks', 'consistency', 'weekly_achievement_streak', 4, 400, 'epic', '📅', 0, '[]'),
('Achievement Addict', 'Unlock 100 total achievements', 'challenges', 'total_achievements', 100, 1000, 'legendary', '🏆', 0, '[]'),

-- Speed Achievements
('Quick Start', 'Unlock 5 achievements in your first week', 'onboarding', 'achievements_in_timeframe', 5, 200, 'rare', '🚀', 0, '[]'),
('Fast Tracker', 'Unlock 10 achievements in your first month', 'onboarding', 'achievements_in_timeframe', 10, 350, 'epic', '💨', 0, '[]'),
('Speed Demon', 'Unlock 20 achievements in your first month', 'onboarding', 'achievements_in_timeframe', 20, 600, 'legendary', '👹', 0, '[]'),

-- Seasonal/Holiday Achievement Placeholders (for future implementation)
('New Year Champion', 'Complete special New Year challenges', 'challenges', 'seasonal_event', 1, 300, 'epic', '🎊', 1, '[]'),
('Summer Fitness', 'Complete summer fitness goals', 'challenges', 'seasonal_event', 1, 300, 'epic', '☀️', 1, '[]'),
('Halloween Spooky', 'Complete Halloween themed challenges', 'challenges', 'seasonal_event', 1, 300, 'epic', '🎃', 1, '[]'),
('Holiday Spirit', 'Complete holiday season challenges', 'challenges', 'seasonal_event', 1, 300, 'epic', '🎄', 1, '[]'),

-- Monthly Rotating Challenges (hidden until activated)
('Monthly Marathon', 'Complete this month\'s special challenge', 'challenges', 'monthly_challenge', 1, 250, 'rare', '🏃', 1, '[]'),
('Monthly Master', 'Complete monthly challenges for 3 consecutive months', 'challenges', 'consecutive_monthly', 3, 500, 'epic', '📆', 1, '[]'),
('Monthly Legend', 'Complete monthly challenges for 12 consecutive months', 'challenges', 'consecutive_monthly', 12, 1200, 'legendary', '📊', 1, '[]'),

-- Social Competition Achievements
('Achievement Racer', 'Unlock more achievements than 90% of friends this week', 'social', 'achievement_rank', 90, 300, 'epic', '🏁', 0, '[]'),
('Achievement King', 'Have the most achievements among all friends', 'social', 'achievement_leaderboard', 1, 500, 'legendary', '👑', 0, '[]'),

-- Perfectionist Achievements
('Perfectionist', 'Complete a full category without missing any achievements', 'challenges', 'perfect_category', 1, 400, 'epic', '💎', 0, '[]'),
('Completionist', 'Unlock every available achievement (non-hidden)', 'challenges', 'completionist', 100, 2000, 'legendary', '🌟', 0, '[]');