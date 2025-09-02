export async function onRequestGet({ request, env }) {
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
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Get today's challenges with user progress
        const challenges = await env.DB.prepare(`
            SELECT 
                dc.*,
                COALESCE(udc.progress_count, 0) as current_progress,
                COALESCE(udc.is_completed, 0) as is_completed,
                COALESCE(udc.points_earned, 0) as points_earned,
                udc.completed_at,
                CASE 
                    WHEN udc.is_completed = 1 THEN 100
                    ELSE ROUND((CAST(COALESCE(udc.progress_count, 0) AS FLOAT) / dc.requirement_value) * 100)
                END as progress_percentage
            FROM daily_challenges dc
            LEFT JOIN user_daily_challenges udc ON dc.id = udc.challenge_id 
                AND udc.user_id = ? 
                AND udc.challenge_date = ?
            WHERE dc.is_active = 1
            ORDER BY 
                udc.is_completed ASC,
                CASE dc.rarity 
                    WHEN 'legendary' THEN 4
                    WHEN 'epic' THEN 3 
                    WHEN 'rare' THEN 2
                    ELSE 1
                END DESC,
                dc.points_reward DESC
        `).bind(userId, today).all();

        // Get user's current streaks
        const streaks = await env.DB.prepare(`
            SELECT * FROM user_streaks WHERE user_id = ?
        `).bind(userId).all();

        // Calculate overall daily challenge stats
        const totalChallenges = challenges.results?.length || 0;
        const completedChallenges = challenges.results?.filter(c => c.is_completed).length || 0;
        const totalPointsEarned = challenges.results?.reduce((sum, c) => sum + c.points_earned, 0) || 0;
        const completionPercentage = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

        return new Response(JSON.stringify({
            challenges: challenges.results || [],
            streaks: streaks.results || [],
            stats: {
                total_challenges: totalChallenges,
                completed_challenges: completedChallenges,
                completion_percentage: completionPercentage,
                points_earned_today: totalPointsEarned
            },
            date: today
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Daily challenges error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load daily challenges' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}