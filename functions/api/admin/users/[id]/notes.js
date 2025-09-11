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

// POST - Save admin notes for a user (admin only)
export async function onRequestPost(context) {
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

        const { notes } = await request.json();

        // Check if target user exists
        const targetUser = await env.DB.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).bind(userId).first();

        if (!targetUser) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update admin notes (handle missing column gracefully)
        try {
            await env.DB.prepare(
                "UPDATE users SET admin_notes = ?, updated_at = datetime('now') WHERE id = ?"
            ).bind(notes || null, userId).run();
        } catch (error) {
            // If column doesn't exist, show appropriate message
            return new Response(JSON.stringify({ 
                error: 'Admin notes feature requires database migration. Please add admin_notes column to users table.',
                feature_disabled: true
            }), {
                status: 501,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: 'Admin notes saved successfully',
            notes: notes || null
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin save notes error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save admin notes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}