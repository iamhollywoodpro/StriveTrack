// Admin Media Management API
// GET: Retrieve all media uploads with user information
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

        // Get URL parameters for filtering and pagination
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const offset = parseInt(url.searchParams.get('offset')) || 0;
        const filter = url.searchParams.get('filter'); // 'flagged', 'images', 'videos'
        const userId = url.searchParams.get('user_id');

        // Build query based on filters
        let whereClause = '';
        let params = [];
        
        if (filter === 'flagged') {
            whereClause = 'WHERE m.is_flagged = 1';
        } else if (filter === 'images') {
            whereClause = 'WHERE m.file_type LIKE "image/%"';
        } else if (filter === 'videos') {
            whereClause = 'WHERE m.file_type LIKE "video/%"';
        }
        
        if (userId) {
            whereClause = whereClause ? `${whereClause} AND m.user_id = ?` : 'WHERE m.user_id = ?';
            params.push(userId);
        }

        // Add limit and offset
        params.push(limit, offset);

        // Get media uploads with user information
        const media = await env.DB.prepare(`
            SELECT 
                m.id, m.filename, m.original_name, m.file_type, m.file_size, 
                m.description, m.is_flagged, m.uploaded_at, m.r2_key,
                u.email as userEmail, u.id as user_id,
                CASE 
                    WHEN m.file_type LIKE 'image/%' THEN 'image'
                    WHEN m.file_type LIKE 'video/%' THEN 'video'
                    ELSE 'unknown'
                END as media_type
            FROM media_uploads m
            JOIN users u ON m.user_id = u.id
            ${whereClause}
            ORDER BY m.uploaded_at DESC
            LIMIT ? OFFSET ?
        `).bind(...params).all();

        // Get total count for pagination
        const totalCount = await env.DB.prepare(`
            SELECT COUNT(*) as total
            FROM media_uploads m
            JOIN users u ON m.user_id = u.id
            ${whereClause.replace('LIMIT ? OFFSET ?', '')}
        `).bind(...params.slice(0, -2)).first();

        return new Response(JSON.stringify({
            media: media.results || [],
            pagination: {
                total: totalCount?.total || 0,
                limit,
                offset,
                has_more: (totalCount?.total || 0) > offset + limit
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin media fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch media' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}