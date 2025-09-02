-- Add nutrition and video-related daily challenges
INSERT OR REPLACE INTO daily_challenges VALUES 
('daily_nutrition_logger', 'Nutrition Logger', 'Log 3 meals with macros today', '🍽️', 'nutrition', 3, 40, 'common', 1, CURRENT_TIMESTAMP),
('daily_macro_tracker', 'Macro Tracker', 'Hit all 3 macro goals today', '⚖️', 'macros', 1, 75, 'rare', 1, CURRENT_TIMESTAMP),
('daily_hydration_hero', 'Hydration Hero', 'Drink 8 glasses of water today', '💧', 'hydration', 8, 25, 'common', 1, CURRENT_TIMESTAMP),
('daily_video_creator', 'Video Creator', 'Upload 1 progress video today', '🎥', 'videos', 1, 60, 'rare', 1, CURRENT_TIMESTAMP),
('daily_healthy_eater', 'Healthy Eater', 'Log only healthy foods today (5+ items)', '🥗', 'healthy_foods', 5, 50, 'epic', 1, CURRENT_TIMESTAMP),
('daily_protein_power', 'Protein Power', 'Meet your protein goal today', '🍖', 'protein_goal', 1, 35, 'common', 1, CURRENT_TIMESTAMP);