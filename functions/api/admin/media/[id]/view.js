// Admin media view API for StriveTrack
import { getCurrentUser } from '../../../../utils/auth.js';

function isAdmin(user, env) {
    return user && user.role === 'admin' && user.email === 'iamhollywoodpro@protonmail.com';
}

export async function onRequestGet(context) {
    const { request, env, params } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        if (!isAdmin(user, env)) {
            return new Response('Admin access required', {
                status: 403
            });
        }

        const mediaId = params.id;
        if (!mediaId) {
            return new Response('Media ID required', {
                status: 400
            });
        }

        // Get media info
        const media = await env.DB.prepare(
            'SELECT * FROM media_uploads WHERE id = ?'
        ).bind(mediaId).first();

        if (!media) {
            return new Response('Media not found', {
                status: 404
            });
        }

        // Get file from R2
        const object = await env.MEDIA_BUCKET.get(media.r2_key);
        
        if (!object) {
            return new Response('File not found in storage', {
                status: 404
            });
        }

        // Return file for viewing (inline display)
        return new Response(object.body, {
            headers: {
                'Content-Type': media.file_type,
                'Content-Disposition': 'inline',
                'Content-Length': media.file_size,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Admin media view error:', error);
        return new Response('Failed to view media', {
            status: 500
        });
    }
}