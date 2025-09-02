// Admin Media by User API
// GET: Retrieve all media organized by user
// Requires admin authentication (iamhollywoodpro@protonmail.com only)

import { verifyAdminSession } from '../../utils/admin.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
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

        // Get all users with their media counts (excluding admin)
        const usersWithMedia = await env.DB.prepare(`
            SELECT 
                u.id, u.email, u.created_at, u.points,
                COUNT(m.id) as total_media,
                COUNT(CASE WHEN m.is_flagged = 1 THEN m.id END) as flagged_media,
                COUNT(CASE WHEN m.file_type LIKE 'image/%' THEN m.id END) as total_images,
                COUNT(CASE WHEN m.file_type LIKE 'video/%' THEN m.id END) as total_videos,
                MAX(m.uploaded_at) as last_upload
            FROM users u
            LEFT JOIN media_uploads m ON u.id = m.user_id
            WHERE u.email != 'iamhollywoodpro@protonmail.com'
            GROUP BY u.id, u.email, u.created_at, u.points
            HAVING COUNT(m.id) > 0
            ORDER BY COUNT(m.id) DESC, u.created_at DESC
        `).all();

        // For each user, get their media details
        const userMediaData = [];
        
        for (const user of usersWithMedia.results || []) {
            const userMedia = await env.DB.prepare(`
                SELECT 
                    id, filename, original_name, file_type, file_size, 
                    description, is_flagged, uploaded_at, r2_key,
                    CASE 
                        WHEN file_type LIKE 'image/%' THEN 'image'
                        WHEN file_type LIKE 'video/%' THEN 'video'
                        ELSE 'unknown'
                    END as media_type
                FROM media_uploads 
                WHERE user_id = ?
                ORDER BY uploaded_at DESC
                LIMIT 50
            `).bind(user.id).all();

            userMediaData.push({
                user: {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    points: user.points,
                    total_media: user.total_media,
                    flagged_media: user.flagged_media,
                    total_images: user.total_images,
                    total_videos: user.total_videos,
                    last_upload: user.last_upload
                },
                media: userMedia.results || []
            });
        }

        // Get summary statistics
        const totalStats = await env.DB.prepare(`
            SELECT 
                COUNT(DISTINCT u.id) as users_with_media,
                COUNT(m.id) as total_media_files,
                COUNT(CASE WHEN m.is_flagged = 1 THEN m.id END) as total_flagged,
                SUM(m.file_size) as total_storage_bytes
            FROM users u
            JOIN media_uploads m ON u.id = m.user_id
            WHERE u.email != 'iamhollywoodpro@protonmail.com'
        `).first();

        return new Response(JSON.stringify({
            user_media: userMediaData,
            stats: totalStats || {}
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin media by user fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch user media data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}