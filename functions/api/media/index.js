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
        const mediaType = formData.get('media_type') || 'progress'; // 'before', 'after', 'progress'
        
        if (!file || !file.name) {
            return new Response(JSON.stringify({ 
                error: 'File is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Validate file type - Expanded support for mobile device formats
        const allowedTypes = [
            // Image formats
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',           // Modern web format, widely supported
            'image/heic',           // iOS/Apple devices native format
            'image/heif',           // iOS/Apple devices native format
            'image/bmp',            // Basic bitmap format
            'image/tiff',           // High quality format
            'image/svg+xml',        // Vector graphics
            // Video formats
            'video/mp4',
            'video/quicktime',      // .mov files
            'video/avi',            // Windows default
            'video/x-msvideo',      // Alternative AVI MIME type
            'video/wmv',            // Windows Media Video
            'video/x-ms-wmv',       // Alternative WMV MIME type
            'video/webm',           // Modern web video format
            'video/ogg',            // Open source video format
            'video/3gpp',           // 3GP format (mobile)
            'video/3gpp2',          // 3G2 format (mobile)
            'video/x-flv',          // Flash Video
            'video/mkv',            // Matroska Video
            'video/x-matroska'      // Alternative MKV MIME type
        ];
        
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ 
                error: `Invalid file type: ${file.type}. Supported formats: Images (JPEG, PNG, GIF, WEBP, HEIC, BMP, TIFF, SVG) and Videos (MP4, MOV, AVI, WMV, WEBM, OGG, 3GP, FLV, MKV)` 
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
        
        const { generateMediaId } = await import('../../utils/id-generator.js');
        const mediaId = generateMediaId();
        const fileExtension = file.name.split('.').pop();
        const r2Key = `uploads/${user.id}/${mediaId}.${fileExtension}`;
        
        // Upload to R2
        await env.MEDIA_BUCKET.put(r2Key, file.stream());
        
        // Validate media type
        const validTypes = ['before', 'after', 'progress'];
        if (!validTypes.includes(mediaType)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid media type. Must be: before, after, or progress' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Save to database
        await env.DB.prepare(`
            INSERT INTO media_uploads (id, user_id, filename, original_name, file_type, file_size, r2_key, description, media_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            mediaId,
            user.id,
            `${mediaId}.${fileExtension}`,
            file.name,
            file.type,
            file.size,
            r2Key,
            description,
            mediaType
        ).run();
        
        // Award points based on media type
        const points = mediaType === 'before' ? 10 : mediaType === 'after' ? 15 : 5;
        await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?')
            .bind(points, user.id).run();
        
        // Check and award achievements
        const newAchievements = await checkAndAwardAchievements(user.id, env);
        
        return new Response(JSON.stringify({
            message: 'Media uploaded successfully',
            mediaId,
            media_type: mediaType,
            points,
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