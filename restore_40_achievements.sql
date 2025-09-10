-- Restore full 40 achievement set for StriveTrack
-- Current schema: id, name, description, icon, points, requirement_type, requirement_value, created_at

-- Clear existing and add comprehensive set
DELETE FROM achievements;

-- Onboarding & Getting Started (8 achievements)
INSERT INTO achievements (id, name, description, icon, points, requirement_type, requirement_value) VALUES
('achievement_first_habit', 'Getting Started', 'Create your first habit', 'fas fa-star', 10, 'habits_created', 1),
('achievement_first_completion', 'First Step', 'Complete your first habit', 'fas fa-check-circle', 15, 'total_completions', 1),
('achievement_first_photo', 'Picture Perfect', 'Upload your first progress photo', 'fas fa-camera', 25, 'media_uploads', 1),
('achievement_profile_setup', 'Profile Pro', 'Complete your profile setup', 'fas fa-user-check', 20, 'profile_completed', 1),
('achievement_first_week', 'Week One Warrior', 'Use StriveTrack for 7 consecutive days', 'fas fa-calendar-week', 50, 'login_streak', 7),
('achievement_feature_explorer', 'Feature Explorer', 'Visit all main sections in one session', 'fas fa-compass', 30, 'sections_visited', 4),
('achievement_quick_learner', 'Quick Learner', 'Complete 3 habits in first 3 days', 'fas fa-rocket', 40, 'early_completions', 3),
('achievement_committed_starter', 'Committed Starter', 'Complete habits for 14 consecutive days', 'fas fa-handshake', 75, 'early_streak', 14),

-- Habit Building & Consistency (10 achievements) 
('achievement_habit_creator', 'Habit Creator', 'Create 5 different habits', 'fas fa-plus-circle', 50, 'habits_created', 5),
('achievement_week_streak', 'Week Warrior', 'Maintain a 7-day streak', 'fas fa-fire', 50, 'habit_streak', 7),
('achievement_month_streak', 'Monthly Master', 'Maintain a 30-day streak', 'fas fa-trophy', 200, 'habit_streak', 30),
('achievement_multi_habits', 'Multi-Tasker', 'Have 3 active habits simultaneously', 'fas fa-tasks', 75, 'active_habits', 3),
('achievement_habit_master', 'Habit Master', 'Create 10 different habits', 'fas fa-crown', 150, 'habits_created', 10),
('achievement_consistency_king', 'Consistency King', 'Complete habits 50 days total', 'fas fa-chess-king', 250, 'total_completions', 50),
('achievement_morning_person', 'Morning Person', 'Complete morning habits 21 times', 'fas fa-sun', 100, 'morning_completions', 21),
('achievement_evening_warrior', 'Evening Warrior', 'Complete evening habits 21 times', 'fas fa-moon', 100, 'evening_completions', 21),
('achievement_weekend_warrior', 'Weekend Warrior', 'Complete habits on 10 weekends', 'fas fa-calendar-alt', 120, 'weekend_completions', 10),
('achievement_perfect_week', 'Perfect Week', 'Complete all habits every day for a week', 'fas fa-star-of-life', 150, 'perfect_weeks', 1),

-- Progress Tracking & Media (8 achievements)
('achievement_photo_series', 'Photo Series', 'Upload 10 progress photos', 'fas fa-images', 100, 'media_uploads', 10),
('achievement_before_after', 'Transformation', 'Upload before and after photos', 'fas fa-exchange-alt', 150, 'before_after_pairs', 1),
('achievement_video_creator', 'Video Creator', 'Upload your first progress video', 'fas fa-video', 75, 'video_uploads', 1),
('achievement_weekly_documenter', 'Weekly Documenter', 'Upload progress photos weekly for 4 weeks', 'fas fa-camera-retro', 200, 'weekly_uploads', 4),
('achievement_visual_journey', 'Visual Journey', 'Upload 25 total media items', 'fas fa-film', 250, 'media_uploads', 25),
('achievement_monthly_milestone', 'Monthly Milestone', 'Upload progress photo every month for 3 months', 'fas fa-calendar-check', 180, 'monthly_uploads', 3),
('achievement_progress_pro', 'Progress Pro', 'Upload 50 total progress items', 'fas fa-chart-line', 400, 'media_uploads', 50),
('achievement_visual_storyteller', 'Visual Storyteller', 'Add descriptions to 15 uploads', 'fas fa-pen-fancy', 120, 'described_uploads', 15),

-- Social & Community (6 achievements)
('achievement_first_friend', 'Social Butterfly', 'Add your first friend', 'fas fa-user-friends', 25, 'friends_added', 1),
('achievement_friend_network', 'Network Builder', 'Add 5 friends to your network', 'fas fa-users', 75, 'friends_added', 5),
('achievement_popular_trainer', 'Popular Trainer', 'Have 10 friends in network', 'fas fa-star', 150, 'total_friends', 10),
('achievement_leaderboard_climber', 'Leaderboard Climber', 'Rank in top 10 weekly', 'fas fa-medal', 100, 'weekly_rank_top10', 1),
('achievement_community_leader', 'Community Leader', 'Stay in top 5 for 3 weeks', 'fas fa-crown', 300, 'top_5_weeks', 3),
('achievement_motivator', 'Motivator', 'Help 3 friends complete habits', 'fas fa-hands-helping', 200, 'friends_helped', 3),

-- Challenges & Goals (4 achievements)
('achievement_challenge_novice', 'Challenge Novice', 'Complete 5 daily challenges', 'fas fa-target', 50, 'daily_challenges', 5),
('achievement_challenge_master', 'Challenge Master', 'Complete 25 daily challenges', 'fas fa-bullseye', 200, 'daily_challenges', 25),
('achievement_goal_crusher', 'Goal Crusher', 'Achieve weekly goals 10 times', 'fas fa-hammer', 150, 'weekly_goals', 10),
('achievement_streak_legend', 'Streak Legend', 'Maintain 60-day streak', 'fas fa-fire-alt', 500, 'habit_streak', 60),

-- Points & Milestones (4 achievements)
('achievement_100_points', 'Century Club', 'Earn 100 total points', 'fas fa-medal', 0, 'total_points', 100),
('achievement_500_points', 'Point Master', 'Earn 500 total points', 'fas fa-crown', 0, 'total_points', 500),
('achievement_1000_points', 'Point Legend', 'Earn 1000 total points', 'fas fa-gem', 0, 'total_points', 1000),
('achievement_elite_status', 'Elite Status', 'Reach 2000 total points', 'fas fa-trophy', 0, 'total_points', 2000);