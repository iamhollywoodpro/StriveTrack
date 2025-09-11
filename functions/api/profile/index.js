// Profile management API for StriveTrack
import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'Authentication required' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get full user profile with statistics
        const fullUser = await env.DB.prepare(`
            SELECT 
                u.*,
                COUNT(DISTINCT h.id) as habits_count,
                COUNT(DISTINCT ua.id) as achievements_count,
                COUNT(DISTINCT hc.id) as total_completions,
                COALESCE(JULIANDAY('now') - JULIANDAY(MIN(h.created_at)), 0) as days_active
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
            WHERE u.id = ?
            GROUP BY u.id
        `).bind(user.id).first();

        if (!fullUser) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Remove sensitive data
        const { password_hash, ...safeUser } = fullUser;

        return new Response(JSON.stringify({
            user: safeUser,
            stats: {
                total_points: fullUser.points || 0,
                habits_count: fullUser.habits_count || 0,
                achievements_count: fullUser.achievements_count || 0,
                days_active: Math.floor(fullUser.days_active || 0)
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch profile' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'Authentication required' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { username, email } = body;

        // Validation
        if (username && username.trim().length < 3) {
            return new Response(JSON.stringify({ 
                error: 'Username must be at least 3 characters long' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid email format' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check for duplicates (excluding current user)
        if (username && username.trim()) {
            const existingUsername = await env.DB.prepare(
                'SELECT id FROM users WHERE username = ? AND id != ?'
            ).bind(username.trim(), user.id).first();
            
            if (existingUsername) {
                return new Response(JSON.stringify({ 
                    error: 'Username already taken' 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        if (email && email.trim()) {
            const existingEmail = await env.DB.prepare(
                'SELECT id FROM users WHERE email = ? AND id != ?'
            ).bind(email.trim(), user.id).first();
            
            if (existingEmail) {
                return new Response(JSON.stringify({ 
                    error: 'Email already registered' 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Update user profile
        const updateFields = [];
        const updateValues = [];

        if (username && username.trim()) {
            updateFields.push('username = ?');
            updateValues.push(username.trim());
        }

        if (email && email.trim()) {
            updateFields.push('email = ?');
            updateValues.push(email.trim());
        }

        if (updateFields.length > 0) {
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateValues.push(user.id);

            await env.DB.prepare(`
                UPDATE users SET ${updateFields.join(', ')}
                WHERE id = ?
            `).bind(...updateValues).run();
        }

        return new Response(JSON.stringify({
            message: 'Profile updated successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update profile' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}