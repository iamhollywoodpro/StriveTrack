// Goals management endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        
        // Get all goals for user
        const goalsResult = await env.DB.prepare(`
            SELECT * FROM goals 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).bind(user.id).all();
        
        const goals = goalsResult.results || [];
        
        return new Response(JSON.stringify({ goals }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get goals error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const body = await request.json();
        const { 
            name, 
            description, 
            category, 
            target_value, 
            unit, 
            deadline 
        } = body;
        
        if (!name || name.trim() === '') {
            return new Response(JSON.stringify({ 
                error: 'Goal name is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (!target_value || target_value <= 0) {
            return new Response(JSON.stringify({ 
                error: 'Target value must be greater than 0' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate unique ID
        const { generateId } = await import('../../utils/id-generator.js');
        const goalId = generateId();
        
        // Create goal
        await env.DB.prepare(`
            INSERT INTO goals (
                id, user_id, name, description, category, 
                target_value, current_value, unit, status, 
                progress_percentage, deadline, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            goalId,
            user.id,
            name.trim(),
            description?.trim() || '',
            category || 'fitness',
            target_value,
            0, // current_value starts at 0
            unit || '',
            'active',
            0, // progress_percentage starts at 0
            deadline || null,
            new Date().toISOString()
        ).run();
        
        return new Response(JSON.stringify({
            message: 'Goal created successfully',
            goalId
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Create goal error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}