// Helper function to generate unique IDs
function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Helper function to get user from session
async function getUserFromSession(sessionId, env) {
    if (!sessionId) return null;
    
    const result = await env.DB.prepare(
        "SELECT id, email, username FROM users WHERE session_id = ?"
    ).bind(sessionId).first();
    
    return result;
}

// GET - List challenges for user
export async function onRequestGet(context) {
    const { request, env } = context;
    const sessionId = request.headers.get('x-session-id');
    
    try {
        const user = await getUserFromSession(sessionId, env);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const url = new URL(request.url);
        const type = url.searchParams.get('type') || 'all'; // 'active', 'completed', 'created', 'invited'

        let query = `
            SELECT 
                c.*,
                u.username as creator_username,
                u.email as creator_email,
                p.status as participation_status,
                p.progress_value,
                p.progress_percentage,
                (SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = c.id AND status = 'accepted') as participant_count
            FROM social_challenges c
            LEFT JOIN users u ON c.creator_id = u.id
            LEFT JOIN challenge_participants p ON c.id = p.challenge_id AND p.user_id = ?
            WHERE (
                c.creator_id = ? OR 
                p.user_id = ? OR 
                c.privacy = 'public' OR
                (c.privacy = 'friends' AND c.creator_id IN (
                    SELECT friend_user_id FROM user_friends WHERE user_id = ? AND status = 'accepted'
                ))
            )
        `;

        const params = [user.id, user.id, user.id, user.id];

        if (type === 'active') {
            query += ` AND c.status = 'active' AND datetime(c.end_date) > datetime('now')`;
        } else if (type === 'completed') {
            query += ` AND (c.status = 'completed' OR datetime(c.end_date) <= datetime('now'))`;
        } else if (type === 'created') {
            query += ` AND c.creator_id = ?`;
            params.push(user.id);
        } else if (type === 'invited') {
            query += ` AND p.status = 'invited'`;
        }

        query += ` ORDER BY c.created_at DESC`;

        const challenges = await env.DB.prepare(query).bind(...params).all();

        // Get participants for each challenge
        for (let challenge of challenges.results) {
            const participants = await env.DB.prepare(`
                SELECT 
                    p.*,
                    u.username,
                    u.email
                FROM challenge_participants p
                JOIN users u ON p.user_id = u.id
                WHERE p.challenge_id = ? AND p.status = 'accepted'
                ORDER BY p.progress_percentage DESC, p.joined_at ASC
            `).bind(challenge.id).all();

            challenge.participants = participants.results;
        }

        return new Response(JSON.stringify({ challenges: challenges.results }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get challenges error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch challenges' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Create new challenge
export async function onRequestPost(context) {
    const { request, env } = context;
    const sessionId = request.headers.get('x-session-id');
    
    try {
        const user = await getUserFromSession(sessionId, env);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        const { 
            title, 
            description, 
            type = 'group', 
            category = 'fitness',
            target_value,
            target_unit = 'days',
            duration_days = 7,
            max_participants = 10,
            reward_points = 100,
            privacy = 'friends',
            rules,
            invitees = []
        } = data;

        if (!title || !target_value) {
            return new Response(JSON.stringify({ error: 'Title and target value are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const challengeId = generateId();
        const now = new Date().toISOString();
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + (duration_days * 24 * 60 * 60 * 1000)).toISOString();

        // Create challenge
        await env.DB.prepare(`
            INSERT INTO social_challenges (
                id, creator_id, title, description, type, category, target_value, target_unit,
                duration_days, max_participants, reward_points, start_date, end_date, 
                privacy, rules, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            challengeId, user.id, title.trim(), description?.trim() || '', type, category,
            target_value, target_unit, duration_days, max_participants, reward_points,
            startDate, endDate, privacy, JSON.stringify(rules || {}), now, now
        ).run();

        // Auto-join creator as participant
        const participantId = generateId();
        await env.DB.prepare(`
            INSERT INTO challenge_participants (id, challenge_id, user_id, status, joined_at)
            VALUES (?, ?, ?, 'accepted', ?)
        `).bind(participantId, challengeId, user.id, now).run();

        // Send invitations if specified
        if (invitees && invitees.length > 0) {
            for (let inviteeEmail of invitees) {
                const invitee = await env.DB.prepare(
                    "SELECT id FROM users WHERE email = ?"
                ).bind(inviteeEmail.trim()).first();

                if (invitee) {
                    const invitationId = generateId();
                    await env.DB.prepare(`
                        INSERT INTO challenge_invitations (
                            id, challenge_id, inviter_id, invitee_id, created_at
                        ) VALUES (?, ?, ?, ?, ?)
                    `).bind(invitationId, challengeId, user.id, invitee.id, now).run();

                    // Also create participant entry in invited status
                    const inviteeParticipantId = generateId();
                    await env.DB.prepare(`
                        INSERT INTO challenge_participants (id, challenge_id, user_id, status, joined_at)
                        VALUES (?, ?, ?, 'invited', ?)
                    `).bind(inviteeParticipantId, challengeId, invitee.id, now).run();
                }
            }
        }

        return new Response(JSON.stringify({ 
            message: 'Challenge created successfully',
            challenge: {
                id: challengeId,
                title,
                type,
                category,
                target_value,
                target_unit,
                duration_days,
                start_date: startDate,
                end_date: endDate
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Create challenge error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create challenge' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}