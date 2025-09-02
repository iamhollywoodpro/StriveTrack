import { checkAndAwardAchievements } from '../../utils/achievements.js';
import { updateStreak, updateDailyChallengeProgress } from '../../utils/streaks.js';

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
        const { trigger } = await request.json();

        // Update streaks based on trigger
        const streakResults = [];
        if (trigger === 'login') {
            const loginStreak = await updateStreak(env.DB, userId, 'daily_login');
            if (loginStreak) {
                streakResults.push({ type: 'daily_login', ...loginStreak });
            }
        } else if (trigger === 'habit_completion') {
            const habitStreak = await updateStreak(env.DB, userId, 'habit_completion');
            if (habitStreak) {
                streakResults.push({ type: 'habit_completion', ...habitStreak });
            }
            
            // Update daily challenges for habit completion
            await updateDailyChallengeProgress(env.DB, userId, 'habits', 1);
        } else if (trigger === 'media_upload') {
            // Update daily challenges for media upload
            await updateDailyChallengeProgress(env.DB, userId, 'media', 1);
        } else if (trigger === 'video_upload') {
            // Update daily challenges for video upload
            await updateDailyChallengeProgress(env.DB, userId, 'media', 1);
        } else if (trigger === 'nutrition_log') {
            // Update daily challenges for nutrition logging
            await updateDailyChallengeProgress(env.DB, userId, 'nutrition', 1);
        }

        // Track achievements and get results
        const achievementResults = await checkAndAwardAchievements(userId, trigger, {}, env);

        // Get achievements that are close to completion for progress hints
        const progressHints = await env.DB.prepare(`
            SELECT 
                a.*,
                uap.progress_count as current_progress,
                CASE 
                    WHEN uap.progress_count >= a.requirement_value * 0.8 
                    AND uap.progress_count < a.requirement_value 
                    THEN 1 
                    ELSE 0 
                END as show_hint
            FROM achievements a
            LEFT JOIN user_achievement_progress uap ON a.id = uap.achievement_id AND uap.user_id = ?
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL 
            AND uap.progress_count >= a.requirement_value * 0.8
            AND uap.progress_count < a.requirement_value
            LIMIT 2
        `).bind(userId, userId).all();

        const hints = progressHints.results?.map(hint => ({
            achievement: {
                id: hint.id,
                name: hint.name,
                description: hint.description,
                icon: hint.icon,
                difficulty: hint.difficulty
            },
            current_progress: hint.current_progress,
            required_progress: hint.requirement_value
        })) || [];

        return new Response(JSON.stringify({
            unlocked_achievements: achievementResults.unlocked || [],
            progress_hints: hints,
            total_points_earned: achievementResults.points_earned || 0,
            streaks: streakResults
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Achievement check error:', error);
        return new Response(JSON.stringify({ error: 'Failed to check achievements' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}