// Habits management endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';
import { getUserHabits, createHabit, checkAndAwardAchievements } from '../../utils/database.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const habits = await getUserHabits(user.id, env);
        
        return new Response(JSON.stringify({ habits }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get habits error:', error);
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
        const { name, description, target_frequency, color, weekly_target } = body;
        
        if (!name || name.trim() === '') {
            return new Response(JSON.stringify({ 
                error: 'Habit name is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const habitData = {
            user_id: user.id,
            name: name.trim(),
            description: description?.trim() || '',
            target_frequency: target_frequency || 1,
            color: color || '#667eea',
            weekly_target: weekly_target || 7
        };
        
        const habitId = await createHabit(habitData, env);
        
        // Get the created habit to return full object
        const createdHabit = await env.DB.prepare(
            'SELECT * FROM habits WHERE id = ?'
        ).bind(habitId).first();
        
        // Check and award achievements
        let newAchievements = [];
        try {
            const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
            newAchievements = await checkAndAwardAchievements(user.id, 'habit_creation', { 
                habit_name: name.trim(),
                weekly_target: habitData.weekly_target 
            }, env);
        } catch (achievementError) {
            console.error('Achievement check error:', achievementError);
            // Don't fail the habit creation if achievements fail
        }
        
        return new Response(JSON.stringify({
            message: 'Habit created successfully',
            id: habitId,
            habit: createdHabit,
            newAchievements
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Create habit error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}