// Nutrition entry update endpoint
export async function onRequestPut({ request, env, params }) {
    try {
        const nutritionId = params.id;
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
        const existingEntry = await env.DB.prepare(`
            SELECT * FROM user_nutrition_logs WHERE id = ? AND user_id = ?
        `).bind(nutritionId, userId).first();

        if (!existingEntry) {
            return new Response(JSON.stringify({ error: 'Nutrition entry not found or access denied' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get update data
        const data = await request.json();
        
        // Validate required fields
        if (!data.food_name || !data.meal_type) {
            return new Response(JSON.stringify({ error: 'Food name and meal type are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update the nutrition entry
        await env.DB.prepare(`
            UPDATE user_nutrition_logs 
            SET food_name = ?, meal_type = ?, calories = ?, protein_g = ?, 
                carbs_g = ?, fat_g = ?, sugar_g = ?, fiber_g = ?, 
                water_ml = ?, notes = ?, is_custom_recipe = ?
            WHERE id = ? AND user_id = ?
        `).bind(
            data.food_name,
            data.meal_type,
            data.calories || 0,
            data.protein_g || 0,
            data.carbs_g || 0,
            data.fat_g || 0,
            data.sugar_g || 0,
            data.fiber_g || 0,
            data.water_ml || 0,
            data.notes || null,
            data.is_custom_recipe ? 1 : 0,
            nutritionId,
            userId
        ).run();

        return new Response(JSON.stringify({
            message: 'Nutrition entry updated successfully!'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Nutrition update error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update nutrition entry',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Nutrition entry deletion endpoint
export async function onRequestDelete({ request, env, params }) {
    try {
        const nutritionId = params.id;
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
        return new Response(JSON.stringify({ 
            error: 'Failed to delete nutrition entry',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}