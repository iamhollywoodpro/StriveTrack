// Admin users management endpoint for StriveTrack
import { requireAdmin } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAdmin(request, env);
        if (authResult instanceof Response) return authResult;
        
        // Get all users (excluding admin user from the list)
        const users = await env.DB.prepare(`
            SELECT u.id, u.email, u.role, u.points, u.created_at,
                   COUNT(DISTINCT h.id) as total_habits,
                   COUNT(DISTINCT hc.id) as total_completions,
                   COUNT(DISTINCT m.id) as total_media
            FROM users u
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON u.id = hc.user_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            WHERE u.role != 'admin'
            GROUP BY u.id, u.email, u.role, u.points, u.created_at
            ORDER BY u.created_at DESC
        `).all();
        
        // Get platform statistics
        const stats = await env.DB.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role != 'admin') as total_users,
                (SELECT COUNT(*) FROM habits) as total_habits,
                (SELECT COUNT(*) FROM habit_completions) as total_completions,
                (SELECT COUNT(*) FROM media_uploads) as total_media,
                (SELECT COUNT(*) FROM media_uploads WHERE is_flagged = 1) as flagged_media
        `).first();
        
        return new Response(JSON.stringify({ 
            users, 
            stats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get admin users error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAdmin(request, env);
        if (authResult instanceof Response) return authResult;
        
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return new Response(JSON.stringify({ 
                error: 'User ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if user exists and is not admin
        const user = await env.DB.prepare(
            'SELECT id, role FROM users WHERE id = ?'
        ).bind(userId).first();
        
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (user.role === 'admin') {
            return new Response(JSON.stringify({ 
                error: 'Cannot delete admin user' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Delete user media from R2
        const userMedia = await env.DB.prepare(
            'SELECT r2_key FROM media_uploads WHERE user_id = ?'
        ).bind(userId).all();
        
        for (const media of userMedia) {
            try {
                await env.MEDIA_BUCKET.delete(media.r2_key);
            } catch (error) {
                console.error('Error deleting R2 object:', error);
            }
        }
        
        // Delete user (cascade will handle related records)
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
        
        return new Response(JSON.stringify({
            message: 'User deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}