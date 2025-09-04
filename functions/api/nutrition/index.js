export async function onRequestPost({ request, env }) {
    try {
        const sessionId = request.headers.get('x-session-id');
        
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'No session provided' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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
        const {
            food_name,
            meal_type = 'snack',
            calories = 0,
            protein_g = 0,
            carbs_g = 0,
            fat_g = 0,
            sugar_g = 0,
            fiber_g = 0,
            water_ml = 0,
            is_custom_recipe = false
        } = await request.json();

        if (!food_name) {
            return new Response(JSON.stringify({ error: 'Food name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { generateNutritionId } = await import('../../utils/id-generator.js');
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Log the food entry
        const logId = generateNutritionId();
        await env.DB.prepare(`
            INSERT INTO user_nutrition_logs (
                id, user_id, log_date, meal_type, food_name,
                calories, protein_g, carbs_g, fat_g, sugar_g, fiber_g, water_ml, is_custom_recipe
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            logId, userId, today, meal_type, food_name,
            calories, protein_g, carbs_g, fat_g, sugar_g, fiber_g, water_ml, is_custom_recipe
        ).run();

        // Update daily nutrition totals
        await updateDailyNutrition(env.DB, userId, today);

        // Award points for nutrition logging
        let pointsEarned = 5; // Base points for logging
        if (is_custom_recipe) pointsEarned += 10; // Bonus for custom recipes
        if (water_ml > 0) pointsEarned += 2; // Bonus for hydration

        await env.DB.prepare(
            'UPDATE users SET points = points + ?, weekly_points = weekly_points + ? WHERE id = ?'
        ).bind(pointsEarned, pointsEarned, userId).run();

        // Trigger achievement checking
        try {
            const { checkAndAwardAchievements } = await import('../../utils/achievements.js');
            await checkAndAwardAchievements(userId, 'nutrition_log', { food_name, meal_type }, env);
        } catch (achievementError) {
            console.error('Achievement check error:', achievementError);
            // Don't fail the logging if achievements fail
        }

        return new Response(JSON.stringify({
            message: 'Nutrition logged successfully!',
            log_id: logId,
            points_earned: pointsEarned,
            date: today
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Nutrition logging error:', error);
        return new Response(JSON.stringify({ error: 'Failed to log nutrition' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const sessionId = request.headers.get('x-session-id');
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
        
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'No session provided' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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

        // Get nutrition logs for the date
        const logs = await env.DB.prepare(`
            SELECT * FROM user_nutrition_logs 
            WHERE user_id = ? AND log_date = ?
            ORDER BY created_at DESC
        `).bind(userId, date).all();

        // Get daily nutrition summary
        const dailySummary = await env.DB.prepare(`
            SELECT * FROM user_daily_nutrition 
            WHERE user_id = ? AND log_date = ?
        `).bind(userId, date).first();

        // Get nutrition streak stats
        const streakStats = await getNutritionStreaks(env.DB, userId);

        return new Response(JSON.stringify({
            date: date,
            logs: logs.results || [],
            daily_summary: dailySummary || null,
            streak_stats: streakStats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get nutrition error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load nutrition data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to update daily nutrition totals
async function updateDailyNutrition(db, userId, date) {
    // Calculate totals from logs
    const totals = await db.prepare(`
        SELECT 
            SUM(calories) as total_calories,
            SUM(protein_g) as total_protein_g,
            SUM(carbs_g) as total_carbs_g,
            SUM(fat_g) as total_fat_g,
            SUM(sugar_g) as total_sugar_g,
            SUM(fiber_g) as total_fiber_g,
            SUM(water_ml) as total_water_ml
        FROM user_nutrition_logs
        WHERE user_id = ? AND log_date = ?
    `).bind(userId, date).first();

    // Default goals - these could be user-customizable later
    const calorieGoal = 2000;
    const proteinGoal = 150;
    const carbsGoal = 200;
    const fatGoal = 65;

    // Calculate goal achievement
    const metCalorieGoal = (totals.total_calories || 0) >= calorieGoal * 0.95 && (totals.total_calories || 0) <= calorieGoal * 1.05;
    const metProteinGoal = (totals.total_protein_g || 0) >= proteinGoal;
    const metCarbsGoal = (totals.total_carbs_g || 0) >= carbsGoal * 0.8 && (totals.total_carbs_g || 0) <= carbsGoal * 1.2;
    const metFatGoal = (totals.total_fat_g || 0) >= fatGoal * 0.8 && (totals.total_fat_g || 0) <= fatGoal * 1.2;

    // Calculate macro balance score (0-100)
    let balanceScore = 0;
    if (metCalorieGoal) balanceScore += 25;
    if (metProteinGoal) balanceScore += 25;
    if (metCarbsGoal) balanceScore += 25;
    if (metFatGoal) balanceScore += 25;

    // Update or insert daily nutrition record
    await db.prepare(`
        INSERT OR REPLACE INTO user_daily_nutrition (
            id, user_id, log_date,
            total_calories, total_protein_g, total_carbs_g, total_fat_g,
            total_sugar_g, total_fiber_g, total_water_ml,
            calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g,
            met_calorie_goal, met_protein_goal, met_carbs_goal, met_fat_goal,
            macro_balance_score, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
        `daily_${userId}_${date}`, userId, date,
        totals.total_calories || 0, totals.total_protein_g || 0, totals.total_carbs_g || 0, totals.total_fat_g || 0,
        totals.total_sugar_g || 0, totals.total_fiber_g || 0, totals.total_water_ml || 0,
        calorieGoal, proteinGoal, carbsGoal, fatGoal,
        metCalorieGoal, metProteinGoal, metCarbsGoal, metFatGoal,
        balanceScore
    ).run();
}

// Helper function to get nutrition streaks
async function getNutritionStreaks(db, userId) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get recent nutrition tracking days
    const recentDays = await db.prepare(`
        SELECT log_date, macro_balance_score,
               met_calorie_goal, met_protein_goal, met_carbs_goal, met_fat_goal
        FROM user_daily_nutrition
        WHERE user_id = ? AND log_date <= ?
        ORDER BY log_date DESC
        LIMIT 30
    `).bind(userId, today).all();

    let currentStreak = 0;
    let proteinStreak = 0;
    let calorieStreak = 0;
    let macroStreak = 0;

    for (const day of recentDays.results || []) {
        // General tracking streak
        if (day.macro_balance_score > 0) {
            currentStreak++;
        } else {
            break;
        }

        // Protein goal streak
        if (day.met_protein_goal) {
            proteinStreak++;
        } else if (proteinStreak === currentStreak - 1) {
            // Only break if this was the most recent failure
            proteinStreak = 0;
        }

        // Calorie goal streak
        if (day.met_calorie_goal) {
            calorieStreak++;
        } else if (calorieStreak === currentStreak - 1) {
            calorieStreak = 0;
        }

        // Macro balance streak (all 3 macros met)
        if (day.met_protein_goal && day.met_carbs_goal && day.met_fat_goal) {
            macroStreak++;
        } else if (macroStreak === currentStreak - 1) {
            macroStreak = 0;
        }
    }

    return {
        tracking_streak: currentStreak,
        protein_streak: proteinStreak,
        calorie_streak: calorieStreak,
        macro_balance_streak: macroStreak,
        total_tracking_days: recentDays.results?.length || 0
    };
}

export async function onRequestDelete({ request, env }) {
    try {
        const url = new URL(request.url);
        const nutritionId = url.pathname.split('/').pop();
        
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

        // Verify nutrition entry ownership
        const nutritionEntry = await env.DB.prepare(`
            SELECT * FROM user_nutrition_logs WHERE id = ? AND user_id = ?
        `).bind(nutritionId, userId).first();

        if (!nutritionEntry) {
            return new Response(JSON.stringify({ error: 'Nutrition entry not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete the nutrition entry
        await env.DB.prepare(`DELETE FROM user_nutrition_logs WHERE id = ? AND user_id = ?`)
            .bind(nutritionId, userId).run();

        return new Response(JSON.stringify({
            message: 'Nutrition entry deleted successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Nutrition deletion error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete nutrition entry' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}