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
        console.log('🔍 Checking existing completion for:', { habit_id, user_id: user.id, date });
        
        // Use more robust date range check instead of DATE() function
        const dateStart = `${date} 00:00:00`;
        const dateEnd = `${date} 23:59:59`;
        
        const existingCompletion = await env.DB.prepare(
            'SELECT id FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completed_at >= ? AND completed_at <= ?'
        ).bind(habit_id, user.id, dateStart, dateEnd).first();
        
        console.log('🔍 Existing completion result:', existingCompletion);
        
        let completed = false;
        let points = 0;
        
        if (existingCompletion) {
            // Remove completion - DEDUCT POINTS TO PREVENT CHEATING
            await env.DB.prepare(
                'DELETE FROM habit_completions WHERE id = ?'
            ).bind(existingCompletion.id).run();
            completed = false;
            points = -10; // Deduct points when unchecking
            
            // Update user points (deduct)
            await env.DB.prepare(
                'UPDATE users SET points = points + ? WHERE id = ?'
            ).bind(points, user.id).run();
        } else {
            // Add completion - use target date with current time for consistency
            const completionId = crypto.randomUUID();
            const now = new Date();
            const targetDate = new Date(date + 'T' + now.toTimeString().split(' ')[0]); // YYYY-MM-DD + current time
            const timestamp = targetDate.toISOString();
            
            console.log('💾 Inserting new completion:', { 
                completionId, 
                habit_id, 
                user_id: user.id, 
                completed_at: timestamp,
                target_date: date,
                parsed_target_date: targetDate
            });
            
            await env.DB.prepare(
                'INSERT INTO habit_completions (id, habit_id, user_id, completed_at, notes) VALUES (?, ?, ?, ?, ?)'
            ).bind(
                completionId, 
                habit_id, 
                user.id, 
                timestamp,
                null
            ).run();
            
            completed = true;
            points = 10; // Award points for completion
            
            console.log('✅ Completion inserted successfully');
            
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
            message: completed ? `Habit completed! +${points} points` : `Habit unchecked! ${points} points`
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