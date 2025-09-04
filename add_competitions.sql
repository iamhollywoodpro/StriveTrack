-- Add sample competitions data
INSERT OR IGNORE INTO competitions (id, title, description, competition_type, creator_id, start_date, end_date, status, max_participants, entry_requirements, prize_description, rules) VALUES
    ('comp_001', 'New Year Weight Loss Challenge', 'Start the year right with our community weight loss challenge!', 'weight_loss', 'admin', '2024-01-01T00:00:00Z', '2024-03-31T23:59:59Z', 'active', 100, '{"min_weight": 150, "age_range": "18-65"}', 'Winner gets a $100 fitness store gift card', 'Track your progress weekly. Most weight lost percentage wins!'),
    ('comp_002', 'Summer Muscle Building Contest', 'Build lean muscle mass for summer body goals', 'muscle_gain', 'admin', '2024-03-01T00:00:00Z', '2024-08-31T23:59:59Z', 'active', 75, '{"experience_level": "beginner_to_advanced"}', 'Protein supplements and gym membership', 'Focus on progressive overload and consistent tracking'),
    ('comp_003', 'Daily Habit Streak Challenge', 'Maintain your daily habits for maximum points', 'custom', 'admin', '2024-01-15T00:00:00Z', '2024-12-31T23:59:59Z', 'active', 200, '{}', 'Achievement badges and recognition', 'Complete daily habits consistently. Longest streaks win!'),
    ('comp_004', 'Fitness Transformation Challenge', 'Complete body transformation in 12 weeks', 'weight_loss', 'admin', '2024-02-01T00:00:00Z', '2024-04-30T23:59:59Z', 'active', 50, '{"commitment_level": "high"}', 'Personal trainer consultation', 'Before/after photos required. Overall improvement wins.');

-- Ensure default user preferences are set correctly
UPDATE user_preferences SET weight_unit = 'lbs' WHERE weight_unit IS NULL OR weight_unit = '';
INSERT OR IGNORE INTO user_preferences (user_id, weight_unit) 
SELECT id, 'lbs' FROM users WHERE id NOT IN (SELECT user_id FROM user_preferences);