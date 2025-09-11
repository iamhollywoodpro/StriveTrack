// Weekly habit tracking endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

// Get weekly completions for a specific week
export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const url = new URL(request.url);
        const weekStart = url.searchParams.get('weekStart') || getCurrentWeekStart();
        
        // Get all habits for user with their weekly completions
        const habitsResult = await env.DB.prepare(`
            SELECT h.*, h.weekly_target
            FROM habits h
            WHERE h.user_id = ?
            ORDER BY h.created_at DESC
        `).bind(user.id).all();
        
        const habits = habitsResult.results || [];
        
        // Get weekly completions for this week
        const completionsResult = await env.DB.prepare(`
            SELECT * FROM weekly_habit_completions
            WHERE user_id = ? AND week_start_date = ?
        `).bind(user.id, weekStart).all();
        
        const completions = completionsResult.results || [];
        
        // Combine habits with their weekly completions
        const habitsWithWeekly = habits.map(habit => {
            const weekCompletions = completions.filter(c => c.habit_id === habit.id);
            const completedDays = weekCompletions.map(c => c.day_of_week);
            
            return {
                ...habit,
                weekStart,
                completedDays,
                weekCompletions: weekCompletions,
                completedCount: completedDays.length,
                targetCount: habit.weekly_target || 7
            };
        });
        
        return new Response(JSON.stringify({ 
            habits: habitsWithWeekly,
            weekStart,
            weekEnd: getWeekEnd(weekStart)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get weekly habits error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Toggle completion for a specific day
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const body = await request.json();
        const { habitId, date, dayOfWeek } = body;
        
        if (!habitId || !date || dayOfWeek === undefined) {
            return new Response(JSON.stringify({ 
                error: 'Habit ID, date, and dayOfWeek are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Verify habit belongs to user
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
        
        const weekStart = getWeekStartFromDate(date);
        
        // Check if completion already exists
        const existing = await env.DB.prepare(`
            SELECT id FROM weekly_habit_completions 
            WHERE habit_id = ? AND completion_date = ?
        `).bind(habitId, date).first();
        
        if (existing) {
            // Remove completion (toggle off) and deduct points
            await env.DB.prepare(`
                DELETE FROM weekly_habit_completions WHERE id = ?
            `).bind(existing.id).run();
            
            // Deduct points for removing completion (anti-cheat penalty)
            await env.DB.prepare('UPDATE users SET points = points - 5 WHERE id = ?')
                .bind(user.id).run();
            
            return new Response(JSON.stringify({
                message: 'Completion removed',
                completed: false,
                points: -5
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Add completion (toggle on)
            const { generateId } = await import('../../utils/id-generator.js');
            const completionId = generateId();
            
            await env.DB.prepare(`
                INSERT INTO weekly_habit_completions 
                (id, habit_id, user_id, completion_date, day_of_week, week_start_date)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(completionId, habitId, user.id, date, dayOfWeek, weekStart).run();
            
            // Award points for completion
            await env.DB.prepare('UPDATE users SET points = points + 10 WHERE id = ?')
                .bind(user.id).run();
            
            return new Response(JSON.stringify({
                message: 'Completion added',
                completed: true,
                points: 10
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
    } catch (error) {
        console.error('Toggle weekly completion error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function getCurrentWeekStart() {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    return sunday.toISOString().split('T')[0];
}

function getWeekStartFromDate(dateStr) {
    const date = new Date(dateStr);
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    return sunday.toISOString().split('T')[0];
}

function getWeekEnd(weekStartStr) {
    const weekStart = new Date(weekStartStr);
    const saturday = new Date(weekStart);
    saturday.setDate(weekStart.getDate() + 6);
    return saturday.toISOString().split('T')[0];
}