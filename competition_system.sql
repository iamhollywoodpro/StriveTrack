-- Competition/Challenge System Database Schema
-- This extends the StriveTrack fitness app with competitive features

-- Main competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    competition_type TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'workout_frequency', 'custom'
    creator_id TEXT NOT NULL,
    start_date TEXT NOT NULL, -- ISO format
    end_date TEXT NOT NULL, -- ISO format
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    max_participants INTEGER DEFAULT 50,
    entry_requirements TEXT, -- JSON string with requirements
    prize_description TEXT,
    rules TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Competition participants
CREATE TABLE IF NOT EXISTS competition_participants (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'active', -- 'active', 'withdrawn', 'disqualified'
    starting_weight_kg REAL,
    starting_measurements TEXT, -- JSON string
    final_score REAL DEFAULT 0,
    ranking INTEGER,
    notes TEXT,
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(competition_id, user_id)
);

-- Competition progress logs
CREATE TABLE IF NOT EXISTS competition_progress (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    progress_date TEXT NOT NULL,
    progress_value REAL NOT NULL,
    progress_type TEXT NOT NULL, -- 'weight', 'measurement', 'workout_count', 'custom'
    notes TEXT,
    media_url TEXT, -- Optional progress photo
    verified BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (participant_id) REFERENCES competition_participants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Competition leaderboard (computed view)
CREATE VIEW IF NOT EXISTS competition_leaderboard AS
SELECT 
    cp.competition_id,
    cp.user_id,
    u.name as user_name,
    u.profile_image_url,
    cp.final_score,
    cp.ranking,
    cp.status,
    c.title as competition_title,
    c.competition_type,
    c.end_date,
    COUNT(cprog.id) as progress_entries
FROM competition_participants cp
JOIN users u ON cp.user_id = u.id
JOIN competitions c ON cp.competition_id = c.id
LEFT JOIN competition_progress cprog ON cp.id = cprog.participant_id
WHERE cp.status = 'active'
GROUP BY cp.id
ORDER BY cp.ranking ASC, cp.final_score DESC;

-- Competition achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, category) VALUES
('comp_first_join', 'First Competition', 'Joined your first competition', '🏆', 'competition'),
('comp_winner', 'Competition Winner', 'Won a competition', '🥇', 'competition'),
('comp_podium', 'Podium Finish', 'Finished in top 3 of a competition', '🥉', 'competition'),
('comp_creator', 'Competition Creator', 'Created your first competition', '👑', 'competition'),
('comp_consistent', 'Consistent Competitor', 'Participated in 5 competitions', '⭐', 'competition'),
('comp_streak', 'Competition Streak', 'Participated in 3 consecutive competitions', '🔥', 'competition');

-- Update users table to track competition stats
ALTER TABLE users ADD COLUMN competitions_joined INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN competitions_won INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN competitions_created INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competitions_creator ON competitions(creator_id);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competition_participants_comp ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_progress_comp ON competition_progress(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_progress_user ON competition_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_progress_date ON competition_progress(progress_date);