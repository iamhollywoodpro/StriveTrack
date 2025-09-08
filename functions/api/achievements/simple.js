// Simple Achievements API endpoint for debugging
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Get all achievements (simple query)
        const achievementsResult = await env.DB.prepare(`
            SELECT * FROM achievements ORDER BY points ASC LIMIT 10
        `).all();
        
        const achievements = achievementsResult.results || [];
        
        return new Response(JSON.stringify({
            achievements: achievements,
            count: achievements.length,
            user_id: user.id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Simple achievements error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}