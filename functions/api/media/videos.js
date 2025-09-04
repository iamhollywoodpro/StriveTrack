export async function onRequestPost({ request, env }) {
    try {
        const sessionId = request.headers.get('x-session-id');
        
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'No session provided' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate session
        const sessionQuery = await env.DB.prepare(
            'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
        ).bind(sessionId).first();

        if (!sessionQuery) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = sessionQuery.user_id;
        const formData = await request.formData();
        const file = formData.get('file');
        const videoType = formData.get('video_type') || 'progress'; // 'progress', 'before', 'after', 'general'
        const tags = formData.get('tags') || '[]';
        
        if (!file) {
            return new Response(JSON.stringify({ error: 'No video file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            return new Response(JSON.stringify({ error: 'File must be a video' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate unique filename
        const { generateId } = await import('../../utils/id-generator.js');
        const fileExtension = file.name.split('.').pop();
        const fileName = `videos/${userId}/${Date.now()}-${generateId('generic')}.${fileExtension}`;

        try {
            // Upload to R2
            await env.MEDIA_BUCKET.put(fileName, file.stream(), {
                httpMetadata: {
                    contentType: file.type,
                },
                customMetadata: {
                    userId: userId,
                    videoType: videoType,
                    uploadDate: new Date().toISOString()
                }
            });

            // Generate video URL
            const videoUrl = `${env.MEDIA_BUCKET_URL || '/api/media/serve'}/${fileName}`;
            
            // Save video record to database
            const today = new Date();
            const uploadDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const weekNumber = getWeekNumber(today);
            const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            
            const videoId = generateId('generic');
            await env.DB.prepare(`
                INSERT INTO user_video_uploads (
                    id, user_id, video_url, video_type, upload_date, 
                    week_number, month_year, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                videoId, userId, videoUrl, videoType, uploadDate,
                weekNumber, monthYear, tags
            ).run();

            // Award points for video upload
            const pointsEarned = videoType === 'before' || videoType === 'after' ? 50 : 25;
            await env.DB.prepare(
                'UPDATE users SET points = points + ?, weekly_points = weekly_points + ? WHERE id = ?'
            ).bind(pointsEarned, pointsEarned, userId).run();

            // Check for before/after video pairing
            let beforeAfterPaired = false;
            if (videoType === 'before' || videoType === 'after') {
                const oppositeType = videoType === 'before' ? 'after' : 'before';
                const pairVideo = await env.DB.prepare(`
                    SELECT id FROM user_video_uploads 
                    WHERE user_id = ? AND video_type = ? 
                    AND upload_date >= date('now', '-60 days')
                    ORDER BY upload_date DESC LIMIT 1
                `).bind(userId, oppositeType).first();

                if (pairVideo) {
                    // Update both videos to mark as paired
                    await env.DB.prepare(`
                        UPDATE user_video_uploads 
                        SET is_before_after = 1, comparison_video_id = ?
                        WHERE id = ?
                    `).bind(pairVideo.id, videoId).run();
                    
                    await env.DB.prepare(`
                        UPDATE user_video_uploads 
                        SET is_before_after = 1, comparison_video_id = ?
                        WHERE id = ?
                    `).bind(videoId, pairVideo.id).run();
                    
                    beforeAfterPaired = true;
                }
            }

            // Trigger achievement checking (import the function)
            try {
                const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
                await checkAndAwardAchievements(userId, 'video_upload', { video_type: videoType }, env);
            } catch (achievementError) {
                console.error('Achievement check error:', achievementError);
                // Don't fail the upload if achievements fail
            }

            return new Response(JSON.stringify({
                message: 'Video uploaded successfully!',
                video_id: videoId,
                video_url: videoUrl,
                points_earned: pointsEarned,
                before_after_paired: beforeAfterPaired,
                video_type: videoType
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (uploadError) {
            console.error('Video upload error:', uploadError);
            return new Response(JSON.stringify({ error: 'Failed to upload video' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Video upload error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process video upload' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet({ request, env }) {
    try {
        const sessionId = request.headers.get('x-session-id');
        
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'No session provided' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const sessionQuery = await env.DB.prepare(
            'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
        ).bind(sessionId).first();

        if (!sessionQuery) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = sessionQuery.user_id;
        
        // Get user's videos
        const videos = await env.DB.prepare(`
            SELECT 
                id, video_url, video_type, upload_date, tags,
                is_before_after, comparison_video_id,
                week_number, month_year
            FROM user_video_uploads 
            WHERE user_id = ? 
            ORDER BY upload_date DESC
        `).bind(userId).all();

        // Group videos by type for stats
        const videoStats = {
            total: videos.results?.length || 0,
            by_type: {},
            this_month: 0,
            this_week: 0,
            before_after_pairs: 0
        };

        const today = new Date();
        const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const thisWeek = getWeekNumber(today);

        videos.results?.forEach(video => {
            // Count by type
            videoStats.by_type[video.video_type] = (videoStats.by_type[video.video_type] || 0) + 1;
            
            // Count this month
            if (video.month_year === thisMonth) {
                videoStats.this_month++;
            }
            
            // Count this week
            if (video.week_number === thisWeek) {
                videoStats.this_week++;
            }
            
            // Count before/after pairs
            if (video.is_before_after) {
                videoStats.before_after_pairs++;
            }
        });

        return new Response(JSON.stringify({
            videos: videos.results || [],
            stats: videoStats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get videos error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load videos' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}