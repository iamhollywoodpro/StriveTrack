// Delete media endpoint for StriveTrack
import { requireAuth } from '../../../utils/auth.js';

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const mediaId = params.id;
        
        if (!mediaId) {
            return new Response(JSON.stringify({ 
                error: 'Media ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get the media item to check ownership and get R2 key
        const media = await env.DB.prepare(`
            SELECT * FROM media_uploads 
            WHERE id = ? AND user_id = ?
        `).bind(mediaId, user.id).first();
        
        if (!media) {
            return new Response(JSON.stringify({ 
                error: 'Media not found or you do not have permission to delete it' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        try {
            // Delete from R2 bucket
            await env.MEDIA_BUCKET.delete(media.r2_key);
        } catch (r2Error) {
            console.error('R2 delete error:', r2Error);
            // Continue with database deletion even if R2 fails
        }
        
        // Delete from database
        await env.DB.prepare(`
            DELETE FROM media_uploads WHERE id = ? AND user_id = ?
        `).bind(mediaId, user.id).run();
        
        // Deduct points that were awarded for the upload
        const pointsToDeduct = media.media_type === 'before' ? 10 : 
                              media.media_type === 'after' ? 15 : 5;
        
        await env.DB.prepare('UPDATE users SET points = points - ? WHERE id = ?')
            .bind(pointsToDeduct, user.id).run();
        
        return new Response(JSON.stringify({
            message: 'Media deleted successfully',
            points_deducted: pointsToDeduct
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Delete media error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}