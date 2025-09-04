// Media thumbnail serving endpoint for StriveTrack
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
        
        // Get media record from database
        const mediaRecord = await env.DB.prepare(`
            SELECT * FROM media_uploads 
            WHERE id = ? AND user_id = ?
        `).bind(mediaId, user.id).first();
        
        if (!mediaRecord) {
            return new Response('Media not found', { status: 404 });
        }
        
        // For now, serve the original file
        // In production, you'd want to generate actual thumbnails
        const object = await env.MEDIA_BUCKET.get(mediaRecord.r2_key);
        
        if (!object) {
            return new Response('File not found in storage', { status: 404 });
        }
        
        // Stream the file content (thumbnail would be smaller in production)
        return new Response(object.body, {
            headers: {
                'Content-Type': mediaRecord.file_type,
                'Content-Length': object.size,
                'Cache-Control': 'public, max-age=31536000',
                'ETag': object.etag
            }
        });
        
    } catch (error) {
        console.error('Serve media thumbnail error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}