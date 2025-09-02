// Admin Users Management API
// GET: Retrieve all users with stats
// Requires admin authentication

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        // Check session and admin authorization
        const sessionId = request.headers.get('x-session-id');
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'Session required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify session and get user
        const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(sessionId).first();
        if (!session) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user and verify admin role
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all users with additional stats
        const users = await env.DB.prepare(`
            SELECT 
                u.id, u.email, u.role, u.points, u.created_at,
                COUNT(DISTINCT h.id) as total_habits,
                COUNT(DISTINCT hc.id) as total_completions,
                COUNT(DISTINCT m.id) as total_media,
                COUNT(DISTINCT CASE WHEN m.is_flagged = 1 THEN m.id END) as flagged_media
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            GROUP BY u.id, u.email, u.role, u.points, u.created_at
            ORDER BY u.created_at DESC
        `).all();

        // Get platform statistics
        const stats = await env.DB.prepare(`
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(DISTINCT m.id) as total_media,
                COUNT(DISTINCT h.id) as total_habits,
                COUNT(DISTINCT CASE WHEN m.is_flagged = 1 THEN m.id END) as flagged_media,
                SUM(u.points) as total_points,
                COUNT(DISTINCT hc.id) as total_completions
            FROM users u
            LEFT JOIN media_uploads m ON u.id = m.user_id
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
        `).first();

        return new Response(JSON.stringify({
            users: users.results || [],
            stats: stats || {}
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin users fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}