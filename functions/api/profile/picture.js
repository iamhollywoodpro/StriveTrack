// Profile picture upload API for StriveTrack
import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestPost(context) {
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

        const formData = await request.formData();
        const file = formData.get('profilePicture');

        if (!file) {
            return new Response(JSON.stringify({ 
                error: 'No file provided' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file size (2MB limit)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return new Response(JSON.stringify({ 
                error: 'File too large. Maximum size is 2MB' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.type.split('/')[1];
        const filename = `profile-pictures/${user.id}-${timestamp}.${extension}`;

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer();
        await env.MEDIA_BUCKET.put(filename, arrayBuffer, {
            httpMetadata: {
                contentType: file.type,
            },
        });

        // Generate public URL
        const profilePictureUrl = `https://strivetrack-media.iamhollywoodpro.com/${filename}`;

        // Update user profile with new picture URL
        await env.DB.prepare(`
            UPDATE users 
            SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(profilePictureUrl, user.id).run();

        return new Response(JSON.stringify({
            message: 'Profile picture uploaded successfully',
            profilePictureUrl
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile picture upload error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to upload profile picture' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

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

        // Get current profile picture URL
        const currentUser = await env.DB.prepare(
            'SELECT profile_picture_url FROM users WHERE id = ?'
        ).bind(user.id).first();

        if (currentUser?.profile_picture_url) {
            // Extract filename from URL
            const urlParts = currentUser.profile_picture_url.split('/');
            const filename = urlParts[urlParts.length - 1];
            const fullPath = `profile-pictures/${filename}`;

            // Delete from R2
            try {
                await env.MEDIA_BUCKET.delete(fullPath);
            } catch (deleteError) {
                console.warn('Failed to delete file from R2:', deleteError);
                // Continue with database update even if file deletion fails
            }
        }

        // Remove profile picture URL from database
        await env.DB.prepare(`
            UPDATE users 
            SET profile_picture_url = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(user.id).run();

        return new Response(JSON.stringify({
            message: 'Profile picture removed successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile picture removal error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to remove profile picture' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}