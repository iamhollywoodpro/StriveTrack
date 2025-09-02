// Admin Users Management API
// GET: Retrieve all users with stats
// Requires admin authentication (iamhollywoodpro@protonmail.com only)

import { verifyAdminSession } from '../../utils/admin.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        // Verify admin session (hardcoded admin only)
        const sessionId = request.headers.get('x-session-id');
        const adminUser = await verifyAdminSession(sessionId, env);
        
        if (!adminUser) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all users with additional stats including last activity (excluding admin from public view)
        const users = await env.DB.prepare(`
            SELECT 
                u.id, u.email, u.role, u.points, u.created_at,
                COUNT(DISTINCT h.id) as total_habits,
                COUNT(DISTINCT hc.id) as total_completions,
                COUNT(DISTINCT m.id) as total_media,
                COUNT(DISTINCT CASE WHEN m.is_flagged = 1 THEN m.id END) as flagged_media,
                MAX(s.created_at) as last_session,
                COUNT(DISTINCT CASE WHEN s.expires_at > datetime('now') THEN s.id END) as active_sessions
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            LEFT JOIN sessions s ON u.id = s.user_id
            WHERE u.email != 'iamhollywoodpro@protonmail.com'
            GROUP BY u.id, u.email, u.role, u.points, u.created_at
            ORDER BY u.created_at DESC
        `).all();

        // Get platform statistics (excluding admin from counts)
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
            WHERE u.email != 'iamhollywoodpro@protonmail.com'
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