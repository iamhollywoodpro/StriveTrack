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

// DELETE - Delete media file (admin only)
export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const sessionId = request.headers.get('x-session-id');
    const mediaId = params.id;
    
    try {
        const user = await getUserFromSession(sessionId, env);
        
        if (!isAdmin(user, env)) {
            return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if media exists
        const media = await env.DB.prepare(
            "SELECT * FROM media_uploads WHERE id = ?"
        ).bind(mediaId).first();

        if (!media) {
            return new Response(JSON.stringify({ error: 'Media not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete from R2 storage if exists
        try {
            if (env.MEDIA_BUCKET && media.file_key) {
                await env.MEDIA_BUCKET.delete(media.file_key);
            }
        } catch (r2Error) {
            console.error('R2 deletion error:', r2Error);
            // Continue with database deletion even if R2 fails
        }

        // Delete from database
        await env.DB.prepare("DELETE FROM media_uploads WHERE id = ?").bind(mediaId).run();

        return new Response(JSON.stringify({ message: 'Media deleted successfully' }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin delete media error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete media' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}