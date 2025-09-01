// Login endpoint for StriveTrack
import { getUserByEmail, validatePassword } from '../../utils/database.js';
import { createSession, cleanupExpiredSessions } from '../../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { email, password } = body;
        
        if (!email || !password) {
            return new Response(JSON.stringify({ 
                error: 'Email and password are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Clean up expired sessions
        await cleanupExpiredSessions(env);
        
        // Get user by email
        const user = await getUserByEmail(email, env);
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'Invalid email or password' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Validate password
        const isValidPassword = await validatePassword(password, user.password_hash);
        if (!isValidPassword) {
            return new Response(JSON.stringify({ 
                error: 'Invalid email or password' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create session
        const sessionId = await createSession(user.id, env);
        
        // Return success response with session and user data
        return new Response(JSON.stringify({
            sessionId,
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
        console.error('Login error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}