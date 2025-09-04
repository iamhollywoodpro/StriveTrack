// Competition Management API
// Handles CRUD operations for competitions

import { v4 as uuidv4 } from 'uuid';

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
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

        // Get query parameters
        const status = url.searchParams.get('status') || 'active';
        const type = url.searchParams.get('type');
        const my = url.searchParams.get('my'); // 'created' or 'joined'

        let query = `
            SELECT 
                c.*,
                u.name as creator_name,
                COUNT(cp.id) as participant_count,
                CASE WHEN cp_user.user_id IS NOT NULL THEN 1 ELSE 0 END as user_joined
            FROM competitions c
            LEFT JOIN users u ON c.creator_id = u.id
            LEFT JOIN competition_participants cp ON c.id = cp.competition_id AND cp.status = 'active'
            LEFT JOIN competition_participants cp_user ON c.id = cp_user.competition_id AND cp_user.user_id = ?
            WHERE 1=1
        `;
        
        const params = [user.id];

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }

        if (type) {
            query += ' AND c.competition_type = ?';
            params.push(type);
        }

        if (my === 'created') {
            query += ' AND c.creator_id = ?';
            params.push(user.id);
        } else if (my === 'joined') {
            query += ' AND cp_user.user_id = ?';
            params.push(user.id);
        }

        query += ' GROUP BY c.id ORDER BY c.created_at DESC';

        const competitions = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({ 
            success: true, 
            competitions: competitions.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching competitions:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch competitions' }), {
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
        if (!data.title || !data.competition_type || !data.start_date || !data.end_date) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate dates
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        const now = new Date();

        if (startDate <= now) {
            return new Response(JSON.stringify({ error: 'Start date must be in the future' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (endDate <= startDate) {
            return new Response(JSON.stringify({ error: 'End date must be after start date' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const competitionId = uuidv4();

        // Create competition
        await env.DB.prepare(`
            INSERT INTO competitions (
                id, title, description, competition_type, creator_id, 
                start_date, end_date, max_participants, entry_requirements, 
                prize_description, rules
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            competitionId,
            data.title,
            data.description || '',
            data.competition_type,
            user.id,
            data.start_date,
            data.end_date,
            data.max_participants || 50,
            data.entry_requirements ? JSON.stringify(data.entry_requirements) : null,
            data.prize_description || '',
            data.rules || ''
        ).run();

        // Update user stats
        await env.DB.prepare('UPDATE users SET competitions_created = competitions_created + 1 WHERE id = ?').bind(user.id).run();

        // Check for competition creator achievement
        const createdCount = await env.DB.prepare('SELECT competitions_created FROM users WHERE id = ?').bind(user.id).first();
        if (createdCount.competitions_created === 1) {
            // Award first competition creator achievement
            await env.DB.prepare(`
                INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at)
                VALUES (?, ?, 'comp_creator', datetime('now'))
            `).bind(uuidv4(), user.id).run();
        }

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
        return new Response(JSON.stringify({ error: 'Failed to create competition' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}