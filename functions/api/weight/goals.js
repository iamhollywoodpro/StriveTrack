// Weight goals API endpoints
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

        // Get all weight goals
        const goals = await env.DB.prepare(`
            SELECT * FROM user_weight_goals 
            WHERE user_id = ? 
            ORDER BY is_active DESC, created_at DESC
        `).bind(userId).all();

        return new Response(JSON.stringify({
            goals: goals.results || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Weight goals fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load weight goals' }), {
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
        if (!data.goal_type || !data.target_weight_kg || !data.current_weight_kg) {
            return new Response(JSON.stringify({ 
                error: 'Goal type, current weight, and target weight are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Deactivate any existing active goals
        await env.DB.prepare(`
            UPDATE user_weight_goals 
            SET is_active = 0, updated_at = datetime('now')
            WHERE user_id = ? AND is_active = 1
        `).bind(userId).run();

        // Create new weight goal
        const { v4: uuidv4 } = await import('uuid');
        const goalId = uuidv4();

        // Calculate weekly goal if target date is provided
        let weeklyGoalKg = null;
        if (data.target_date) {
            const targetDate = new Date(data.target_date);
            const currentDate = new Date();
            const weeksUntilTarget = Math.ceil((targetDate - currentDate) / (7 * 24 * 60 * 60 * 1000));
            
            if (weeksUntilTarget > 0) {
                const totalWeightChange = Math.abs(data.target_weight_kg - data.current_weight_kg);
                weeklyGoalKg = Math.round((totalWeightChange / weeksUntilTarget) * 100) / 100;
            }
        }

        await env.DB.prepare(`
            INSERT INTO user_weight_goals (
                id, user_id, goal_type, current_weight_kg, target_weight_kg, 
                target_date, weekly_goal_kg, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).bind(
            goalId,
            userId,
            data.goal_type,
            data.current_weight_kg,
            data.target_weight_kg,
            data.target_date || null,
            weeklyGoalKg
        ).run();

        return new Response(JSON.stringify({
            message: 'Weight goal set successfully!',
            goal_id: goalId,
            weekly_goal_kg: weeklyGoalKg
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Weight goal creation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create weight goal' }), {
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

        // Update weight goal
        await env.DB.prepare(`
            UPDATE user_weight_goals 
            SET target_weight_kg = ?, target_date = ?, updated_at = datetime('now')
            WHERE id = ? AND user_id = ?
        `).bind(data.target_weight_kg, data.target_date, goalId, userId).run();

        return new Response(JSON.stringify({
            message: 'Weight goal updated successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Weight goal update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update weight goal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}