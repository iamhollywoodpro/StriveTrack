// Registration endpoint for StriveTrack
import { getUserByEmail, createUser } from '../../utils/database.js';
import { createSession } from '../../utils/auth.js';

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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid email format' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Validate password length
        if (password.length < 6) {
            return new Response(JSON.stringify({ 
                error: 'Password must be at least 6 characters' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if user already exists
        const existingUser = await getUserByEmail(email, env);
        if (existingUser) {
            return new Response(JSON.stringify({ 
                error: 'Email already registered' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create new user
        const user = await createUser({ email, password }, env);
        
        // Create session for automatic login
        const sessionId = await createSession(user.id, env);
        
        // Return success response
        return new Response(JSON.stringify({
            message: 'User registered successfully',
            sessionId,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                points: user.points
            }
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}