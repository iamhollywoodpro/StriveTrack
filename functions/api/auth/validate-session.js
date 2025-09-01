// Session validation endpoint for StriveTrack
import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'Invalid session' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                points: user.points
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Session validation error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}