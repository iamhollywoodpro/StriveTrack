// Habit toggle completion endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const body = await request.json();
        const { habit_id, date } = body;
        
        if (!habit_id || !date) {
            return new Response(JSON.stringify({ 
                error: 'Habit ID and date are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Verify the habit belongs to the user
        const habit = await env.DB.prepare(
            'SELECT id, name FROM habits WHERE id = ? AND user_id = ?'
        ).bind(habit_id, user.id).first();
        
        if (!habit) {
            return new Response(JSON.stringify({ 
                error: 'Habit not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if completion already exists for this date
        const existingCompletion = await env.DB.prepare(
            'SELECT id FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completion_date = ?'
        ).bind(habit_id, user.id, date).first();
        
        let completed = false;
        let points = 0;
        
        if (existingCompletion) {
            // Remove completion
            await env.DB.prepare(
                'DELETE FROM habit_completions WHERE id = ?'
            ).bind(existingCompletion.id).run();
            completed = false;
        } else {
            // Add completion
            const completionId = crypto.randomUUID();
            await env.DB.prepare(
                'INSERT INTO habit_completions (id, habit_id, user_id, completion_date, created_at) VALUES (?, ?, ?, ?, ?)'
            ).bind(
                completionId, 
                habit_id, 
                user.id, 
                date, 
                new Date().toISOString()
            ).run();
            
            completed = true;
            points = 10; // Award points for completion
            
            // Update user points
            await env.DB.prepare(
                'UPDATE users SET points = points + ? WHERE id = ?'
            ).bind(points, user.id).run();
        }
        
        // Check for achievements if completed
        if (completed) {
            try {
                const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
                await checkAndAwardAchievements(user.id, 'habit_completion', {
                    habitId: habit_id,
                    habitName: habit.name,
                    date,
                    time: new Date().toISOString()
                }, env);
            } catch (error) {
                console.error('Achievement check error:', error);
                // Don't fail the request if achievement check fails
            }
        }
        
        return new Response(JSON.stringify({
            completed,
            points,
            message: completed ? `Habit completed! +${points} points` : 'Habit completion removed'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Toggle habit error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}