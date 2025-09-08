// Working Achievements API endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Get all achievements with user completion status (simplified)
        const achievementsResult = await env.DB.prepare(`
            SELECT 
                a.*,
                ua.earned_at,
                CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as earned
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY a.points ASC, a.created_at ASC
        `).bind(user.id).all();
        
        const achievements = achievementsResult.results || [];
        
        // Get basic user stats
        const userStatsResult = await env.DB.prepare(`
            SELECT 
                u.points as total_points,
                (SELECT COUNT(*) FROM habits WHERE user_id = ?) as habits_created,
                (SELECT COUNT(*) FROM habit_completions WHERE user_id = ?) as total_completions,
                (SELECT COUNT(*) FROM media_uploads WHERE user_id = ?) as total_media
            FROM users u
            WHERE u.id = ?
        `).bind(user.id, user.id, user.id, user.id).first();
        
        if (!userStatsResult) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Add basic progress to achievements
        const achievementsWithProgress = achievements.map(achievement => {
            let currentProgress = 0;
            
            switch (achievement.requirement_type) {
                case 'account_created':
                    currentProgress = 1;
                    break;
                case 'habits_created':
                    currentProgress = userStatsResult.habits_created || 0;
                    break;
                case 'total_completions':
                    currentProgress = userStatsResult.total_completions || 0;
                    break;
                case 'total_points':
                    currentProgress = userStatsResult.total_points || 0;
                    break;
                case 'total_media':
                case 'media_uploads':
                    currentProgress = userStatsResult.total_media || 0;
                    break;
                default:
                    currentProgress = achievement.earned ? achievement.requirement_value : 0;
            }
            
            const progressPercentage = achievement.requirement_value > 0 
                ? Math.min(100, Math.round((currentProgress / achievement.requirement_value) * 100))
                : 0;
                
            return {
                ...achievement,
                current_progress: currentProgress,
                progress_percentage: progressPercentage,
                is_completed: achievement.earned === 1,
                is_unlockable: currentProgress >= achievement.requirement_value && !achievement.earned
            };
        });
        
        // Basic stats
        const earnedCount = achievements.filter(a => a.earned === 1).length;
        const stats = {
            total_achievements: achievements.length,
            earned_achievements: earnedCount,
            completion_percentage: achievements.length > 0 ? Math.round((earnedCount / achievements.length) * 100) : 0,
            total_points: userStatsResult.total_points,
            unlockable_count: achievementsWithProgress.filter(a => a.is_unlockable).length
        };
        
        return new Response(JSON.stringify({
            achievements: achievementsWithProgress,
            stats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get achievements error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}