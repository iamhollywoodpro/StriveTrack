-- Add Goals table to StriveTrack database
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'fitness', -- 'fitness', 'weight', 'strength', 'endurance', 'habit'
    target_value REAL NOT NULL,
    current_value REAL DEFAULT 0,
    unit TEXT DEFAULT '', -- 'kg', 'lbs', 'minutes', 'days', 'reps', etc.
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
    progress_percentage INTEGER DEFAULT 0,
    deadline DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);