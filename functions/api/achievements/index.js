// Enhanced Achievements API endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Get all achievements with user completion status
        const achievementsResult = await env.DB.prepare(`
            SELECT 
                a.*,
                ua.earned_at,
                CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as earned
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY 
                a.category,
                a.difficulty,
                earned DESC,
                a.points ASC
        `).bind(user.id).all();
        
        const achievements = achievementsResult.results || [];
        
        // Get user stats for progress calculation
        const userStatsResult = await env.DB.prepare(`
            SELECT 
                u.points as total_points,
                u.created_at as user_created_at,
                (SELECT COUNT(*) FROM habits WHERE user_id = ?) as habits_created,
                (SELECT COUNT(*) FROM habit_completions WHERE user_id = ?) as total_completions,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'image/%') as photos_uploaded,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'video/%') as videos_uploaded,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ?) as total_media
            FROM users u
            WHERE u.id = ?
        `).bind(user.id, user.id, user.id, user.id, user.id, user.id).first();
        
        // Calculate current progress for each achievement
        const achievementsWithProgress = achievements.map(achievement => {
            let currentProgress = 0;
            let progressPercentage = 0;
            
            switch (achievement.requirement_type) {
                case 'account_created':
                    currentProgress = 1;
                    break;
                case 'habits_created':
                    currentProgress = userStatsResult.habits_created;
                    break;
                case 'total_completions':
                    currentProgress = userStatsResult.total_completions;
                    break;
                case 'photos_uploaded':
                    currentProgress = userStatsResult.photos_uploaded;
                    break;
                case 'videos_uploaded':
                    currentProgress = userStatsResult.videos_uploaded;
                    break;
                case 'total_media':
                    currentProgress = userStatsResult.total_media;
                    break;
                case 'total_points':
                    currentProgress = userStatsResult.total_points;
                    break;
                case 'habit_streak':
                    // TODO: Calculate actual streak - for now use placeholder
                    currentProgress = 0;
                    break;
                default:
                    currentProgress = achievement.earned ? achievement.requirement_value : 0;
            }
            
            progressPercentage = Math.min(100, Math.round((currentProgress / achievement.requirement_value) * 100));
            
            return {
                ...achievement,
                current_progress: currentProgress,
                progress_percentage: progressPercentage,
                is_completed: achievement.earned === 1,
                is_unlockable: currentProgress >= achievement.requirement_value && !achievement.earned
            };
        });
        
        // Group achievements by category
        const groupedAchievements = achievementsWithProgress.reduce((groups, achievement) => {
            const category = achievement.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(achievement);
            return groups;
        }, {});
        
        // Calculate user achievement stats
        const totalAchievements = achievements.length;
        const earnedAchievements = achievements.filter(a => a.earned === 1).length;
        const totalPointsFromAchievements = achievements
            .filter(a => a.earned === 1)
            .reduce((sum, a) => sum + a.points, 0);
        
        const stats = {
            total_achievements: totalAchievements,
            earned_achievements: earnedAchievements,
            completion_percentage: Math.round((earnedAchievements / totalAchievements) * 100),
            total_points: userStatsResult.total_points,
            achievement_points: totalPointsFromAchievements,
            unlockable_count: achievementsWithProgress.filter(a => a.is_unlockable).length
        };
        
        return new Response(JSON.stringify({
            achievements: achievementsWithProgress,
            grouped_achievements: groupedAchievements,
            stats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get achievements error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Unlock an achievement manually (for testing or admin purposes)
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const body = await request.json();
        const { achievement_id } = body;
        
        if (!achievement_id) {
            return new Response(JSON.stringify({ 
                error: 'Achievement ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if achievement exists and user hasn't earned it
        const achievement = await env.DB.prepare(
            'SELECT * FROM achievements WHERE id = ?'
        ).bind(achievement_id).first();
        
        if (!achievement) {
            return new Response(JSON.stringify({ 
                error: 'Achievement not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const existingUserAchievement = await env.DB.prepare(
            'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
        ).bind(user.id, achievement_id).first();
        
        if (existingUserAchievement) {
            return new Response(JSON.stringify({ 
                error: 'Achievement already earned' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Award the achievement
        const { generateId } = await import('../../utils/id-generator.js');
        const userAchievementId = generateId();
        
        await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id)
            VALUES (?, ?, ?)
        `).bind(userAchievementId, user.id, achievement_id).run();
        
        // Award points if the achievement has points
        if (achievement.points > 0) {
            await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?')
                .bind(achievement.points, user.id).run();
        }
        
        return new Response(JSON.stringify({
            message: 'Achievement unlocked!',
            achievement: achievement,
            points_awarded: achievement.points
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Unlock achievement error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}