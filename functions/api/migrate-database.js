// Database migration endpoint - fixes schema issues
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const results = [];
        
        // Check if users table exists
        const tablesCheck = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").first();
        
        if (!tablesCheck) {
            // Create users table if it doesn't exist
            await env.DB.prepare(`
                CREATE TABLE users (
                    id TEXT PRIMARY KEY,
                    username TEXT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    points INTEGER DEFAULT 0,
                    profile_picture_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `).run();
            results.push('✅ Created users table');
        } else {
            // Check if username column exists
            const columns = await env.DB.prepare("PRAGMA table_info(users)").all();
            const hasUsername = columns.results.some(col => col.name === 'username');
            const hasProfilePicture = columns.results.some(col => col.name === 'profile_picture_url');
            
            if (!hasUsername) {
                await env.DB.prepare('ALTER TABLE users ADD COLUMN username TEXT').run();
                results.push('✅ Added username column to users table');
            }
            
            if (!hasProfilePicture) {
                await env.DB.prepare('ALTER TABLE users ADD COLUMN profile_picture_url TEXT').run();
                results.push('✅ Added profile_picture_url column to users table');
            }
        }
        
        // Create other necessary tables
        
        // Sessions table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `).run();
        results.push('✅ Ensured sessions table exists');
        
        // Media uploads table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS media_uploads (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                r2_key TEXT NOT NULL,
                description TEXT,
                media_type TEXT DEFAULT 'progress',
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `).run();
        results.push('✅ Ensured media_uploads table exists');
        
        // Habits table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS habits (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT DEFAULT '#667eea',
                target_frequency INTEGER DEFAULT 1,
                weekly_target INTEGER DEFAULT 7,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `).run();
        results.push('✅ Ensured habits table exists');
        
        // Habit completions table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS habit_completions (
                id TEXT PRIMARY KEY,
                habit_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                notes TEXT,
                completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `).run();
        results.push('✅ Ensured habit_completions table exists');
        
        // Goals table
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS goals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'fitness',
                target_value REAL NOT NULL,
                current_value REAL DEFAULT 0,
                unit TEXT DEFAULT '',
                status TEXT DEFAULT 'active',
                progress_percentage INTEGER DEFAULT 0,
                deadline DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `).run();
        results.push('✅ Ensured goals table exists');
        
        // Create indexes for performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_media_user_id ON media_uploads(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id)',
            'CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)'
        ];
        
        for (const indexSql of indexes) {
            await env.DB.prepare(indexSql).run();
        }
        results.push('✅ Created database indexes');
        
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
                    <h1>🎉 Database Migration Completed!</h1>
                    
                    <h2>Migration Results:</h2>
                    <ul>
                        ${results.map(result => `<li>${result}</li>`).join('')}
                    </ul>
                    
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>✅ Database is now ready!</h3>
                        <p>All necessary tables and columns have been created/updated.</p>
                        <p>You can now proceed with admin user initialization.</p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <a href="/api/init-admin" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Initialize Admin User</a>
                        <a href="/api/debug-users" style="background: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Debug Users</a>
                        <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">← Back to StriveTrack</a>
                    </div>
                </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
        
    } catch (error) {
        console.error('Database migration error:', error);
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>❌ Database Migration Failed</h1>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <pre>${error.stack}</pre>
                    <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}