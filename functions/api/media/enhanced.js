// Enhanced Media API endpoint for StriveTrack with categorization and before/after pairing
import { requireAuth } from '../../utils/auth.js';

// Utility function to get week start (Sunday) from date
function getWeekStartFromDate(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

// Utility function to get week end (Saturday) from date
function getWeekEndFromDate(date) {
    const weekStart = getWeekStartFromDate(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}

// Enhanced media retrieval with categorization and pairing logic
export async function getUserMediaEnhanced(userId, env) {
    const result = await env.DB.prepare(`
        SELECT * FROM media_uploads 
        WHERE user_id = ? 
        ORDER BY uploaded_at DESC
    `).bind(userId).all();
    
    const media = result.results || [];
    
    // Use existing media_type from database, fallback to 'progress' if null
    const categorizedMedia = media.map(item => ({
        ...item,
        media_type: item.media_type || 'progress'
    }));
    
    return categorizedMedia;
}

// Pair before/after media based on weekly timing
export async function pairBeforeAfterMedia(media) {
    const pairs = [];
    const beforeMedia = media.filter(m => m.media_type === 'before');
    const afterMedia = media.filter(m => m.media_type === 'after');
    
    beforeMedia.forEach(beforeItem => {
        const beforeDate = new Date(beforeItem.uploaded_at);
        const weekStart = getWeekStartFromDate(beforeDate);
        const weekEnd = getWeekEndFromDate(beforeDate);
        
        // Find after media in the same week
        const matchingAfter = afterMedia.find(afterItem => {
            const afterDate = new Date(afterItem.uploaded_at);
            return afterDate >= weekStart && afterDate <= weekEnd;
        });
        
        if (matchingAfter) {
            pairs.push({
                id: `pair_${beforeItem.id}_${matchingAfter.id}`,
                before: beforeItem,
                after: matchingAfter,
                week_start: weekStart.toISOString().split('T')[0],
                week_end: weekEnd.toISOString().split('T')[0]
            });
        }
    });
    
    return pairs;
}

// Calculate media statistics
export async function calculateMediaStats(media) {
    const totalUploads = media.length;
    const beforeCount = media.filter(m => m.media_type === 'before').length;
    const afterCount = media.filter(m => m.media_type === 'after').length;
    const progressCount = media.filter(m => m.media_type === 'progress').length;
    
    // Calculate weekly upload patterns
    const weeklyUploads = {};
    media.forEach(item => {
        const date = new Date(item.uploaded_at);
        const weekStart = getWeekStartFromDate(date).toISOString().split('T')[0];
        
        if (!weeklyUploads[weekStart]) {
            weeklyUploads[weekStart] = { before: 0, after: 0, progress: 0, total: 0 };
        }
        
        weeklyUploads[weekStart][item.media_type]++;
        weeklyUploads[weekStart].total++;
    });
    
    // Find most active week
    const mostActiveWeek = Object.keys(weeklyUploads).reduce((max, week) => {
        return weeklyUploads[week].total > (weeklyUploads[max]?.total || 0) ? week : max;
    }, null);
    
    return {
        total_uploads: totalUploads,
        before_count: beforeCount,
        after_count: afterCount,
        progress_count: progressCount,
        weekly_uploads: weeklyUploads,
        most_active_week: mostActiveWeek,
        most_active_week_count: mostActiveWeek ? weeklyUploads[mostActiveWeek].total : 0
    };
}

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const url = new URL(request.url);
        const includeStats = url.searchParams.get('stats') === 'true';
        const includePairs = url.searchParams.get('pairs') === 'true';
        const filterType = url.searchParams.get('type'); // 'before', 'after', 'progress'
        
        // Get enhanced media data
        const media = await getUserMediaEnhanced(user.id, env);
        
        // Generate signed URLs for R2 objects
        const mediaWithUrls = await Promise.all(media.map(async (item) => {
            try {
                const object = await env.MEDIA_BUCKET.get(item.r2_key);
                if (object) {
                    return {
                        ...item,
                        url: `/api/media/file/${item.id}`,
                        thumbnail: `/api/media/thumbnail/${item.id}`
                    };
                }
                return item;
            } catch (error) {
                console.error('Error getting media URL:', error);
                return item;
            }
        }));
        
        // Filter by type if specified
        const filteredMedia = filterType ? 
            mediaWithUrls.filter(m => m.media_type === filterType) : 
            mediaWithUrls;
        
        const response = {
            media: filteredMedia
        };
        
        // Add statistics if requested
        if (includeStats) {
            const rawStats = await calculateMediaStats(mediaWithUrls);
            response.stats = {
                total: rawStats.total_uploads,
                before_count: rawStats.before_count,
                after_count: rawStats.after_count,
                progress_count: rawStats.progress_count,
                comparison_count: 0, // Will be calculated from pairs if needed
                weekly_uploads: rawStats.weekly_uploads,
                most_active_week: rawStats.most_active_week,
                most_active_week_count: rawStats.most_active_week_count
            };
        }
        
        // Add before/after pairs if requested
        if (includePairs) {
            const pairs = await pairBeforeAfterMedia(mediaWithUrls);
            response.pairs = pairs;
        }
        
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get enhanced media error:', error);
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
        
        // Handle form data upload with media type
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
        
        const { generateId } = await import('../../utils/id-generator.js');
        const mediaId = generateId('generic');
        const fileExtension = file.name.split('.').pop();
        const r2Key = `uploads/${user.id}/${mediaId}.${fileExtension}`;
        
        // Upload to R2
        await env.MEDIA_BUCKET.put(r2Key, file.stream());
        
        // Save to database with media type
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
        
        // Check for weekly before/after pair completion
        let pairBonus = 0;
        if (mediaType === 'after') {
            const userMedia = await getUserMediaEnhanced(user.id, env);
            const pairs = await pairBeforeAfterMedia(userMedia);
            
            // Check if this after photo creates a new pair
            const newPair = pairs.find(pair => pair.after.id === mediaId);
            if (newPair) {
                pairBonus = 25; // Bonus for completing a before/after pair
                await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?')
                    .bind(pairBonus, user.id).run();
            }
        }
        
        // Check and award achievements
        const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
        const newAchievements = await checkAndAwardAchievements(user.id, 'media_upload', {
            media_type: mediaType,
            total_points: points + pairBonus
        }, env);
        
        return new Response(JSON.stringify({
            message: 'Media uploaded successfully',
            mediaId,
            media_type: mediaType,
            points,
            pair_bonus: pairBonus,
            total_points: points + pairBonus,
            newAchievements
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Upload enhanced media error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}