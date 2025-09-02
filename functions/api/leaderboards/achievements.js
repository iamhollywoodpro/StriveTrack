// Achievement-based leaderboard API
export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'GET') {
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
        
        // Get weekly achievement leaderboard among friends
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const leaderboard = await env.DB.prepare(`
            SELECT 
                u.id,
                u.email,
                COALESCE(u.display_name, SUBSTR(u.email, 1, INSTR(u.email, '@') - 1)) as display_name,
                COUNT(ua.id) as weekly_achievements,
                (SELECT COUNT(*) FROM user_achievements ua2 WHERE ua2.user_id = u.id) as total_achievements,
                u.points as total_points,
                CASE WHEN u.id = ? THEN 1 ELSE 0 END as is_current_user,
                ROW_NUMBER() OVER (ORDER BY COUNT(ua.id) DESC, u.points DESC) as rank
            FROM users u
            LEFT JOIN user_achievements ua ON u.id = ua.user_id 
                AND date(ua.created_at) >= date(?)
            WHERE u.id IN (
                SELECT CASE 
                    WHEN f.user_id = ? THEN f.friend_id
                    WHEN f.friend_id = ? THEN f.user_id
                END as friend_id
                FROM friendships f 
                WHERE (f.user_id = ? OR f.friend_id = ?) 
                AND f.status = 'accepted'
                UNION
                SELECT ? -- Include current user
            )
            GROUP BY u.id, u.email, u.display_name, u.points
            ORDER BY COUNT(ua.id) DESC, u.points DESC
            LIMIT 10
        `).bind(userId, weekStartStr, userId, userId, userId, userId, userId).all();
        
        const results = leaderboard.results || [];
        
        // Format leaderboard data
        const formattedLeaderboard = results.map(entry => ({
            id: entry.id,
            display_name: entry.display_name,
            score: entry.weekly_achievements,
            total_achievements: entry.total_achievements,
            total_points: entry.total_points,
            rank: entry.rank,
            is_current_user: entry.is_current_user === 1
        }));
        
        // Get achievement stats for the user
        const userStats = await env.DB.prepare(`
            SELECT 
                COUNT(CASE WHEN date(ua.created_at) >= date(?) THEN 1 END) as weekly_achievements,
                COUNT(*) as total_achievements,
                COUNT(CASE WHEN a.rarity = 'legendary' THEN 1 END) as legendary_count,
                COUNT(CASE WHEN a.rarity = 'epic' THEN 1 END) as epic_count,
                COUNT(CASE WHEN a.rarity = 'rare' THEN 1 END) as rare_count,
                COUNT(CASE WHEN a.rarity = 'common' THEN 1 END) as common_count
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
        `).bind(weekStartStr, userId).first();
        
        return new Response(JSON.stringify({
            leaderboard: formattedLeaderboard,
            user_stats: userStats || {
                weekly_achievements: 0,
                total_achievements: 0,
                legendary_count: 0,
                epic_count: 0,
                rare_count: 0,
                common_count: 0
            },
            week_start: weekStartStr,
            leaderboard_type: 'achievements'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Achievement leaderboard error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load achievement leaderboard' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}