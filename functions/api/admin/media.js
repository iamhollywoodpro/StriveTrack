// Admin media management endpoint for StriveTrack
import { requireAdmin } from '../../utils/auth.js';
import { getAllMedia } from '../../utils/database.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAdmin(request, env);
        if (authResult instanceof Response) return authResult;
        
        const media = await getAllMedia(env);
        
        // Add URLs for admin access
        const mediaWithUrls = media.map(item => ({
            ...item,
            url: `/api/media/file/${item.id}`,
            download_url: `/api/admin/media/download/${item.id}`
        }));
        
        return new Response(JSON.stringify({ media: mediaWithUrls }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get admin media error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAdmin(request, env);
        if (authResult instanceof Response) return authResult;
        
        const body = await request.json();
        const { mediaId, action } = body;
        
        if (!mediaId || !action) {
            return new Response(JSON.stringify({ 
                error: 'Media ID and action are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const media = await env.DB.prepare(
            'SELECT * FROM media_uploads WHERE id = ?'
        ).bind(mediaId).first();
        
        if (!media) {
            return new Response(JSON.stringify({ 
                error: 'Media not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        switch (action) {
            case 'flag':
                await env.DB.prepare(
                    'UPDATE media_uploads SET is_flagged = 1 WHERE id = ?'
                ).bind(mediaId).run();
                return new Response(JSON.stringify({
                    message: 'Media flagged successfully'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
                
            case 'unflag':
                await env.DB.prepare(
                    'UPDATE media_uploads SET is_flagged = 0 WHERE id = ?'
                ).bind(mediaId).run();
                return new Response(JSON.stringify({
                    message: 'Media unflagged successfully'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
                
            case 'delete':
                // Delete from R2
                try {
                    await env.MEDIA_BUCKET.delete(media.r2_key);
                } catch (error) {
                    console.error('Error deleting from R2:', error);
                }
                
                // Delete from database
                await env.DB.prepare('DELETE FROM media_uploads WHERE id = ?')
                    .bind(mediaId).run();
                
                return new Response(JSON.stringify({
                    message: 'Media deleted successfully'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
                
            default:
                return new Response(JSON.stringify({ 
                    error: 'Invalid action. Use: flag, unflag, or delete' 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }
        
    } catch (error) {
        console.error('Admin media action error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}