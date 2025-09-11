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

// POST - Toggle user suspension status (admin only)
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
            return new Response(JSON.stringify({ error: 'Cannot suspend admin users' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Toggle suspension status (handle missing column gracefully)
        let currentStatus = false; // Default to not suspended
        try {
            const statusCheck = await env.DB.prepare(
                "SELECT is_suspended FROM users WHERE id = ?"
            ).bind(userId).first();
            currentStatus = statusCheck?.is_suspended || false;
        } catch (error) {
            // Column might not exist, use default
            console.log('is_suspended column not found, using default');
        }
        
        const newSuspendedStatus = !currentStatus;
        
        try {
            await env.DB.prepare(
                "UPDATE users SET is_suspended = ?, updated_at = datetime('now') WHERE id = ?"
            ).bind(newSuspendedStatus, userId).run();
        } catch (error) {
            // If column doesn't exist, show appropriate message
            return new Response(JSON.stringify({ 
                error: 'Suspension feature requires database migration. Please add is_suspended column to users table.',
                feature_disabled: true
            }), {
                status: 501,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: `User ${newSuspendedStatus ? 'suspended' : 'unsuspended'} successfully`,
            suspended: newSuspendedStatus
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin toggle user status error:', error);
        return new Response(JSON.stringify({ error: 'Failed to toggle user status' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}