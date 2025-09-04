// Simplified Competition Management API
// Handles CRUD operations for competitions

export async function onRequestGet({ request, env }) {
    try {
        const sessionId = request.headers.get('x-session-id');
        
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'No session provided' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get current user (simplified check)
        const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(sessionId).first();
        if (!session) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Simple query to get all active competitions
        const competitionsResult = await env.DB.prepare(`
            SELECT 
                id,
                title,
                description,
                competition_type,
                start_date,
                end_date,
                status,
                max_participants,
                prize_description,
                created_at
            FROM competitions 
            WHERE status = 'active'
            ORDER BY created_at DESC
        `).all();

        const competitions = competitionsResult.results || [];

        return new Response(JSON.stringify({ 
            success: true, 
            competitions: competitions
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching competitions:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch competitions',
            details: error.message 
        }), {
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

        // Get current user
        const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(sessionId).first();
        if (!session) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        
        // Validate required fields
        if (!data.title || !data.competition_type) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate simple competition ID
        const competitionId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create competition
        await env.DB.prepare(`
            INSERT INTO competitions (
                id, title, description, competition_type, creator_id, 
                start_date, end_date, status, max_participants, 
                prize_description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            competitionId,
            data.title,
            data.description || '',
            data.competition_type,
            user.id,
            data.start_date || new Date().toISOString(),
            data.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            'active',
            data.max_participants || 50,
            data.prize_description || ''
        ).run();

        // Get the created competition
        const competition = await env.DB.prepare('SELECT * FROM competitions WHERE id = ?').bind(competitionId).first();

        return new Response(JSON.stringify({ 
            success: true, 
            competition: competition 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error creating competition:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create competition',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}