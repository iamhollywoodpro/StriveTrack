// Media file serving endpoint for StriveTrack
import { requireAuth } from '../../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const mediaId = params.id;
        
        if (!mediaId) {
            return new Response('Media ID required', { status: 400 });
        }
        
        // Get media info from database
        const media = await env.DB.prepare(`
            SELECT * FROM media_uploads WHERE id = ?
        `).bind(mediaId).first();
        
        if (!media) {
            return new Response('Media not found', { status: 404 });
        }
        
        // Check if user owns the media or is admin
        if (media.user_id !== user.id && user.role !== 'admin') {
            return new Response('Access denied', { status: 403 });
        }
        
        // Get file from R2
        const object = await env.MEDIA_BUCKET.get(media.r2_key);
        
        if (!object) {
            return new Response('File not found', { status: 404 });
        }
        
        // Return the file with appropriate headers
        return new Response(object.body, {
            headers: {
                'Content-Type': media.file_type,
                'Content-Length': object.size,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                'Content-Disposition': `inline; filename="${media.original_name}"`
            }
        });
        
    } catch (error) {
        console.error('Serve media error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}