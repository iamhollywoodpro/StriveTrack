// Individual goal management endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const goalId = params.id;
        
        // Get specific goal
        const goal = await env.DB.prepare(`
            SELECT * FROM goals 
            WHERE id = ? AND user_id = ?
        `).bind(goalId, user.id).first();
        
        if (!goal) {
            return new Response(JSON.stringify({ 
                error: 'Goal not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ goal }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get goal error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const goalId = params.id;
        const body = await request.json();
        
        // Verify goal belongs to user
        const existingGoal = await env.DB.prepare(
            'SELECT id FROM goals WHERE id = ? AND user_id = ?'
        ).bind(goalId, user.id).first();
        
        if (!existingGoal) {
            return new Response(JSON.stringify({ 
                error: 'Goal not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const { 
            name, 
            description, 
            category, 
            target_value, 
            current_value, 
            unit, 
            status, 
            deadline 
        } = body;
        
        // Calculate progress percentage
        let progress_percentage = 0;
        if (target_value > 0 && current_value >= 0) {
            progress_percentage = Math.min(100, Math.round((current_value / target_value) * 100));
        }
        
        // Update goal
        await env.DB.prepare(`
            UPDATE goals SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                category = COALESCE(?, category),
                target_value = COALESCE(?, target_value),
                current_value = COALESCE(?, current_value),
                unit = COALESCE(?, unit),
                status = COALESCE(?, status),
                progress_percentage = ?,
                deadline = COALESCE(?, deadline),
                updated_at = ?
            WHERE id = ? AND user_id = ?
        `).bind(
            name,
            description,
            category,
            target_value,
            current_value,
            unit,
            status,
            progress_percentage,
            deadline,
            new Date().toISOString(),
            goalId,
            user.id
        ).run();
        
        return new Response(JSON.stringify({
            message: 'Goal updated successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Update goal error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const goalId = params.id;
        
        // Verify goal belongs to user
        const existingGoal = await env.DB.prepare(
            'SELECT id FROM goals WHERE id = ? AND user_id = ?'
        ).bind(goalId, user.id).first();
        
        if (!existingGoal) {
            return new Response(JSON.stringify({ 
                error: 'Goal not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Delete goal
        await env.DB.prepare(
            'DELETE FROM goals WHERE id = ? AND user_id = ?'
        ).bind(goalId, user.id).run();
        
        return new Response(JSON.stringify({
            message: 'Goal deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Delete goal error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}