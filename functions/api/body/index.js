// Body tracking endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';
import { generateId } from '../../utils/id-generator.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const {
            weight_lbs,
            height_inches,
            body_fat_percent,
            muscle_mass_percent,
            notes,
            log_date
        } = await request.json();
        
        if (!weight_lbs || !height_inches) {
            return new Response(JSON.stringify({ 
                error: 'Weight (lbs) and height (inches) are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const today = log_date || new Date().toISOString().split('T')[0];
        const logId = generateId();
        
        // Calculate BMI
        const bmi = (weight_lbs / (height_inches * height_inches)) * 703;
        
        // Insert body log entry
        await env.DB.prepare(`
            INSERT OR REPLACE INTO user_body_logs (
                id, user_id, log_date, weight_lbs, height_inches,
                body_fat_percent, muscle_mass_percent, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            logId, user.id, today, weight_lbs, height_inches,
            body_fat_percent || null, muscle_mass_percent || null, notes || null
        ).run();
        
        // Award points for body tracking
        const pointsEarned = 10;
        await env.DB.prepare(
            'UPDATE users SET points = points + ?, weekly_points = weekly_points + ? WHERE id = ?'
        ).bind(pointsEarned, pointsEarned, user.id).run();
        
        return new Response(JSON.stringify({
            message: 'Body metrics logged successfully!',
            log_id: logId,
            bmi: Math.round(bmi * 100) / 100,
            points_earned: pointsEarned,
            date: today
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Body tracking error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit')) || 30;
        
        // Get recent body logs
        const logs = await env.DB.prepare(`
            SELECT *, 
                   ROUND((weight_lbs / (height_inches * height_inches)) * 703, 2) as calculated_bmi
            FROM user_body_logs 
            WHERE user_id = ?
            ORDER BY log_date DESC
            LIMIT ?
        `).bind(user.id, limit).all();
        
        // Get latest entry for current stats
        const latest = logs.results?.[0] || null;
        
        // Calculate weight change if we have multiple entries
        let weight_change = null;
        if (logs.results && logs.results.length >= 2) {
            const currentWeight = logs.results[0].weight_lbs;
            const previousWeight = logs.results[1].weight_lbs;
            weight_change = Math.round((currentWeight - previousWeight) * 100) / 100;
        }
        
        return new Response(JSON.stringify({
            logs: logs.results || [],
            latest_entry: latest,
            weight_change_lbs: weight_change,
            total_entries: logs.results?.length || 0
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get body tracking error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}