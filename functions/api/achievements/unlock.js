// Achievement unlock API with celebration support
export async function onRequest(context) {
    const { request, env } = context;
    
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        // Validate session
        const sessionId = request.headers.get('x-session-id');
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'Session required' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const session = await env.DB.prepare(
            'SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > datetime("now")'
        ).bind(sessionId).first();
        
        if (!session) {
            return new Response(JSON.stringify({ error: 'Invalid session' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const userId = session.user_id;
        
        // Parse request body
        const body = await request.json();
        const { achievement_id } = body;
        
        if (!achievement_id) {
            return new Response(JSON.stringify({ error: 'Achievement ID required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if achievement exists and is unlockable
        const achievement = await env.DB.prepare(`
            SELECT a.*, 
                   CASE WHEN ua.id IS NULL THEN 0 ELSE 1 END as is_completed,
                   ua.created_at as earned_at
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE a.id = ?
        `).bind(userId, achievement_id).first();
        
        if (!achievement) {
            return new Response(JSON.stringify({ error: 'Achievement not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (achievement.is_completed) {
            return new Response(JSON.stringify({ error: 'Achievement already unlocked' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if achievement is unlockable (meets requirements)
        const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
        
        // Unlock the achievement
        const { generateId } = await import('../../utils/id-generator.js');
        const userAchievementId = generateId('generic');
        
        // Award the achievement
        await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `).bind(userAchievementId, userId, achievement_id).run();
        
        // Award points to user
        if (achievement.points > 0) {
            await env.DB.prepare(`
                UPDATE users SET points = points + ? WHERE id = ?
            `).bind(achievement.points, userId).run();
        }
        
        // Get updated achievement info
        const unlockedAchievement = await env.DB.prepare(`
            SELECT a.*, ua.created_at as earned_at, 1 as is_completed
            FROM achievements a
            JOIN user_achievements ua ON a.id = ua.achievement_id
            WHERE ua.id = ?
        `).bind(userAchievementId).first();
        
        // Log achievement unlock activity
        try {
            const activityId = generateId('generic');
            await env.DB.prepare(`
                INSERT INTO user_activity_log (id, user_id, activity_type, activity_data, created_at)
                VALUES (?, ?, 'achievement_unlock', ?, datetime('now'))
            `).bind(activityId, userId, JSON.stringify({
                achievement_id: achievement_id,
                achievement_name: achievement.name,
                rarity: achievement.rarity,
                points: achievement.points
            })).run();
        } catch (error) {
            console.error('Failed to log achievement activity:', error);
        }
        
        // Check for combo achievements
        await checkComboAchievements(userId, env);
        
        return new Response(JSON.stringify({ 
            success: true,
            achievement: unlockedAchievement,
            message: `Achievement "${achievement.name}" unlocked! +${achievement.points} points`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Achievement unlock error:', error);
        return new Response(JSON.stringify({ error: 'Failed to unlock achievement' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Check for combo achievements after unlocking
async function checkComboAchievements(userId, env) {
    try {
        // Check achievements unlocked today
        const todayAchievements = await env.DB.prepare(`
            SELECT COUNT(*) as count
            FROM user_achievements
            WHERE user_id = ? AND date(created_at) = date('now')
        `).bind(userId).first();
        
        // Check for daily combo achievements
        if (todayAchievements.count >= 3) {
            await awardComboAchievement(userId, 'Achievement Spree', 3, env);
        }
        
        if (todayAchievements.count >= 5) {
            await awardComboAchievement(userId, 'Achievement Frenzy', 5, env);
        }
        
        if (todayAchievements.count >= 10) {
            await awardComboAchievement(userId, 'Achievement Hurricane', 10, env);
        }
        
    } catch (error) {
        console.error('Combo achievement check error:', error);
    }
}

async function awardComboAchievement(userId, achievementName, count, env) {
    try {
        // Check if user already has this combo achievement
        const existingCombo = await env.DB.prepare(`
            SELECT ua.id
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ? AND a.name = ?
        `).bind(userId, achievementName).first();
        
        if (existingCombo) return; // Already has this combo
        
        // Find the combo achievement
        const comboAchievement = await env.DB.prepare(`
            SELECT * FROM achievements WHERE name = ?
        `).bind(achievementName).first();
        
        if (!comboAchievement) return;
        
        // Award the combo achievement
        const { generateId } = await import('../../utils/id-generator.js');
        const comboId = generateId('generic');
        
        await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `).bind(comboId, userId, comboAchievement.id).run();
        
        // Award points
        if (comboAchievement.points > 0) {
            await env.DB.prepare(`
                UPDATE users SET points = points + ? WHERE id = ?
            `).bind(comboAchievement.points, userId).run();
        }
        
    } catch (error) {
        console.error('Award combo achievement error:', error);
    }
}