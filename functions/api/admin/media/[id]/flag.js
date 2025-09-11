// Admin media flag management API for StriveTrack
import { getCurrentUser } from '../../../../utils/auth.js';

function isAdmin(user, env) {
    return user && user.role === 'admin' && user.email === 'iamhollywoodpro@protonmail.com';
}

export async function onRequestPost(context) {
    const { request, env, params } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        if (!isAdmin(user, env)) {
            return new Response(JSON.stringify({ 
                error: 'Admin access required' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const mediaId = params.id;
        if (!mediaId) {
            return new Response(JSON.stringify({ 
                error: 'Media ID required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get current flag status
        const currentMedia = await env.DB.prepare(
            'SELECT is_flagged FROM media_uploads WHERE id = ?'
        ).bind(mediaId).first();

        if (!currentMedia) {
            return new Response(JSON.stringify({ 
                error: 'Media not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Toggle flag status
        const newFlagStatus = !currentMedia.is_flagged;
        
        await env.DB.prepare(`
            UPDATE media_uploads 
            SET is_flagged = ? 
            WHERE id = ?
        `).bind(newFlagStatus, mediaId).run();

        return new Response(JSON.stringify({
            message: `Media ${newFlagStatus ? 'flagged' : 'unflagged'} successfully`,
            is_flagged: newFlagStatus
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin media flag error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update flag status' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}