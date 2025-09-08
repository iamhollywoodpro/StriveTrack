// Nutrition entry management endpoint for StriveTrack
import { requireAuth } from '../../utils/auth.js';

export async function onRequestPut(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const entryId = params.id;
        
        if (!entryId) {
            return new Response(JSON.stringify({ 
                error: 'Nutrition entry ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const {
            food_name,
            meal_type,
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
        
        // Verify the entry belongs to the user
        const entry = await env.DB.prepare(
            'SELECT id, log_date FROM user_nutrition_logs WHERE id = ? AND user_id = ?'
        ).bind(entryId, user.id).first();
        
        if (!entry) {
            return new Response(JSON.stringify({ 
                error: 'Nutrition entry not found or you do not have permission to edit it' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update the nutrition entry
        await env.DB.prepare(`
            UPDATE user_nutrition_logs SET 
                food_name = ?, meal_type = ?, calories = ?, protein_g = ?, 
                carbs_g = ?, fat_g = ?, sugar_g = ?, fiber_g = ?, 
                water_ml = ?, is_custom_recipe = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).bind(
            food_name, meal_type, calories, protein_g, carbs_g, fat_g, 
            sugar_g, fiber_g, water_ml, is_custom_recipe, entryId, user.id
        ).run();
        
        // Update daily nutrition totals for that date
        await updateDailyNutrition(env.DB, user.id, entry.log_date);
        
        return new Response(JSON.stringify({
            message: 'Nutrition entry updated successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Update nutrition entry error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    
    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;
        
        const user = authResult;
        const entryId = params.id;
        
        if (!entryId) {
            return new Response(JSON.stringify({ 
                error: 'Nutrition entry ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Verify the entry belongs to the user and get the date
        const entry = await env.DB.prepare(
            'SELECT id, log_date FROM user_nutrition_logs WHERE id = ? AND user_id = ?'
        ).bind(entryId, user.id).first();
        
        if (!entry) {
            return new Response(JSON.stringify({ 
                error: 'Nutrition entry not found or you do not have permission to delete it' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Delete the nutrition entry
        await env.DB.prepare('DELETE FROM user_nutrition_logs WHERE id = ? AND user_id = ?')
            .bind(entryId, user.id).run();
        
        // Update daily nutrition totals for that date
        await updateDailyNutrition(env.DB, user.id, entry.log_date);
        
        return new Response(JSON.stringify({
            message: 'Nutrition entry deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Delete nutrition entry error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to update daily nutrition totals (reused from index.js)
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