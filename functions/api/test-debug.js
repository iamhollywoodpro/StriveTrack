// Debug endpoint to test various queries
import { requireAuth } from '../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Test the user stats query that's causing issues
        const userStatsResult = await env.DB.prepare(`
            SELECT 
                u.points as total_points,
                u.created_at as user_created_at,
                (SELECT COUNT(*) FROM habits WHERE user_id = ?) as habits_created,
                (SELECT COUNT(*) FROM habit_completions WHERE user_id = ?) as total_completions,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ?) as total_media
            FROM users u
            WHERE u.id = ?
        `).bind(user.id, user.id, user.id, user.id).first();
        
        return new Response(JSON.stringify({
            user_id: user.id,
            user_stats: userStatsResult,
            message: "Debug query successful"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}