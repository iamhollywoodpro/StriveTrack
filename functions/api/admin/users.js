// Helper function to get user from session
async function getUserFromSession(sessionId, env) {
    if (!sessionId) return null;
    
    const session = await env.DB.prepare(`
        SELECT s.*, u.id as user_id, u.email, u.role, u.points
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
    `).bind(sessionId).first();
    
    if (!session) return null;
    
    return {
        id: session.user_id,
        email: session.email,
        role: session.role,
        points: session.points
    };
}

// Check if user is admin (iamhollywoodpro@protonmail.com only)
function isAdmin(user, env) {
    return user && user.role === 'admin' && user.email === 'iamhollywoodpro@protonmail.com';
}

// GET - List all users (admin only)
export async function onRequestGet(context) {
    const { request, env } = context;
    const sessionId = request.headers.get('x-session-id');
    
    try {
        const user = await getUserFromSession(sessionId, env);
        
        if (!isAdmin(user, env)) {
            return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Enhanced query with counts and profile info (using existing schema)
        const users = await env.DB.prepare(`
            SELECT 
                u.id, 
                u.username,
                u.email, 
                u.profile_picture_url,
                u.role, 
                u.points, 
                u.created_at,
                u.updated_at,
                CASE 
                    WHEN COUNT(s.id) > 0 
                    THEN 'online' 
                    ELSE 'offline' 
                END as status,
                COUNT(DISTINCT h.id) as habits_count,
                COUNT(DISTINCT m.id) as media_count,
                COUNT(DISTINCT ua.id) as achievements_count
            FROM users u
            LEFT JOIN sessions s ON u.id = s.user_id AND s.expires_at > datetime('now')
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            GROUP BY u.id, u.username, u.email, u.profile_picture_url, u.role, u.points, u.created_at, u.updated_at
            ORDER BY u.created_at DESC
        `).all();

        return new Response(JSON.stringify({ users: users.results }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin get users error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE - Delete user (admin only, cannot delete admin)
export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const sessionId = request.headers.get('x-session-id');
    const userId = params.id;
    
    try {
        const user = await getUserFromSession(sessionId, env);
        
        if (!isAdmin(user, env)) {
            return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if target user exists and is not admin
        const targetUser = await env.DB.prepare(
            "SELECT id, email, role FROM users WHERE id = ?"
        ).bind(userId).first();

        if (!targetUser) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (targetUser.role === 'admin') {
            return new Response(JSON.stringify({ error: 'Cannot delete admin users' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete user and related data
        await env.DB.prepare("DELETE FROM habit_completions WHERE user_id = ?").bind(userId).run();
        await env.DB.prepare("DELETE FROM habits WHERE user_id = ?").bind(userId).run();
        await env.DB.prepare("DELETE FROM media_uploads WHERE user_id = ?").bind(userId).run();
        await env.DB.prepare("DELETE FROM user_achievements WHERE user_id = ?").bind(userId).run();
        await env.DB.prepare("DELETE FROM user_friends WHERE user_id = ? OR friend_user_id = ?").bind(userId, userId).run();
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin delete user error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}