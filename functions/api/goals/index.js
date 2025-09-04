// Goals API endpoints - CRUD operations for goal management
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
        const url = new URL(request.url);
        const filter = url.searchParams.get('filter') || 'active'; // active, completed, all
        const category = url.searchParams.get('category');

        // Build WHERE clause based on filters
        let whereClause = 'WHERE g.user_id = ?';
        let params = [userId];
        
        if (filter === 'active') {
            whereClause += ' AND g.status = ?';
            params.push('active');
        } else if (filter === 'completed') {
            whereClause += ' AND g.status = ?';
            params.push('completed');
        }
        
        if (category) {
            whereClause += ' AND g.category = ?';
            params.push(category);
        }

        // Get goals with category information and progress
        const goals = await env.DB.prepare(`
            SELECT 
                g.*,
                gc.name as category_name,
                gc.icon as category_icon,
                gc.color_code as category_color,
                COUNT(gm.id) as total_milestones,
                COUNT(CASE WHEN gm.is_completed = 1 THEN 1 END) as completed_milestones
            FROM user_goals g
            LEFT JOIN goal_categories gc ON g.category = gc.id
            LEFT JOIN goal_milestones gm ON g.id = gm.goal_id
            ${whereClause}
            GROUP BY g.id
            ORDER BY 
                CASE g.status 
                    WHEN 'active' THEN 1
                    WHEN 'paused' THEN 2
                    WHEN 'completed' THEN 3
                    ELSE 4
                END,
                CASE g.priority 
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                g.target_date ASC,
                g.created_at DESC
        `).bind(...params).all();

        // Get goal categories for filtering
        const categories = await env.DB.prepare(`
            SELECT * FROM goal_categories WHERE is_active = 1 ORDER BY name
        `).all();

        // Calculate goal statistics
        const stats = await env.DB.prepare(`
            SELECT 
                COUNT(*) as total_goals,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_goals,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals,
                COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_goals,
                AVG(CASE WHEN status = 'completed' THEN progress_percentage END) as avg_completion_rate,
                COUNT(CASE WHEN target_date < date('now') AND status = 'active' THEN 1 END) as overdue_goals
            FROM user_goals 
            WHERE user_id = ?
        `).bind(userId).first();

        return new Response(JSON.stringify({
            goals: goals.results || [],
            categories: categories.results || [],
            stats: stats || {}
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goals fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load goals' }), {
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
        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.category || !data.start_date) {
            return new Response(JSON.stringify({ 
                error: 'Title, category, and start date are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new goal
        const { v4: uuidv4 } = await import('uuid');
        const goalId = uuidv4();

        await env.DB.prepare(`
            INSERT INTO user_goals (
                id, user_id, title, description, goal_type, category, priority, 
                target_value, target_unit, start_date, target_date, 
                motivation_reason, reward_description, is_public, share_progress
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            goalId,
            userId,
            data.title,
            data.description || null,
            data.goal_type || 'custom',
            data.category,
            data.priority || 'medium',
            data.target_value || null,
            data.target_unit || null,
            data.start_date,
            data.target_date || null,
            data.motivation_reason || null,
            data.reward_description || null,
            data.is_public ? 1 : 0,
            data.share_progress ? 1 : 0
        ).run();

        // Create default milestones if target value is provided
        if (data.target_value) {
            const milestones = [25, 50, 75, 100];
            for (const percentage of milestones) {
                const milestoneId = uuidv4();
                await env.DB.prepare(`
                    INSERT INTO goal_milestones (
                        id, goal_id, title, target_percentage, reward_points
                    ) VALUES (?, ?, ?, ?, ?)
                `).bind(
                    milestoneId,
                    goalId,
                    `${percentage}% Complete`,
                    percentage,
                    percentage === 100 ? 100 : Math.floor(percentage / 4) // 25pts for 25%, 50pts for 50%, etc.
                ).run();
            }
        }

        // Check for goal-related achievements
        try {
            const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
            await checkAndAwardAchievements(userId, 'goal_created', {
                goal_id: goalId,
                category: data.category,
                goal_type: data.goal_type
            }, env);
        } catch (achievementError) {
            console.error('Goal achievement check error:', achievementError);
        }

        return new Response(JSON.stringify({
            message: 'Goal created successfully!',
            goal_id: goalId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goal creation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create goal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut({ request, env }) {
    try {
        const url = new URL(request.url);
        const goalId = url.pathname.split('/').pop();
        
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

        // Verify goal ownership
        const goal = await env.DB.prepare(`
            SELECT * FROM user_goals WHERE id = ? AND user_id = ?
        `).bind(goalId, userId).first();

        if (!goal) {
            return new Response(JSON.stringify({ error: 'Goal not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update goal
        await env.DB.prepare(`
            UPDATE user_goals SET
                title = ?, description = ?, priority = ?, target_value = ?, 
                target_unit = ?, target_date = ?, motivation_reason = ?, 
                reward_description = ?, status = ?, updated_at = datetime('now')
            WHERE id = ? AND user_id = ?
        `).bind(
            data.title || goal.title,
            data.description !== undefined ? data.description : goal.description,
            data.priority || goal.priority,
            data.target_value !== undefined ? data.target_value : goal.target_value,
            data.target_unit || goal.target_unit,
            data.target_date !== undefined ? data.target_date : goal.target_date,
            data.motivation_reason !== undefined ? data.motivation_reason : goal.motivation_reason,
            data.reward_description !== undefined ? data.reward_description : goal.reward_description,
            data.status || goal.status,
            goalId,
            userId
        ).run();

        return new Response(JSON.stringify({
            message: 'Goal updated successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goal update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update goal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete({ request, env }) {
    try {
        const url = new URL(request.url);
        const goalId = url.pathname.split('/').pop();
        
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

        // Verify goal ownership before deletion
        const goal = await env.DB.prepare(`
            SELECT * FROM user_goals WHERE id = ? AND user_id = ?
        `).bind(goalId, userId).first();

        if (!goal) {
            return new Response(JSON.stringify({ error: 'Goal not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete related records first (cascade delete)
        await env.DB.prepare(`DELETE FROM goal_progress_logs WHERE goal_id = ?`).bind(goalId).run();
        await env.DB.prepare(`DELETE FROM goal_milestones WHERE goal_id = ?`).bind(goalId).run();
        
        // Delete the goal
        await env.DB.prepare(`DELETE FROM user_goals WHERE id = ? AND user_id = ?`).bind(goalId, userId).run();

        return new Response(JSON.stringify({
            message: 'Goal deleted successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goal deletion error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete goal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}