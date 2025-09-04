-- Seed achievements and competitions for StriveTrack
-- This will populate the database with sample data so the systems work properly

-- First, let's ensure the achievements table has some sample achievements
INSERT OR IGNORE INTO achievements (id, name, description, requirement_type, requirement_value, points, category, rarity, icon_name) VALUES
('ach_welcome', 'Welcome to StriveTrack!', 'Created your account and joined the fitness community', 'account_created', 1, 50, 'getting_started', 'common', 'fas fa-user-plus'),
('ach_first_habit', 'First Steps', 'Created your first habit', 'habits_created', 1, 100, 'habits', 'common', 'fas fa-plus-circle'),
('ach_habit_streak_3', '3-Day Streak', 'Completed a habit for 3 days in a row', 'habit_streak', 3, 150, 'habits', 'common', 'fas fa-fire'),
('ach_habit_streak_7', 'Week Warrior', 'Completed a habit for 7 days in a row', 'habit_streak', 7, 300, 'habits', 'rare', 'fas fa-calendar-week'),
('ach_habit_streak_30', 'Monthly Master', 'Completed a habit for 30 days in a row', 'habit_streak', 30, 1000, 'habits', 'epic', 'fas fa-calendar-alt'),
('ach_nutrition_first', 'Nutrition Newcomer', 'Logged your first nutrition entry', 'nutrition_logs', 1, 100, 'nutrition', 'common', 'fas fa-apple-alt'),
('ach_nutrition_week', 'Nutrition Tracker', 'Logged nutrition for 7 days', 'nutrition_logs', 7, 200, 'nutrition', 'rare', 'fas fa-chart-line'),
('ach_weight_first', 'Scale Master', 'Logged your first weight entry', 'weight_logs', 1, 100, 'progress', 'common', 'fas fa-weight'),
('ach_photo_first', 'Picture Perfect', 'Uploaded your first progress photo', 'photos_uploaded', 1, 150, 'progress', 'common', 'fas fa-camera'),
('ach_goal_setter', 'Goal Getter', 'Set your first fitness goal', 'goals_created', 1, 100, 'goals', 'common', 'fas fa-bullseye'),
('ach_early_bird', 'Early Bird', 'Completed habits before 8 AM', 'early_completion', 1, 200, 'habits', 'rare', 'fas fa-sun'),
('ach_night_owl', 'Night Owl', 'Completed habits after 10 PM', 'late_completion', 1, 200, 'habits', 'rare', 'fas fa-moon'),
('ach_perfect_week', 'Perfect Week', 'Completed all your habits for an entire week', 'perfect_week', 1, 500, 'habits', 'epic', 'fas fa-star'),
('ach_social_butterfly', 'Social Butterfly', 'Added your first friend', 'friends_added', 1, 150, 'social', 'common', 'fas fa-user-friends'),
('ach_competitor', 'Competitor', 'Joined your first competition', 'competitions_joined', 1, 200, 'competitions', 'rare', 'fas fa-trophy'),
('ach_winner', 'Winner', 'Won your first competition', 'competitions_won', 1, 500, 'competitions', 'epic', 'fas fa-crown'),
('ach_consistency_king', 'Consistency King', 'Logged activities for 30 consecutive days', 'consecutive_days', 30, 1000, 'consistency', 'legendary', 'fas fa-medal'),
('ach_data_lover', 'Data Lover', 'Logged 100 total activities across all categories', 'total_activities', 100, 750, 'progress', 'epic', 'fas fa-chart-bar'),
('ach_milestone_master', 'Milestone Master', 'Reached 10 goal milestones', 'milestones_reached', 10, 400, 'goals', 'rare', 'fas fa-flag-checkered'),
('ach_transformation', 'Transformation', 'Uploaded before and after photos', 'transformation_photos', 1, 300, 'progress', 'rare', 'fas fa-exchange-alt'),
('ach_motivator', 'Motivator', 'Helped 5 friends complete their goals', 'friends_helped', 5, 400, 'social', 'epic', 'fas fa-hands-helping'),
('ach_explorer', 'Explorer', 'Used all major features of StriveTrack', 'features_used', 5, 600, 'getting_started', 'epic', 'fas fa-compass'),
('ach_veteran', 'Veteran', 'Active member for 6 months', 'account_age_days', 180, 1000, 'milestones', 'legendary', 'fas fa-shield-alt'),
('ach_legend', 'StriveTrack Legend', 'Earned 20 achievements', 'achievements_earned', 20, 2000, 'meta', 'legendary', 'fas fa-dragon');

-- Now let's add some sample competitions
INSERT OR IGNORE INTO competitions (id, title, description, competition_type, creator_id, start_date, end_date, status, max_participants, prize_description) VALUES
('comp_new_year', 'New Year Fitness Challenge', 'Start the year strong with daily habits and consistent tracking', 'habit_completion', 'admin_user', '2025-01-01', '2025-02-01', 'active', 100, 'Winner gets StriveTrack Premium for 1 year'),
('comp_weight_loss', '30-Day Weight Loss Challenge', 'Healthy weight loss competition with weekly check-ins', 'weight_loss', 'admin_user', '2025-01-15', '2025-02-15', 'active', 50, 'Fitness tracker and meal prep containers'),
('comp_consistency', 'Consistency Challenge', 'Complete your habits every day for 2 weeks', 'habit_streak', 'admin_user', '2025-01-01', '2025-01-15', 'active', 75, 'Custom StriveTrack water bottle and workout towel'),
('comp_transformation', 'Transformation Thursday', 'Share your progress photos and inspire others', 'photo_challenge', 'admin_user', '2025-01-01', '2025-03-01', 'active', 200, 'Feature in StriveTrack success stories'),
('comp_nutrition', 'Nutrition Master', 'Log complete nutrition data for 21 days', 'nutrition_tracking', 'admin_user', '2025-01-10', '2025-02-01', 'active', 60, 'Consultation with registered dietitian'),
('comp_community', 'Community Builder', 'Help the most people achieve their goals', 'social_impact', 'admin_user', '2025-01-01', '2025-04-01', 'active', 30, 'StriveTrack Community Champion badge'),
('comp_weekend_warrior', 'Weekend Warrior', 'Special weekend-only fitness challenges', 'weekend_challenge', 'admin_user', '2025-01-04', '2025-01-26', 'active', 80, 'Weekend workout gear package');

-- Update any existing admin user ID to match competition creator
UPDATE competitions SET creator_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1) WHERE creator_id = 'admin_user';

-- If no admin user exists, create a placeholder (this should be replaced with actual admin ID)
INSERT OR IGNORE INTO users (id, email, password_hash, role, points, name, user_type, weight_unit, height_cm, created_at, updated_at) 
VALUES ('admin_system', 'admin@strivetrack.com', 'placeholder_hash', 'admin', 0, 'System Admin', 'advanced', 'lbs', 175, datetime('now'), datetime('now'));

-- Update competitions to use system admin if no real admin exists
UPDATE competitions SET creator_id = 'admin_system' WHERE creator_id NOT IN (SELECT id FROM users WHERE role = 'admin');

-- Create some sample user achievements to show the system working
-- This will only work if users exist, so it's safe to ignore errors
INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at) 
SELECT 
    'ua_welcome_' || u.id,
    u.id,
    'ach_welcome',
    datetime('now')
FROM users u 
WHERE u.role != 'admin'
LIMIT 5;

INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at) 
SELECT 
    'ua_first_habit_' || u.id,
    u.id,
    'ach_first_habit',
    datetime('now', '-1 day')
FROM users u 
WHERE u.role != 'admin' AND EXISTS (SELECT 1 FROM habits WHERE user_id = u.id)
LIMIT 3;