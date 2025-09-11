// Initialize goals table - one-time setup endpoint
import { requireAuth } from '../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Only allow admin users to initialize tables
        if (user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                error: 'Admin access required' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create goals table
        await env.DB.exec(`
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
            );
            
            CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
            CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
            CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
        `);
        
        return new Response(JSON.stringify({
            message: 'Goals table initialized successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Initialize goals table error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to initialize goals table: ' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}