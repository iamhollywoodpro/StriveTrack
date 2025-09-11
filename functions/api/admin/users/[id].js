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

// DELETE - Delete specific user (admin only)
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

        // Delete user and all related data in proper order (with error handling for missing tables)
        const cleanupQueries = [
            "DELETE FROM challenge_participants WHERE user_id = ?",
            "DELETE FROM challenge_invitations WHERE inviter_id = ? OR invitee_id = ?",
            "DELETE FROM habit_completions WHERE user_id = ?",
            "DELETE FROM weekly_habit_completions WHERE user_id = ?",
            "DELETE FROM habits WHERE user_id = ?",
            "DELETE FROM goals WHERE user_id = ?",
            "DELETE FROM media_uploads WHERE user_id = ?",
            "DELETE FROM user_achievements WHERE user_id = ?",
            "DELETE FROM user_friends WHERE user_id = ? OR friend_user_id = ?",
            "DELETE FROM sessions WHERE user_id = ?"
        ];

        // Execute cleanup queries with error handling
        for (const query of cleanupQueries) {
            try {
                if (query.includes("inviter_id") || query.includes("friend_user_id")) {
                    await env.DB.prepare(query).bind(userId, userId).run();
                } else {
                    await env.DB.prepare(query).bind(userId).run();
                }
            } catch (cleanupError) {
                // Log but don't fail if table doesn't exist
                console.log(`Cleanup query failed (table may not exist): ${query}`, cleanupError);
            }
        }

        // Delete the user itself (this must succeed)
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