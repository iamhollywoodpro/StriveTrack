// Admin User Detail API
// GET: Get complete user details including all media
// Requires admin authentication (iamhollywoodpro@protonmail.com only)

import { verifyAdminSession } from '../../../utils/admin.js';

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

        const userId = params.id;

        // Get user details with activity stats
        const user = await env.DB.prepare(`
            SELECT 
                u.id, u.email, u.points, u.created_at,
                COUNT(DISTINCT h.id) as total_habits,
                COUNT(DISTINCT hc.id) as total_completions,
                COUNT(DISTINCT m.id) as total_media,
                COUNT(DISTINCT CASE WHEN m.is_flagged = 1 THEN m.id END) as flagged_media,
                COUNT(DISTINCT CASE WHEN m.file_type LIKE 'image/%' THEN m.id END) as total_images,
                COUNT(DISTINCT CASE WHEN m.file_type LIKE 'video/%' THEN m.id END) as total_videos,
                MAX(s.created_at) as last_session,
                COUNT(DISTINCT CASE WHEN s.expires_at > datetime('now') THEN s.id END) as active_sessions,
                MAX(m.uploaded_at) as last_upload,
                MAX(hc.completed_at) as last_completion
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            LEFT JOIN sessions s ON u.id = s.user_id
            WHERE u.id = ? AND u.email != 'iamhollywoodpro@protonmail.com'
            GROUP BY u.id, u.email, u.points, u.created_at
        `).bind(userId).first();

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all user's media
        const media = await env.DB.prepare(`
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
        `).bind(userId).all();

        // Get user's habits
        const habits = await env.DB.prepare(`
            SELECT 
                h.id, h.name, h.description, h.target_frequency, h.color, h.created_at,
                COUNT(hc.id) as total_completions,
                MAX(hc.completed_at) as last_completion
            FROM habits h
            LEFT JOIN habit_completions hc ON h.id = hc.habit_id
            WHERE h.user_id = ?
            GROUP BY h.id, h.name, h.description, h.target_frequency, h.color, h.created_at
            ORDER BY h.created_at DESC
        `).bind(userId).all();

        // Get recent activity
        const recentActivity = await env.DB.prepare(`
            SELECT 'completion' as type, h.name as title, hc.completed_at as timestamp, hc.notes as details
            FROM habit_completions hc
            JOIN habits h ON hc.habit_id = h.id
            WHERE hc.user_id = ?
            UNION ALL
            SELECT 'upload' as type, m.original_name as title, m.uploaded_at as timestamp, m.description as details
            FROM media_uploads m
            WHERE m.user_id = ?
            ORDER BY timestamp DESC
            LIMIT 20
        `).bind(userId, userId).all();

        return new Response(JSON.stringify({
            user,
            media: media.results || [],
            habits: habits.results || [],
            recent_activity: recentActivity.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin user detail fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch user details' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}