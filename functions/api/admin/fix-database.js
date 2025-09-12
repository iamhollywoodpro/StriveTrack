// Emergency database schema fix endpoint
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Security check - only allow admin access
        const sessionId = request.headers.get('x-session-id');
        if (!sessionId) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        // Get user from session
        const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP')
            .bind(sessionId).first();
        
        if (!session) {
            return new Response('Invalid session', { status: 401 });
        }
        
        const user = await env.DB.prepare('SELECT role FROM users WHERE id = ?')
            .bind(session.user_id).first();
        
        if (!user || user.role !== 'admin') {
            return new Response('Admin access required', { status: 403 });
        }
        
        console.log('🔧 Starting database schema fixes...');
        
        // Execute schema fixes one by one with proper error handling
        const fixes = [
            // Add missing columns (these will fail silently if columns exist)
            "ALTER TABLE habits ADD COLUMN weekly_target INTEGER DEFAULT 5",
            "ALTER TABLE habits ADD COLUMN category TEXT DEFAULT 'general'", 
            "ALTER TABLE habits ADD COLUMN difficulty TEXT DEFAULT 'medium'",
            "ALTER TABLE users ADD COLUMN weekly_points INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN admin_notes TEXT",
            "ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active'",
            "ALTER TABLE users ADD COLUMN last_login DATETIME",
            
            // Update existing records with defaults
            "UPDATE habits SET weekly_target = 5 WHERE weekly_target IS NULL",
            "UPDATE habits SET category = 'general' WHERE category IS NULL OR category = ''",
            "UPDATE habits SET difficulty = 'medium' WHERE difficulty IS NULL OR difficulty = ''",
            "UPDATE users SET points = 0 WHERE points IS NULL",
            "UPDATE users SET weekly_points = 0 WHERE weekly_points IS NULL",
            "UPDATE users SET account_status = 'active' WHERE account_status IS NULL OR account_status = ''",
            
            // Create indexes (will fail silently if they exist)
            "CREATE INDEX IF NOT EXISTS idx_weekly_completions_user_week ON weekly_habit_completions(user_id, week_start_date)",
            "CREATE INDEX IF NOT EXISTS idx_weekly_completions_habit_date ON weekly_habit_completions(habit_id, completion_date)", 
            "CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)"
        ];
        
        const results = [];
        
        for (const sql of fixes) {
            try {
                await env.DB.prepare(sql).run();
                results.push({ sql, status: 'success' });
                console.log(`✅ ${sql}`);
            } catch (error) {
                // Log but don't fail - many of these are expected to fail if columns exist
                results.push({ sql, status: 'skipped', error: error.message });
                console.log(`⏭️ ${sql} - ${error.message}`);
            }
        }
        
        console.log('🔧 Database schema fixes completed');
        
        return new Response(JSON.stringify({
            message: 'Database schema fixes applied',
            results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Database fix error:', error);
        return new Response(JSON.stringify({
            error: 'Database fix failed',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}