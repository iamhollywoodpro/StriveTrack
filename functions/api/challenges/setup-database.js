export async function onRequest(context) {
    const { env } = context;
    
    try {
        // Create social_challenges table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS social_challenges (
                id TEXT PRIMARY KEY,
                creator_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL, -- 'individual', 'group', 'versus'
                category TEXT NOT NULL, -- 'fitness', 'nutrition', 'habits', 'steps'
                target_value INTEGER,
                target_unit TEXT, -- 'days', 'reps', 'minutes', 'steps', 'calories'
                duration_days INTEGER DEFAULT 7,
                max_participants INTEGER DEFAULT 10,
                reward_points INTEGER DEFAULT 100,
                start_date TEXT,
                end_date TEXT,
                status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
                privacy TEXT DEFAULT 'friends', -- 'public', 'friends', 'private'
                rules TEXT, -- JSON string with challenge rules
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users(id)
            )
        `).run();

        // Create challenge_participants table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS challenge_participants (
                id TEXT PRIMARY KEY,
                challenge_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                status TEXT DEFAULT 'invited', -- 'invited', 'accepted', 'declined', 'completed'
                progress_value INTEGER DEFAULT 0,
                progress_percentage REAL DEFAULT 0,
                joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,
                FOREIGN KEY (challenge_id) REFERENCES social_challenges(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(challenge_id, user_id)
            )
        `).run();

        // Create challenge_progress table for tracking daily/activity updates
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS challenge_progress (
                id TEXT PRIMARY KEY,
                challenge_id TEXT NOT NULL,
                participant_id TEXT NOT NULL,
                progress_date TEXT NOT NULL,
                progress_value INTEGER NOT NULL,
                progress_notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (challenge_id) REFERENCES social_challenges(id) ON DELETE CASCADE,
                FOREIGN KEY (participant_id) REFERENCES challenge_participants(id) ON DELETE CASCADE,
                UNIQUE(challenge_id, participant_id, progress_date)
            )
        `).run();

        // Create challenge_invitations table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS challenge_invitations (
                id TEXT PRIMARY KEY,
                challenge_id TEXT NOT NULL,
                inviter_id TEXT NOT NULL,
                invitee_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
                invitation_message TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                responded_at TEXT,
                FOREIGN KEY (challenge_id) REFERENCES social_challenges(id) ON DELETE CASCADE,
                FOREIGN KEY (inviter_id) REFERENCES users(id),
                FOREIGN KEY (invitee_id) REFERENCES users(id),
                UNIQUE(challenge_id, invitee_id)
            )
        `).run();

        return new Response(JSON.stringify({ 
            message: 'Social challenges database tables created successfully',
            tables: [
                'social_challenges',
                'challenge_participants', 
                'challenge_progress',
                'challenge_invitations'
            ]
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Database setup error:', error);
        return new Response(JSON.stringify({ error: 'Database setup failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}