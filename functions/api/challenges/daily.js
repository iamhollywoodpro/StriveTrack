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
        const { challenge_id } = await request.json();
        
        if (!challenge_id) {
            return new Response(JSON.stringify({ error: 'Challenge ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const today = new Date().toISOString().split('T')[0];

        // Get the challenge details
        const challenge = await env.DB.prepare(`
            SELECT * FROM daily_challenges WHERE id = ? AND is_active = 1
        `).bind(challenge_id).first();

        if (!challenge) {
            return new Response(JSON.stringify({ error: 'Challenge not found or inactive' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if already completed today
        const existingCompletion = await env.DB.prepare(`
            SELECT * FROM user_daily_challenges 
            WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
        `).bind(userId, challenge_id, today).first();

        if (existingCompletion && existingCompletion.is_completed) {
            return new Response(JSON.stringify({ 
                error: 'Challenge already completed today',
                completed: true 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if user meets the requirements
        const canComplete = await checkChallengeRequirements(userId, challenge, env);
        
        if (!canComplete.eligible) {
            return new Response(JSON.stringify({ 
                error: canComplete.reason || 'Requirements not met',
                completed: false,
                current_progress: canComplete.current_progress || 0,
                required: challenge.requirement_value
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Complete the challenge
        const { generateId } = await import('../../utils/id-generator.js');
        const completionId = generateId('generic');

        // Insert or update completion record
        if (existingCompletion) {
            await env.DB.prepare(`
                UPDATE user_daily_challenges 
                SET is_completed = 1, points_earned = ?, completed_at = datetime('now'),
                    progress_count = ?
                WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
            `).bind(challenge.points_reward, challenge.requirement_value, userId, challenge_id, today).run();
        } else {
            await env.DB.prepare(`
                INSERT INTO user_daily_challenges 
                (id, user_id, challenge_id, challenge_date, is_completed, points_earned, progress_count, completed_at)
                VALUES (?, ?, ?, ?, 1, ?, ?, datetime('now'))
            `).bind(completionId, userId, challenge_id, today, challenge.points_reward, challenge.requirement_value).run();
        }

        // Award points to user
        await env.DB.prepare(`
            UPDATE users SET points = points + ? WHERE id = ?
        `).bind(challenge.points_reward, userId).run();

        // Check and award achievements for challenge completion
        try {
            const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
            const newAchievements = await checkAndAwardAchievements(userId, 'challenge_completion', {
                challenge_id: challenge_id,
                points_earned: challenge.points_reward,
                challenge_type: challenge.requirement_type
            }, env);
        } catch (achievementError) {
            console.error('Achievement check error:', achievementError);
            // Don't fail the challenge completion if achievements fail
        }

        return new Response(JSON.stringify({
            message: `Challenge "${challenge.name}" completed successfully!`,
            completed: true,
            points_earned: challenge.points_reward,
            challenge: {
                id: challenge.id,
                name: challenge.name,
                description: challenge.description,
                points_reward: challenge.points_reward
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Complete daily challenge error:', error);
        return new Response(JSON.stringify({ error: 'Failed to complete challenge' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Check if user meets the requirements for a specific challenge
async function checkChallengeRequirements(userId, challenge, env) {
    const today = new Date().toISOString().split('T')[0];
    const requirementType = challenge.requirement_type;
    const requirementValue = challenge.requirement_value;

    try {
        switch (requirementType) {
            case 'habits':
                // Count habits completed today
                const habitsCount = await env.DB.prepare(`
                    SELECT COUNT(DISTINCT habit_id) as count 
                    FROM habit_completions 
                    WHERE user_id = ? AND date(created_at) = date(?)
                `).bind(userId, today).first();
                
                const currentHabits = habitsCount?.count || 0;
                return {
                    eligible: currentHabits >= requirementValue,
                    current_progress: currentHabits,
                    reason: currentHabits < requirementValue ? 
                        `Complete ${requirementValue - currentHabits} more habits today` : null
                };

            case 'nutrition':
                // Count nutrition logs today
                const nutritionCount = await env.DB.prepare(`
                    SELECT COUNT(*) as count 
                    FROM user_nutrition_logs 
                    WHERE user_id = ? AND date(created_at) = date(?)
                `).bind(userId, today).first();
                
                const currentNutrition = nutritionCount?.count || 0;
                return {
                    eligible: currentNutrition >= requirementValue,
                    current_progress: currentNutrition,
                    reason: currentNutrition < requirementValue ? 
                        `Log ${requirementValue - currentNutrition} more meals today` : null
                };

            case 'media':
                // Count media uploads today  
                const mediaCount = await env.DB.prepare(`
                    SELECT COUNT(*) as count 
                    FROM media_uploads 
                    WHERE user_id = ? AND date(uploaded_at) = date(?)
                `).bind(userId, today).first();
                
                const currentMedia = mediaCount?.count || 0;
                return {
                    eligible: currentMedia >= requirementValue,
                    current_progress: currentMedia,
                    reason: currentMedia < requirementValue ? 
                        `Upload ${requirementValue - currentMedia} more photos/videos today` : null
                };

            case 'videos':
                // Count video uploads today
                const videoCount = await env.DB.prepare(`
                    SELECT COUNT(*) as count 
                    FROM media_uploads 
                    WHERE user_id = ? AND date(uploaded_at) = date(?) AND file_type LIKE 'video/%'
                `).bind(userId, today).first();
                
                const currentVideos = videoCount?.count || 0;
                return {
                    eligible: currentVideos >= requirementValue,
                    current_progress: currentVideos,
                    reason: currentVideos < requirementValue ? 
                        `Upload ${requirementValue - currentVideos} more videos today` : null
                };

            case 'points':
                // Check points earned today
                const pointsToday = await env.DB.prepare(`
                    SELECT COALESCE(SUM(points), 0) as points
                    FROM (
                        SELECT points FROM habit_completions WHERE user_id = ? AND date(created_at) = date(?)
                        UNION ALL
                        SELECT points_earned as points FROM user_nutrition_logs WHERE user_id = ? AND date(created_at) = date(?)
                        UNION ALL
                        SELECT points FROM media_uploads WHERE user_id = ? AND date(uploaded_at) = date(?)
                        UNION ALL
                        SELECT points_earned as points FROM user_daily_challenges WHERE user_id = ? AND challenge_date = ? AND is_completed = 1
                    )
                `).bind(userId, today, userId, today, userId, today, userId, today).first();
                
                const currentPoints = pointsToday?.points || 0;
                return {
                    eligible: currentPoints >= requirementValue,
                    current_progress: currentPoints,
                    reason: currentPoints < requirementValue ? 
                        `Earn ${requirementValue - currentPoints} more points today` : null
                };

            case 'hydration':
                // Count water logs today (assuming stored in nutrition logs)
                const waterCount = await env.DB.prepare(`
                    SELECT COALESCE(SUM(water_ml), 0) / 250 as glasses
                    FROM user_nutrition_logs 
                    WHERE user_id = ? AND date(created_at) = date(?) AND water_ml > 0
                `).bind(userId, today).first();
                
                const currentGlasses = Math.floor(waterCount?.glasses || 0);
                return {
                    eligible: currentGlasses >= requirementValue,
                    current_progress: currentGlasses,
                    reason: currentGlasses < requirementValue ? 
                        `Drink ${requirementValue - currentGlasses} more glasses of water today` : null
                };

            case 'streaks':
                // Check if user logged in today (maintaining streak)
                return {
                    eligible: true, // If they're making the request, they're logged in
                    current_progress: 1,
                    reason: null
                };

            case 'weekly_progress':
                // Check percentage of weekly habits completed
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekStartStr = weekStart.toISOString().split('T')[0];

                const weeklyProgress = await env.DB.prepare(`
                    SELECT 
                        COUNT(DISTINCT h.id) as total_habits,
                        COUNT(DISTINCT hc.habit_id) as completed_habits
                    FROM habits h
                    LEFT JOIN habit_completions hc ON h.id = hc.habit_id 
                        AND date(hc.created_at) >= date(?)
                    WHERE h.user_id = ?
                `).bind(weekStartStr, userId).first();

                const totalHabits = weeklyProgress?.total_habits || 0;
                const completedHabits = weeklyProgress?.completed_habits || 0;
                const progressPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
                
                return {
                    eligible: progressPercentage >= requirementValue,
                    current_progress: Math.round(progressPercentage),
                    reason: progressPercentage < requirementValue ? 
                        `Complete more habits this week (currently ${Math.round(progressPercentage)}%)` : null
                };

            default:
                // Unknown requirement type - allow completion
                return {
                    eligible: true,
                    current_progress: requirementValue,
                    reason: null
                };
        }
    } catch (error) {
        console.error('Error checking challenge requirements:', error);
        console.error('Challenge details:', { 
            userId, 
            challengeId: challenge?.id, 
            requirementType, 
            requirementValue, 
            today 
        });
        return {
            eligible: false,
            current_progress: 0,
            reason: `Error validating requirements: ${error.message}`
        };
    }
}