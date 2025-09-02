// Registration endpoint for StriveTrack
import { getUserByEmail, createUser } from '../../utils/database.js';
import { createSession } from '../../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { name, email, password, phone, user_type } = body;
        
        // Required fields validation
        if (!name || !email || !password || !user_type) {
            return new Response(JSON.stringify({ 
                error: 'Name, email, password, and user type are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate name length
        if (name.trim().length < 2) {
            return new Response(JSON.stringify({ 
                error: 'Name must be at least 2 characters long' 
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
                error: 'Password must be at least 6 characters long' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate user type
        const validUserTypes = ['beginner', 'intermediate', 'advanced', 'competition', 'coach'];
        if (!validUserTypes.includes(user_type)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid user type. Must be: beginner, intermediate, advanced, competition, or coach' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate phone number if provided
        if (phone && phone.trim().length > 0) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
                return new Response(JSON.stringify({ 
                    error: 'Invalid phone number format' 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
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
        
        // Create new user with enhanced data
        const user = await createUser({ 
            name: name.trim(), 
            email: email.toLowerCase().trim(), 
            password, 
            phone: phone ? phone.trim() : null,
            user_type 
        }, env);
        
        // Create session for automatic login
        const sessionId = await createSession(user.id, env);
        
        // Return success response
        return new Response(JSON.stringify({
            message: 'User registered successfully',
            sessionId,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                user_type: user.user_type,
                points: user.points,
                onboarding_completed: user.onboarding_completed
            }
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({ 
            error: error.message.includes('Invalid user type') ? error.message : 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}