-- Nutrition Tracking System Database Schema
-- User nutrition logs and daily summaries with goal tracking

CREATE TABLE IF NOT EXISTS user_nutrition_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL, -- YYYY-MM-DD format
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name TEXT NOT NULL,
    calories REAL DEFAULT 0,
    protein_g REAL DEFAULT 0,
    carbs_g REAL DEFAULT 0,
    fat_g REAL DEFAULT 0,
    sugar_g REAL DEFAULT 0,
    fiber_g REAL DEFAULT 0,
    water_ml REAL DEFAULT 0,
    is_custom_recipe BOOLEAN DEFAULT 0,
    recipe_data TEXT, -- JSON for custom recipes
    serving_size TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Daily nutrition summary table
CREATE TABLE IF NOT EXISTS user_daily_nutrition (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    total_calories REAL DEFAULT 0,
    total_protein_g REAL DEFAULT 0,
    total_carbs_g REAL DEFAULT 0,
    total_fat_g REAL DEFAULT 0,
    total_sugar_g REAL DEFAULT 0,
    total_fiber_g REAL DEFAULT 0,
    total_water_ml REAL DEFAULT 0,
    
    -- Goals and achievements
    calorie_goal REAL DEFAULT 2000,
    protein_goal_g REAL DEFAULT 150,
    carbs_goal_g REAL DEFAULT 200,
    fat_goal_g REAL DEFAULT 65,
    
    -- Goal achievement tracking
    met_calorie_goal BOOLEAN DEFAULT 0,
    met_protein_goal BOOLEAN DEFAULT 0,
    met_carbs_goal BOOLEAN DEFAULT 0,
    met_fat_goal BOOLEAN DEFAULT 0,
    macro_balance_score INTEGER DEFAULT 0, -- 0-100 score
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- User nutrition goals and preferences
CREATE TABLE IF NOT EXISTS user_nutrition_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    daily_calorie_goal REAL DEFAULT 2000,
    daily_protein_goal_g REAL DEFAULT 150,
    daily_carbs_goal_g REAL DEFAULT 200,
    daily_fat_goal_g REAL DEFAULT 65,
    daily_water_goal_ml REAL DEFAULT 2000,
    dietary_restrictions TEXT, -- JSON array
    preferred_meal_times TEXT, -- JSON object with meal times
    macro_split_preference TEXT, -- 'balanced', 'high_protein', 'low_carb', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Extend users table with weekly points tracking
ALTER TABLE users ADD COLUMN weekly_points INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON user_nutrition_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON user_nutrition_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON user_daily_nutrition(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_date ON user_daily_nutrition(log_date);

-- Insert nutrition-related achievements
INSERT OR IGNORE INTO achievements (id, name, description, requirement_type, requirement_value, points, category, icon, rarity) VALUES
('nutrition_first_log', 'Nutrition Tracker', 'Log your first meal', 'nutrition_logs', 1, 25, 'nutrition', '🍎', 'common'),
('nutrition_week_streak', 'Consistent Eater', 'Track nutrition for 7 consecutive days', 'nutrition_streak', 7, 100, 'nutrition', '🔥', 'rare'),
('nutrition_macro_balance', 'Macro Master', 'Achieve perfect macro balance (80+ score)', 'macro_balance', 80, 75, 'nutrition', '⚖️', 'uncommon'),
('nutrition_hydration', 'Hydration Hero', 'Drink 2L+ water for 5 consecutive days', 'hydration_streak', 5, 50, 'nutrition', '💧', 'uncommon'),
('nutrition_protein_goal', 'Protein Pro', 'Meet protein goal for 10 days', 'protein_goal_days', 10, 150, 'nutrition', '💪', 'rare');