// Admin media deletion endpoint
import { verifyAdminSession } from '../../../../utils/admin.js';

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    
    try {
        // Get session from headers
        const sessionId = request.headers.get('x-session-id');
        
        // Verify admin session
        const adminUser = await verifyAdminSession(sessionId, env);
        if (!adminUser) {
            return new Response(JSON.stringify({ error: 'Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const mediaId = params.id;
        
        if (!mediaId) {
            return new Response(JSON.stringify({ error: 'Media ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get media record to verify it exists and get R2 key
        const mediaRecord = await env.DB.prepare(`
            SELECT * FROM media_uploads WHERE id = ?
        `).bind(mediaId).first();
        
        if (!mediaRecord) {
            return new Response(JSON.stringify({ error: 'Media not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        try {
            // Delete from R2 storage
            await env.MEDIA_BUCKET.delete(mediaRecord.r2_key);
            console.log(`Deleted R2 object: ${mediaRecord.r2_key}`);
        } catch (r2Error) {
            console.error('R2 deletion error:', r2Error);
            // Continue with database deletion even if R2 fails
        }
        
        // Delete from database
        await env.DB.prepare(`
            DELETE FROM media_uploads WHERE id = ?
        `).bind(mediaId).run();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Media deleted successfully',
            media_id: mediaId,
            filename: mediaRecord.filename,
            r2_key: mediaRecord.r2_key
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Admin media deletion error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}