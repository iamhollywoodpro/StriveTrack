// Logout endpoint for StriveTrack
import { deleteSession } from '../../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const sessionId = request.headers.get('x-session-id');
        
        if (sessionId) {
            await deleteSession(sessionId, env);
        }
        
        return new Response(JSON.stringify({
            message: 'Logged out successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}