// Admin Media Management API
// DELETE: Delete specific media file
// Requires admin authentication

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    
    try {
        // Check session and admin authorization
        const sessionId = request.headers.get('x-session-id');
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'Session required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify session and get user
        const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(sessionId).first();
        if (!session) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user and verify admin role
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const mediaId = params.id;

        // Get media details
        const media = await env.DB.prepare('SELECT * FROM media_uploads WHERE id = ?').bind(mediaId).first();
        if (!media) {
            return new Response(JSON.stringify({ error: 'Media not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete from R2
        try {
            await env.MEDIA_BUCKET.delete(media.r2_key);
        } catch (r2Error) {
            console.error('R2 deletion error:', r2Error);
            // Continue with database deletion even if R2 fails
        }

        // Delete from database
        await env.DB.prepare('DELETE FROM media_uploads WHERE id = ?').bind(mediaId).run();

        // Get user info for logging
        const mediaOwner = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(media.user_id).first();

        return new Response(JSON.stringify({
            success: true,
            message: 'Media deleted successfully',
            deleted_file: media.filename,
            owner: mediaOwner?.email || 'Unknown'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin media deletion error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete media' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}