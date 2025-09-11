// Habit deletion endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const habitId = params.id;
        
        if (!habitId) {
            return new Response(JSON.stringify({ 
                error: 'Habit ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Verify the habit belongs to the user
        const habit = await env.DB.prepare(
            'SELECT id FROM habits WHERE id = ? AND user_id = ?'
        ).bind(habitId, user.id).first();
        
        if (!habit) {
            return new Response(JSON.stringify({ 
                error: 'Habit not found or you do not have permission to delete it' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Delete habit completions first (foreign key constraint)
        await env.DB.prepare('DELETE FROM habit_completions WHERE habit_id = ?')
            .bind(habitId).run();
            
        // Also delete weekly habit completions
        await env.DB.prepare('DELETE FROM weekly_habit_completions WHERE habit_id = ?')
            .bind(habitId).run();
            
        // Delete the habit
        await env.DB.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?')
            .bind(habitId, user.id).run();
        
        return new Response(JSON.stringify({
            message: 'Habit deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Delete habit error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}