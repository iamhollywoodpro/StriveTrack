// Registration endpoint for StriveTrack
import { getUserByEmail, getUserByUsername, createUser } from '../../utils/database.js';
import { createSession } from '../../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { username, email, password, confirmPassword } = body;
        
        if (!email || !password) {
            return new Response(JSON.stringify({ 
                error: 'Email and password are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (username && username.trim().length < 3) {
            return new Response(JSON.stringify({ 
                error: 'Username must be at least 3 characters long' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return new Response(JSON.stringify({ 
                error: 'Passwords do not match' 
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
        
        // Check if email already exists
        const existingUser = await getUserByEmail(email, env);
        if (existingUser) {
            return new Response(JSON.stringify({ 
                error: 'Email already registered' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if username already exists (if provided)
        if (username && username.trim()) {
            const existingUsername = await getUserByUsername(username.trim(), env);
            if (existingUsername) {
                return new Response(JSON.stringify({ 
                    error: 'Username already taken' 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // Create new user
        const userData = { email, password };
        if (username && username.trim()) {
            userData.username = username.trim();
        }
        const user = await createUser(userData, env);
        
        // Create session for automatic login
        const sessionId = await createSession(user.id, env);
        
        // Return success response
        return new Response(JSON.stringify({
            message: 'User registered successfully',
            sessionId,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile_picture_url: user.profile_picture_url,
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