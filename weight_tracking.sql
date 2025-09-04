-- Weight Tracking System Database Schema
-- User weight logs with BMI calculation and goal tracking

CREATE TABLE IF NOT EXISTS user_weight_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    weight_lbs REAL NOT NULL,
    bmi REAL,
    body_fat_percentage REAL,
    muscle_mass_kg REAL,
    notes TEXT,
    logged_date DATE NOT NULL, -- YYYY-MM-DD format
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Weight goals table
CREATE TABLE IF NOT EXISTS user_weight_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    goal_type TEXT NOT NULL, -- 'lose', 'gain', 'maintain'
    current_weight_kg REAL NOT NULL,
    target_weight_kg REAL NOT NULL,
    target_date DATE,
    weekly_goal_kg REAL, -- kg per week
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- User body measurements table (for future biometric tracking)
CREATE TABLE IF NOT EXISTS user_body_measurements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    height_cm REAL,
    chest_cm REAL,
    waist_cm REAL,
    hips_cm REAL,
    bicep_cm REAL,
    thigh_cm REAL,
    neck_cm REAL,
    measurement_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Add height column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN height_cm REAL;
ALTER TABLE users ADD COLUMN current_weight_kg REAL;
ALTER TABLE users ADD COLUMN weight_unit TEXT DEFAULT 'kg'; -- 'kg' or 'lbs'

-- Insert some sample weight-related achievements
INSERT OR IGNORE INTO achievements (id, name, description, requirement_type, requirement_value, points, category, icon, rarity) VALUES
('weight_first_log', 'Weight Warrior', 'Log your first weight entry', 'weight_logs', 1, 25, 'health', '⚖️', 'common'),
('weight_weekly_logger', 'Consistent Tracker', 'Log weight for 7 consecutive weeks', 'weight_consistency', 7, 100, 'health', '📊', 'rare'),
('weight_goal_achiever', 'Goal Crusher', 'Reach your weight goal', 'weight_goal_achieved', 1, 200, 'health', '🎯', 'epic'),
('weight_maintenance', 'Steady State', 'Maintain weight within 2kg for 30 days', 'weight_maintenance', 30, 150, 'health', '⚖️', 'rare'),
('bmi_healthy', 'Healthy Range', 'Achieve healthy BMI range (18.5-24.9)', 'bmi_healthy', 1, 75, 'health', '💚', 'uncommon');