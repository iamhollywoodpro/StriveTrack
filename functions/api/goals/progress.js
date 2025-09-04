// Goal Progress API - Track and update goal progress
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
        const data = await request.json();

        if (!data.goal_id || data.progress_value === undefined) {
            return new Response(JSON.stringify({ 
                error: 'Goal ID and progress value are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get goal details
        const goal = await env.DB.prepare(`
            SELECT * FROM user_goals WHERE id = ? AND user_id = ?
        `).bind(data.goal_id, userId).first();

        if (!goal) {
            return new Response(JSON.stringify({ error: 'Goal not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Calculate progress percentage
        let progressPercentage = data.progress_percentage;
        if (goal.target_value && progressPercentage === undefined) {
            progressPercentage = Math.min((data.progress_value / goal.target_value) * 100, 100);
        }
        progressPercentage = progressPercentage || 0;

        // Create progress log entry
        const { generateId } = await import('../../utils/id-generator.js');
        const progressId = generateId('generic');
        const today = new Date().toISOString().split('T')[0];

        await env.DB.prepare(`
            INSERT INTO goal_progress_logs (
                id, goal_id, user_id, progress_value, progress_percentage, notes, logged_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            progressId,
            data.goal_id,
            userId,
            data.progress_value,
            progressPercentage,
            data.notes || null,
            today
        ).run();

        // Update goal's current progress
        await env.DB.prepare(`
            UPDATE user_goals SET
                current_value = ?, 
                progress_percentage = ?,
                updated_at = datetime('now')
            WHERE id = ? AND user_id = ?
        `).bind(data.progress_value, progressPercentage, data.goal_id, userId).run();

        // Check for milestone completions
        const newMilestones = await checkAndCompleteMilestones(data.goal_id, progressPercentage, env);

        // Check if goal is completed
        let goalCompleted = false;
        if (progressPercentage >= 100) {
            await env.DB.prepare(`
                UPDATE user_goals SET
                    status = 'completed',
                    completed_date = date('now'),
                    updated_at = datetime('now')
                WHERE id = ? AND user_id = ?
            `).bind(data.goal_id, userId).run();
            goalCompleted = true;

            // Check for goal completion achievements
            try {
                const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
                await checkAndAwardAchievements(userId, 'goal_completed', {
                    goal_id: data.goal_id,
                    category: goal.category,
                    completion_date: new Date().toISOString(),
                    target_date: goal.target_date
                }, env);
            } catch (achievementError) {
                console.error('Goal completion achievement error:', achievementError);
            }
        }

        return new Response(JSON.stringify({
            message: goalCompleted ? 'Congratulations! Goal completed!' : 'Progress updated successfully!',
            progress_id: progressId,
            goal_completed: goalCompleted,
            new_milestones: newMilestones,
            current_percentage: progressPercentage
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goal progress update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update goal progress' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const goalId = url.searchParams.get('goal_id');
        
        if (!goalId) {
            return new Response(JSON.stringify({ error: 'Goal ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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

        // Get progress logs for the goal
        const progressLogs = await env.DB.prepare(`
            SELECT * FROM goal_progress_logs 
            WHERE goal_id = ? AND user_id = ?
            ORDER BY logged_date DESC, created_at DESC
            LIMIT 50
        `).bind(goalId, userId).all();

        // Get milestones for the goal
        const milestones = await env.DB.prepare(`
            SELECT * FROM goal_milestones 
            WHERE goal_id = ?
            ORDER BY target_percentage ASC
        `).bind(goalId).all();

        return new Response(JSON.stringify({
            progress_logs: progressLogs.results || [],
            milestones: milestones.results || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goal progress fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load goal progress' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to check and complete milestones
async function checkAndCompleteMilestones(goalId, currentPercentage, env) {
    try {
        const completedMilestones = [];
        
        // Get uncompleted milestones that should now be completed
        const milestones = await env.DB.prepare(`
            SELECT * FROM goal_milestones 
            WHERE goal_id = ? AND is_completed = 0 AND target_percentage <= ?
            ORDER BY target_percentage ASC
        `).bind(goalId, currentPercentage).all();

        for (const milestone of (milestones.results || [])) {
            // Mark milestone as completed
            await env.DB.prepare(`
                UPDATE goal_milestones SET
                    is_completed = 1,
                    completed_date = date('now')
                WHERE id = ?
            `).bind(milestone.id).run();

            completedMilestones.push({
                id: milestone.id,
                title: milestone.title,
                percentage: milestone.target_percentage,
                points: milestone.reward_points
            });

            // Award milestone points to user if specified
            if (milestone.reward_points > 0) {
                // Get user_id from goal
                const goal = await env.DB.prepare(`
                    SELECT user_id FROM user_goals WHERE id = ?
                `).bind(goalId).first();

                if (goal) {
                    await env.DB.prepare(`
                        UPDATE users SET points = points + ? WHERE id = ?
                    `).bind(milestone.reward_points, goal.user_id).run();
                }
            }
        }

        return completedMilestones;
    } catch (error) {
        console.error('Error checking milestones:', error);
        return [];
    }
}