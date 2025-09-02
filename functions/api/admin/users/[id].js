// Admin User Management API
// DELETE: Delete a specific user and all their data
// Requires admin authentication (iamhollywoodpro@protonmail.com only)

import { verifyAdminSession, isAdmin } from '../../../utils/admin.js';

export async function onRequestDelete(context) {
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

        // Prevent self-deletion
        if (userId === adminUser.id) {
            return new Response(JSON.stringify({ error: 'Cannot delete your own admin account' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user to delete
        const userToDelete = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        if (!userToDelete) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prevent deleting the admin account
        if (isAdmin(userToDelete)) {
            return new Response(JSON.stringify({ error: 'Cannot delete admin account' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all user media files for R2 cleanup
        const mediaFiles = await env.DB.prepare('SELECT r2_key FROM media_uploads WHERE user_id = ?').bind(userId).all();

        // Begin transaction - delete all user data
        const batch = [
            // Delete user achievements
            env.DB.prepare('DELETE FROM user_achievements WHERE user_id = ?').bind(userId),
            // Delete user achievement progress
            env.DB.prepare('DELETE FROM user_achievement_progress WHERE user_id = ?').bind(userId),
            // Delete habit completions
            env.DB.prepare('DELETE FROM habit_completions WHERE user_id = ?').bind(userId),
            // Delete weekly completions
            env.DB.prepare('DELETE FROM weekly_habit_completions WHERE user_id = ?').bind(userId),
            // Delete habits
            env.DB.prepare('DELETE FROM habits WHERE user_id = ?').bind(userId),
            // Delete media uploads
            env.DB.prepare('DELETE FROM media_uploads WHERE user_id = ?').bind(userId),
            // Delete user reminders
            env.DB.prepare('DELETE FROM user_reminders WHERE user_id = ?').bind(userId),
            // Delete sessions
            env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId),
            // Delete user
            env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId)
        ];

        await env.DB.batch(batch);

        // Clean up R2 media files
        if (mediaFiles.results && mediaFiles.results.length > 0) {
            for (const media of mediaFiles.results) {
                try {
                    await env.MEDIA_BUCKET.delete(media.r2_key);
                } catch (r2Error) {
                    console.error('R2 cleanup error for key:', media.r2_key, r2Error);
                    // Continue cleanup even if some files fail
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `User ${userToDelete.email} and all associated data deleted successfully`,
            deleted_media_files: mediaFiles.results?.length || 0
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin user deletion error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}