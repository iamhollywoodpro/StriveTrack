// Quick database setup endpoint - for development use
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Create goals table
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
        
        // Create indexes
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)').run();
        await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline)').run();
        
        return new Response(`
            <html>
                <body>
                    <h1>✅ Database Setup Complete</h1>
                    <p>Goals table has been created successfully!</p>
                    <p>You can now go back to StriveTrack and create goals.</p>
                    <a href="/">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
        
    } catch (error) {
        console.error('Database setup error:', error);
        return new Response(`
            <html>
                <body>
                    <h1>❌ Database Setup Failed</h1>
                    <p>Error: ${error.message}</p>
                    <a href="/">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}