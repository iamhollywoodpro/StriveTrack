// Admin Media Download API
// GET: Download specific media file
// Requires admin authentication

export async function onRequestGet(context) {
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

        // Get file from R2
        const object = await env.MEDIA_BUCKET.get(media.r2_key);
        if (!object) {
            return new Response(JSON.stringify({ error: 'File not found in storage' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user info for filename
        const mediaOwner = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(media.user_id).first();
        const ownerPrefix = mediaOwner ? mediaOwner.email.split('@')[0] : 'unknown';
        const downloadFilename = `${ownerPrefix}_${media.original_name}`;

        // Return file with proper headers for download
        return new Response(object.body, {
            headers: {
                'Content-Type': media.file_type,
                'Content-Length': media.file_size.toString(),
                'Content-Disposition': `attachment; filename="${downloadFilename}"`,
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Admin media download error:', error);
        return new Response(JSON.stringify({ error: 'Failed to download media' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}