// Admin user media management API for StriveTrack
import { getCurrentUser } from '../../../../utils/auth.js';

function isAdmin(user, env) {
    return user && user.role === 'admin' && user.email === 'iamhollywoodpro@protonmail.com';
}

export async function onRequestGet(context) {
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

        const userId = params.id;
        if (!userId) {
            return new Response(JSON.stringify({ 
                error: 'User ID required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user's media with additional metadata
        const media = await env.DB.prepare(`
            SELECT 
                m.*,
                u.username,
                u.email,
                CASE 
                    WHEN m.file_type LIKE 'image/%' THEN 'image'
                    WHEN m.file_type LIKE 'video/%' THEN 'video'
                    ELSE 'file'
                END as media_type,
                ROUND(CAST(m.file_size AS FLOAT) / 1024 / 1024, 2) as size_mb
            FROM media_uploads m
            JOIN users u ON m.user_id = u.id
            WHERE m.user_id = ?
            ORDER BY m.uploaded_at DESC
        `).bind(userId).all();

        // Generate URLs for media using proper API endpoints
        const mediaWithUrls = media.results.map(item => {
            // Use the media file API endpoint for serving actual files
            const mediaFileUrl = `/api/media/file/${item.id}`;
            
            let url = mediaFileUrl;
            let preview_url = mediaFileUrl; // Same URL for preview in admin
            
            // For videos, we might want a thumbnail, but for now use the same endpoint
            if (item.media_type === 'video') {
                // Videos will be handled by the media file endpoint
                preview_url = null; // No preview for videos in grid
            }
            
            return {
                ...item,
                url: url,
                preview_url: preview_url,
                // Add original filename for display
                display_name: item.original_name || item.filename,
                // Add formatted file size
                size_display: item.file_size ? `${Math.round(item.file_size / 1024)}KB` : 'Unknown size'
            };
        });

        return new Response(JSON.stringify({
            media: mediaWithUrls,
            total: media.results.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin user media fetch error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch user media' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}