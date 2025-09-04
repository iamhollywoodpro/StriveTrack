// Weight tracking API endpoints
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

        // Get weight logs with BMI calculations
        const weightLogs = await env.DB.prepare(`
            SELECT 
                id,
                weight_kg,
                weight_lbs,
                bmi,
                body_fat_percentage,
                muscle_mass_kg,
                notes,
                logged_date,
                created_at
            FROM user_weight_logs 
            WHERE user_id = ? 
            ORDER BY logged_date DESC, created_at DESC
            LIMIT 50
        `).bind(userId).all();

        // Get current weight goal
        const currentGoal = await env.DB.prepare(`
            SELECT * FROM user_weight_goals 
            WHERE user_id = ? AND is_active = 1 
            ORDER BY created_at DESC 
            LIMIT 1
        `).bind(userId).first();

        // Get user's height and weight unit preference
        const userInfo = await env.DB.prepare(`
            SELECT height_cm, current_weight_kg, weight_unit 
            FROM users 
            WHERE id = ?
        `).bind(userId).first();

        // Calculate weight statistics
        const logs = weightLogs.results || [];
        let weightStats = {};
        
        if (logs.length > 0) {
            const currentWeight = logs[0].weight_kg;
            const startWeight = logs[logs.length - 1].weight_kg;
            const weightChange = currentWeight - startWeight;
            
            // Calculate average weight over last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentLogs = logs.filter(log => 
                new Date(log.logged_date) >= thirtyDaysAgo
            );
            const avgWeight = recentLogs.length > 0 
                ? recentLogs.reduce((sum, log) => sum + log.weight_kg, 0) / recentLogs.length
                : currentWeight;

            weightStats = {
                current_weight: currentWeight,
                start_weight: startWeight,
                weight_change: weightChange,
                avg_weight_30d: Math.round(avgWeight * 10) / 10,
                total_logs: logs.length,
                latest_bmi: logs[0].bmi || null,
                bmi_category: getBMICategory(logs[0].bmi)
            };
        }

        return new Response(JSON.stringify({
            weight_logs: logs,
            current_goal: currentGoal,
            user_info: userInfo,
            stats: weightStats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Weight tracking fetch error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load weight data' }), {
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
        if (!data.weight || !data.logged_date) {
            return new Response(JSON.stringify({ error: 'Weight and date are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user's height for BMI calculation
        const user = await env.DB.prepare(
            'SELECT height_cm, weight_unit FROM users WHERE id = ?'
        ).bind(userId).first();

        // Convert weight based on user's unit preference
        let weightKg, weightLbs;
        if (user?.weight_unit === 'lbs') {
            weightLbs = parseFloat(data.weight);
            weightKg = weightLbs * 0.453592; // Convert lbs to kg
        } else {
            weightKg = parseFloat(data.weight);
            weightLbs = weightKg * 2.20462; // Convert kg to lbs
        }

        // Calculate BMI if height is available
        let bmi = null;
        if (user?.height_cm) {
            const heightM = user.height_cm / 100;
            bmi = weightKg / (heightM * heightM);
            bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal place
        }

        // Create weight log entry
        const { v4: uuidv4 } = await import('uuid');
        const logId = uuidv4();

        await env.DB.prepare(`
            INSERT INTO user_weight_logs (
                id, user_id, weight_kg, weight_lbs, bmi, 
                body_fat_percentage, muscle_mass_kg, notes, logged_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            logId,
            userId,
            Math.round(weightKg * 100) / 100, // Round to 2 decimal places
            Math.round(weightLbs * 100) / 100,
            bmi,
            data.body_fat_percentage || null,
            data.muscle_mass_kg || null,
            data.notes || null,
            data.logged_date
        ).run();

        // Update user's current weight
        await env.DB.prepare(`
            UPDATE users SET current_weight_kg = ? WHERE id = ?
        `).bind(weightKg, userId).run();

        // Check for weight-related achievements
        try {
            const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
            await checkAndAwardAchievements(userId, 'weight_log', {
                weight_kg: weightKg,
                bmi: bmi,
                logged_date: data.logged_date
            }, env);
        } catch (achievementError) {
            console.error('Weight achievement check error:', achievementError);
        }

        return new Response(JSON.stringify({
            message: 'Weight logged successfully!',
            log_id: logId,
            calculated_bmi: bmi,
            bmi_category: getBMICategory(bmi)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Weight logging error:', error);
        return new Response(JSON.stringify({ error: 'Failed to log weight' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete({ request, env }) {
    try {
        const url = new URL(request.url);
        const weightId = url.pathname.split('/').pop();
        
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

        // Verify weight entry ownership
        const weightEntry = await env.DB.prepare(`
            SELECT * FROM user_weight_logs WHERE id = ? AND user_id = ?
        `).bind(weightId, userId).first();

        if (!weightEntry) {
            return new Response(JSON.stringify({ error: 'Weight entry not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete the weight entry
        await env.DB.prepare(`DELETE FROM user_weight_logs WHERE id = ? AND user_id = ?`)
            .bind(weightId, userId).run();

        return new Response(JSON.stringify({
            message: 'Weight entry deleted successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Weight deletion error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete weight entry' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to categorize BMI
function getBMICategory(bmi) {
    if (!bmi) return null;
    
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}