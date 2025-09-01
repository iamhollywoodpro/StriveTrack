// Media management endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';
import { getUserMedia, checkAndAwardAchievements } from '../../utils/database.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const media = await getUserMedia(user.id, env);
        
        // Generate signed URLs for R2 objects
        const mediaWithUrls = await Promise.all(media.map(async (item) => {
            try {
                const object = await env.MEDIA_BUCKET.get(item.r2_key);
                if (object) {
                    // For Cloudflare R2, we need to create a temporary URL
                    // In production, you'd want to implement signed URLs
                    return {
                        ...item,
                        url: `/api/media/file/${item.id}`, // We'll create this endpoint
                        thumbnail: `/api/media/thumbnail/${item.id}`
                    };
                }
                return item;
            } catch (error) {
                console.error('Error getting media URL:', error);
                return item;
            }
        }));
        
        return new Response(JSON.stringify({ media: mediaWithUrls }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get media error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Handle form data upload
        const formData = await request.formData();
        const file = formData.get('file');
        const description = formData.get('description') || '';
        
        if (!file || !file.name) {
            return new Response(JSON.stringify({ 
                error: 'File is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid file type. Only images and videos are allowed.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            return new Response(JSON.stringify({ 
                error: 'File size too large. Maximum 50MB allowed.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const { v4: uuidv4 } = await import('uuid');
        const mediaId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const r2Key = `uploads/${user.id}/${mediaId}.${fileExtension}`;
        
        // Upload to R2
        await env.MEDIA_BUCKET.put(r2Key, file.stream());
        
        // Save to database
        await env.DB.prepare(`
            INSERT INTO media_uploads (id, user_id, filename, original_name, file_type, file_size, r2_key, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            mediaId,
            user.id,
            `${mediaId}.${fileExtension}`,
            file.name,
            file.type,
            file.size,
            r2Key,
            description
        ).run();
        
        // Award points for media upload
        await env.DB.prepare('UPDATE users SET points = points + 5 WHERE id = ?')
            .bind(user.id).run();
        
        // Check and award achievements
        const newAchievements = await checkAndAwardAchievements(user.id, env);
        
        return new Response(JSON.stringify({
            message: 'Media uploaded successfully',
            mediaId,
            points: 5,
            newAchievements
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Upload media error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}