// Account deletion API for StriveTrack
import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestDelete(context) {
    const { request, env } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'Authentication required' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prevent admin account deletion for security
        if (user.email === env.ADMIN_EMAIL) {
            return new Response(JSON.stringify({ 
                error: 'Admin account cannot be deleted' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user data for cleanup
        const userData = await env.DB.prepare(
            'SELECT profile_picture_url FROM users WHERE id = ?'
        ).bind(user.id).first();

        // Delete profile picture from R2 if exists
        if (userData?.profile_picture_url) {
            try {
                const urlParts = userData.profile_picture_url.split('/');
                const filename = urlParts[urlParts.length - 1];
                const fullPath = `profile-pictures/${filename}`;
                await env.MEDIA_BUCKET.delete(fullPath);
            } catch (deleteError) {
                console.warn('Failed to delete profile picture from R2:', deleteError);
                // Continue with account deletion even if file deletion fails
            }
        }

        // Delete all user media from R2
        try {
            const mediaList = await env.DB.prepare(
                'SELECT r2_key FROM media_uploads WHERE user_id = ?'
            ).bind(user.id).all();

            for (const media of mediaList.results || []) {
                try {
                    await env.MEDIA_BUCKET.delete(media.r2_key);
                } catch (deleteError) {
                    console.warn(`Failed to delete media ${media.r2_key}:`, deleteError);
                }
            }
        } catch (mediaError) {
            console.warn('Failed to delete user media:', mediaError);
        }

        // Delete user account (this will cascade delete all related data due to foreign key constraints)
        await env.DB.prepare('DELETE FROM users WHERE id = ?')
            .bind(user.id).run();

        return new Response(JSON.stringify({
            message: 'Account deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete account' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}