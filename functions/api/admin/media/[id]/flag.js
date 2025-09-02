// Admin Media Flag Management API
// POST: Toggle flag status for specific media file
// Requires admin authentication

export async function onRequestPost(context) {
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

        // Get current media state
        const media = await env.DB.prepare('SELECT * FROM media_uploads WHERE id = ?').bind(mediaId).first();
        if (!media) {
            return new Response(JSON.stringify({ error: 'Media not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Toggle flag status
        const newFlagStatus = media.is_flagged ? 0 : 1;
        
        await env.DB.prepare('UPDATE media_uploads SET is_flagged = ? WHERE id = ?')
            .bind(newFlagStatus, mediaId)
            .run();

        // Get user info for logging
        const mediaOwner = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(media.user_id).first();

        return new Response(JSON.stringify({
            success: true,
            flagged: Boolean(newFlagStatus),
            message: newFlagStatus ? 'Media flagged for review' : 'Media unflagged',
            media_id: mediaId,
            filename: media.filename,
            owner: mediaOwner?.email || 'Unknown'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin media flag error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update flag status' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}