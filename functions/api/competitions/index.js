// Competitions and leaderboard endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const url = new URL(request.url);
        const type = url.searchParams.get('type') || 'weekly';
        
        let leaderboard = [];
        let userRanking = null;
        
        switch (type) {
            case 'weekly':
                leaderboard = await getWeeklyLeaderboard(env, user.id);
                break;
            case 'achievements':
                leaderboard = await getAchievementLeaderboard(env, user.id);
                break;
            case 'streaks':
                leaderboard = await getStreaksLeaderboard(env, user.id);
                break;
            case 'challenges':
                leaderboard = await getChallengesLeaderboard(env, user.id);
                break;
            default:
                leaderboard = await getWeeklyLeaderboard(env, user.id);
        }
        
        // Find current user's ranking
        userRanking = leaderboard.find(entry => entry.user_id === user.id);
        
        return new Response(JSON.stringify({
            type,
            leaderboard,
            user_ranking: userRanking,
            total_participants: leaderboard.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get competitions error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getWeeklyLeaderboard(env, currentUserId) {
    const weeklyLeaderboard = await env.DB.prepare(`
        SELECT 
            u.id as user_id,
            u.email,
            u.weekly_points,
            ROW_NUMBER() OVER (ORDER BY u.weekly_points DESC, u.created_at ASC) as rank
        FROM users u
        WHERE u.weekly_points > 0
        ORDER BY u.weekly_points DESC, u.created_at ASC
        LIMIT 50
    `).all();
    
    return weeklyLeaderboard.results || [];
}

async function getAchievementLeaderboard(env, currentUserId) {
    const achievementLeaderboard = await env.DB.prepare(`
        SELECT 
            u.id as user_id,
            u.email,
            COUNT(ua.id) as achievement_count,
            SUM(a.points) as achievement_points,
            ROW_NUMBER() OVER (ORDER BY COUNT(ua.id) DESC, SUM(a.points) DESC, u.created_at ASC) as rank
        FROM users u
        LEFT JOIN user_achievements ua ON u.id = ua.user_id
        LEFT JOIN achievements a ON ua.achievement_id = a.id
        GROUP BY u.id, u.email, u.created_at
        HAVING achievement_count > 0
        ORDER BY achievement_count DESC, achievement_points DESC, u.created_at ASC
        LIMIT 50
    `).all();
    
    return achievementLeaderboard.results || [];
}

async function getStreaksLeaderboard(env, currentUserId) {
    // This is a simplified version - in a real implementation you'd calculate actual streaks
    const streaksLeaderboard = await env.DB.prepare(`
        SELECT 
            u.id as user_id,
            u.email,
            COUNT(DISTINCT h.id) as active_habits,
            COUNT(hc.id) as total_completions,
            ROW_NUMBER() OVER (ORDER BY COUNT(hc.id) DESC, COUNT(DISTINCT h.id) DESC, u.created_at ASC) as rank
        FROM users u
        LEFT JOIN habits h ON u.id = h.user_id
        LEFT JOIN habit_completions hc ON h.id = hc.habit_id
        WHERE hc.completed_at >= datetime('now', '-7 days')
        GROUP BY u.id, u.email, u.created_at
        HAVING total_completions > 0
        ORDER BY total_completions DESC, active_habits DESC, u.created_at ASC
        LIMIT 50
    `).all();
    
    return streaksLeaderboard.results || [];
}

async function getChallengesLeaderboard(env, currentUserId) {
    const challengesLeaderboard = await env.DB.prepare(`
        SELECT 
            u.id as user_id,
            u.email,
            COUNT(ucc.id) as challenges_completed,
            SUM(ucc.bonus_points) as bonus_points,
            ROW_NUMBER() OVER (ORDER BY COUNT(ucc.id) DESC, SUM(ucc.bonus_points) DESC, u.created_at ASC) as rank
        FROM users u
        LEFT JOIN user_challenge_completions ucc ON u.id = ucc.user_id
        WHERE ucc.completed_date >= date('now', '-7 days')
        GROUP BY u.id, u.email, u.created_at
        HAVING challenges_completed > 0
        ORDER BY challenges_completed DESC, bonus_points DESC, u.created_at ASC
        LIMIT 50
    `).all();
    
    return challengesLeaderboard.results || [];
}