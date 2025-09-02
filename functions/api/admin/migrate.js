// Database migration endpoint (Admin only)
import { verifyAdminSession } from '../../utils/admin.js';
import { runAllMigrations } from '../../utils/database-migration.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Verify admin access
        const sessionId = request.headers.get('x-session-id');
        const adminUser = await verifyAdminSession(sessionId, env);
        
        if (!adminUser) {
            return new Response(JSON.stringify({ 
                error: 'Admin access required' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Run migrations
        const results = await runAllMigrations(env);
        
        return new Response(JSON.stringify({
            message: 'Database migrations completed',
            results: results,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Migration error:', error);
        return new Response(JSON.stringify({ 
            error: 'Migration failed',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}