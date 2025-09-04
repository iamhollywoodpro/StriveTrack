// Simplified Achievements API endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Simple query to get all achievements
        const achievementsResult = await env.DB.prepare(`
            SELECT * FROM achievements ORDER BY category, points ASC
        `).all();
        
        const achievements = achievementsResult.results || [];
        
        // Get user's earned achievements
        const userAchievementsResult = await env.DB.prepare(`
            SELECT achievement_id, earned_at FROM user_achievements 
            WHERE user_id = ?
        `).bind(user.id).all();
        
        const earnedIds = (userAchievementsResult.results || []).map(ua => ua.achievement_id);
        
        // Add earned status to achievements
        const achievementsWithStatus = achievements.map(achievement => ({
            ...achievement,
            earned: earnedIds.includes(achievement.id),
            progress_percentage: earnedIds.includes(achievement.id) ? 100 : 0
        }));
        
        return new Response(JSON.stringify({
            achievements: achievementsWithStatus,
            stats: {
                total: achievements.length,
                earned: earnedIds.length,
                completion_percentage: Math.round((earnedIds.length / achievements.length) * 100)
            }
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

// Award achievement endpoint
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
        
        // Check if achievement exists
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
        
        // Check if already earned
        const existing = await env.DB.prepare(
            'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
        ).bind(user.id, achievement_id).first();
        
        if (existing) {
            return new Response(JSON.stringify({ 
                error: 'Achievement already earned' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate simple ID without UUID
        const userAchievementId = `ua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Award the achievement
        await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id, earned_at)
            VALUES (?, ?, ?, datetime('now'))
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
        console.error('Award achievement error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}