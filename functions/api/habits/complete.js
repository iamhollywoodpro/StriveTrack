// Habit completion endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';
import { markHabitComplete, checkAndAwardAchievements } from '../../utils/database.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const body = await request.json();
        const { habitId, notes } = body;
        
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
                error: 'Habit not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const result = await markHabitComplete(habitId, user.id, notes, env);
        
        if (result.error) {
            return new Response(JSON.stringify({ 
                error: result.error 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check and award achievements
        const newAchievements = await checkAndAwardAchievements(user.id, env);
        
        return new Response(JSON.stringify({
            message: 'Habit completed successfully',
            points: result.points,
            newAchievements
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Complete habit error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}