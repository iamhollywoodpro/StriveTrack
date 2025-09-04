-- Goal Setting System Database Schema
-- Comprehensive goal management with progress tracking and achievements

CREATE TABLE IF NOT EXISTS user_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL, -- 'weight', 'habit', 'fitness', 'nutrition', 'custom'
    category TEXT NOT NULL, -- 'health', 'strength', 'endurance', 'flexibility', 'nutrition', 'weight_loss', 'weight_gain', 'maintenance'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
    
    -- Target and Progress
    target_value REAL,
    target_unit TEXT, -- 'kg', 'lbs', 'days', 'count', 'minutes', 'hours', 'percent'
    current_value REAL DEFAULT 0,
    progress_percentage REAL DEFAULT 0,
    
    -- Timeline
    start_date DATE NOT NULL,
    target_date DATE,
    completed_date DATE,
    
    -- Motivation and Tracking
    motivation_reason TEXT,
    reward_description TEXT,
    milestone_rewards TEXT, -- JSON array of milestone rewards
    
    -- Meta
    is_public BOOLEAN DEFAULT 0,
    share_progress BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Goal progress tracking table
CREATE TABLE IF NOT EXISTS goal_progress_logs (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    progress_value REAL NOT NULL,
    progress_percentage REAL NOT NULL,
    notes TEXT,
    logged_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (goal_id) REFERENCES user_goals (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Goal milestones table
CREATE TABLE IF NOT EXISTS goal_milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_percentage REAL NOT NULL, -- 25, 50, 75, 100
    is_completed BOOLEAN DEFAULT 0,
    completed_date DATE,
    reward_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (goal_id) REFERENCES user_goals (id)
);

-- Goal categories lookup
CREATE TABLE IF NOT EXISTS goal_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    color_code TEXT, -- Hex color for UI
    is_active BOOLEAN DEFAULT 1
);

-- Insert default goal categories
INSERT OR REPLACE INTO goal_categories VALUES
('health', 'Health & Wellness', '🏥', 'Overall health and wellness goals', '#10b981', 1),
('strength', 'Strength Training', '💪', 'Muscle building and strength goals', '#ef4444', 1),
('endurance', 'Cardio & Endurance', '🏃', 'Cardiovascular fitness and endurance', '#3b82f6', 1),
('flexibility', 'Flexibility & Mobility', '🤸', 'Stretching, yoga, and mobility goals', '#8b5cf6', 1),
('nutrition', 'Nutrition & Diet', '🥗', 'Dietary and nutrition-related goals', '#f59e0b', 1),
('weight_loss', 'Weight Loss', '⬇️', 'Weight reduction and fat loss goals', '#06b6d4', 1),
('weight_gain', 'Weight Gain', '⬆️', 'Weight and muscle gain goals', '#84cc16', 1),
('habits', 'Daily Habits', '📅', 'Building consistent daily habits', '#f97316', 1),
('mental', 'Mental Health', '🧠', 'Mindfulness, stress, and mental wellness', '#ec4899', 1),
('performance', 'Performance', '🎯', 'Athletic and performance goals', '#6366f1', 1);

-- Insert goal-related achievements
INSERT OR IGNORE INTO achievements (id, name, description, requirement_type, requirement_value, points, category, icon, rarity) VALUES
('goal_creator', 'Goal Setter', 'Create your first goal', 'goals_created', 1, 25, 'goals', '🎯', 'common'),
('goal_achiever', 'Goal Crusher', 'Complete your first goal', 'goals_completed', 1, 100, 'goals', '🏆', 'rare'),
('goal_streak', 'Consistent Achiever', 'Complete 5 goals', 'goals_completed', 5, 250, 'goals', '🔥', 'epic'),
('milestone_master', 'Milestone Master', 'Reach 10 goal milestones', 'milestones_reached', 10, 150, 'goals', '🎖️', 'rare'),
('ambitious_planner', 'Ambitious Planner', 'Have 5 active goals simultaneously', 'active_goals', 5, 75, 'goals', '📋', 'uncommon'),
('deadline_crusher', 'Deadline Crusher', 'Complete a goal before its deadline', 'early_completion', 1, 50, 'goals', '⚡', 'uncommon'),
('long_term_thinker', 'Long-term Thinker', 'Set a goal with 6+ month timeline', 'long_term_goal', 1, 40, 'goals', '🔭', 'common');