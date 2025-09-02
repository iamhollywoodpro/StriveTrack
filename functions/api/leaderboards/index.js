export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const sessionId = request.headers.get('x-session-id');
        const leaderboardType = url.searchParams.get('type') || 'weekly';
        
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
        
        // Get user's friends
        const friends = await env.DB.prepare(`
            SELECT DISTINCT 
                CASE 
                    WHEN uf.user_id = ? THEN uf.friend_id 
                    ELSE uf.user_id 
                END as friend_user_id
            FROM user_friends uf
            WHERE (uf.user_id = ? OR uf.friend_id = ?) 
            AND uf.status = 'accepted'
        `).bind(userId, userId, userId).all();

        const friendIds = friends.results?.map(f => f.friend_user_id) || [];
        friendIds.push(userId); // Include current user
        
        let leaderboardData = [];
        
        if (leaderboardType === 'weekly') {
            // Weekly points leaderboard
            leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    u.weekly_points as score,
                    u.weekly_points,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements,
                    'weekly_points' as metric
                FROM users u
                WHERE u.id IN (${friendIds.map(() => '?').join(',')})
                ORDER BY u.weekly_points DESC
                LIMIT 20
            `).bind(...friendIds).all();
            
        } else if (leaderboardType === 'achievements') {
            // Total achievements leaderboard
            leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COUNT(ua.id) as score,
                    u.weekly_points,
                    COUNT(ua.id) as total_achievements,
                    'total_achievements' as metric
                FROM users u
                LEFT JOIN user_achievements ua ON u.id = ua.user_id
                WHERE u.id IN (${friendIds.map(() => '?').join(',')})
                GROUP BY u.id, u.email, u.weekly_points
                ORDER BY COUNT(ua.id) DESC
                LIMIT 20
            `).bind(...friendIds).all();
            
        } else if (leaderboardType === 'streaks') {
            // Current streaks leaderboard
            leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COALESCE(MAX(us.current_streak), 0) as score,
                    u.weekly_points,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements,
                    'current_streaks' as metric
                FROM users u
                LEFT JOIN user_streaks us ON u.id = us.user_id
                WHERE u.id IN (${friendIds.map(() => '?').join(',')})
                GROUP BY u.id, u.email, u.weekly_points
                ORDER BY MAX(us.current_streak) DESC
                LIMIT 20
            `).bind(...friendIds).all();
            
        } else if (leaderboardType === 'challenges') {
            // Daily challenges completion rate
            const today = new Date().toISOString().split('T')[0];
            leaderboardData = await env.DB.prepare(`
                SELECT 
                    u.id,
                    u.email,
                    COUNT(udc.id) as score,
                    u.weekly_points,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements,
                    'daily_challenges' as metric
                FROM users u
                LEFT JOIN user_daily_challenges udc ON u.id = udc.user_id 
                    AND udc.challenge_date = ? AND udc.is_completed = 1
                WHERE u.id IN (${friendIds.map(() => '?').join(',')})
                GROUP BY u.id, u.email, u.weekly_points
                ORDER BY COUNT(udc.id) DESC
                LIMIT 20
            `).bind(today, ...friendIds).all();
        }

        // Format leaderboard with ranks and user info
        const formattedLeaderboard = leaderboardData.results?.map((entry, index) => ({
            rank: index + 1,
            user_id: entry.id,
            email: entry.email,
            display_name: entry.email.split('@')[0], // Use email prefix as display name
            score: entry.score,
            weekly_points: entry.weekly_points,
            total_achievements: entry.total_achievements,
            is_current_user: entry.id === userId,
            metric: entry.metric
        })) || [];

        // Get user's friends count
        const friendsCount = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM user_friends 
            WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
        `).bind(userId, userId).first();

        return new Response(JSON.stringify({
            leaderboard: formattedLeaderboard,
            leaderboard_type: leaderboardType,
            friends_count: friendsCount?.count || 0,
            user_rank: formattedLeaderboard.findIndex(entry => entry.is_current_user) + 1 || null
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load leaderboards' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}