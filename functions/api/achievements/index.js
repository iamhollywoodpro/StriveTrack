// Achievements endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';
import { getUserAchievements } from '../../utils/database.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const achievements = await getUserAchievements(user.id, env);
        
        return new Response(JSON.stringify({ achievements }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get achievements error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}