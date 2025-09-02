// Admin Media Download API
// GET: Download specific media file
// Requires admin authentication (iamhollywoodpro@protonmail.com only)

import { verifyAdminSession } from '../../../../utils/admin.js';

export async function onRequestGet(context) {
    const { request, env, params } = context;
    
    try {
        // Verify admin session (hardcoded admin only)
        const sessionId = request.headers.get('x-session-id');
        const adminUser = await verifyAdminSession(sessionId, env);
        
        if (!adminUser) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
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