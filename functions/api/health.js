// Health check endpoint with D1 database connectivity test
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Test database connectivity
        const dbTest = await env.DB.prepare('SELECT 1 as test').first();
        
        // Check if tables exist
        const userTableExists = await env.DB.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='users'
        `).first();
        
        const sessionTableExists = await env.DB.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='sessions'
        `).first();
        
        const mediaTableExists = await env.DB.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='media_uploads'
        `).first();
        
        // Get user count
        const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        
        // Get session count
        const sessionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions').first();
        
        // Get media count
        const mediaCount = await env.DB.prepare('SELECT COUNT(*) as count FROM media_uploads').first();
        
        return new Response(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: !!dbTest,
                tables: {
                    users: !!userTableExists,
                    sessions: !!sessionTableExists,
                    media_uploads: !!mediaTableExists
                },
                counts: {
                    users: userCount?.count || 0,
                    sessions: sessionCount?.count || 0,
                    media: mediaCount?.count || 0
                }
            },
            r2_storage: {
                configured: !!env.MEDIA_BUCKET,
                bucket_name: 'strivetrack-media'
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Health check error:', error);
        return new Response(JSON.stringify({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message,
            database: {
                connected: false
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}