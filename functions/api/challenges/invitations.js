// Helper function to get user from session
async function getUserFromSession(sessionId, env) {
    if (!sessionId) return null;
    
    const result = await env.DB.prepare(
        "SELECT id, email, username FROM users WHERE session_id = ?"
    ).bind(sessionId).first();
    
    return result;
}

// GET - Get user's challenge invitations
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

        const invitations = await env.DB.prepare(`
            SELECT 
                i.*,
                c.title as challenge_title,
                c.description as challenge_description,
                c.type as challenge_type,
                c.category as challenge_category,
                c.target_value,
                c.target_unit,
                c.duration_days,
                c.reward_points,
                c.end_date,
                u.username as inviter_username,
                u.email as inviter_email
            FROM challenge_invitations i
            JOIN social_challenges c ON i.challenge_id = c.id
            JOIN users u ON i.inviter_id = u.id
            WHERE i.invitee_id = ? AND i.status = 'pending'
            ORDER BY i.created_at DESC
        `).bind(user.id).all();

        return new Response(JSON.stringify({ invitations: invitations.results }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get invitations error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch invitations' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Respond to challenge invitation
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
        const { invitation_id, response } = data; // response: 'accept' or 'decline'

        if (!invitation_id || !['accept', 'decline'].includes(response)) {
            return new Response(JSON.stringify({ error: 'Invalid request data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const invitation = await env.DB.prepare(
            "SELECT * FROM challenge_invitations WHERE id = ? AND invitee_id = ? AND status = 'pending'"
        ).bind(invitation_id, user.id).first();

        if (!invitation) {
            return new Response(JSON.stringify({ error: 'Invitation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const now = new Date().toISOString();
        
        if (response === 'accept') {
            // Check if challenge is still active and has space
            const challenge = await env.DB.prepare(
                "SELECT * FROM social_challenges WHERE id = ? AND status = 'active'"
            ).bind(invitation.challenge_id).first();

            if (!challenge) {
                return new Response(JSON.stringify({ error: 'Challenge no longer available' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const participantCount = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM challenge_participants WHERE challenge_id = ? AND status = 'accepted'"
            ).bind(invitation.challenge_id).first();

            if (participantCount.count >= challenge.max_participants) {
                return new Response(JSON.stringify({ error: 'Challenge is full' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Update participant status to accepted
            await env.DB.prepare(
                "UPDATE challenge_participants SET status = 'accepted' WHERE challenge_id = ? AND user_id = ?"
            ).bind(invitation.challenge_id, user.id).run();

            // Update invitation status
            await env.DB.prepare(
                "UPDATE challenge_invitations SET status = 'accepted', responded_at = ? WHERE id = ?"
            ).bind(now, invitation_id).run();

            return new Response(JSON.stringify({ message: 'Challenge invitation accepted' }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else { // decline
            // Update participant status to declined
            await env.DB.prepare(
                "UPDATE challenge_participants SET status = 'declined' WHERE challenge_id = ? AND user_id = ?"
            ).bind(invitation.challenge_id, user.id).run();

            // Update invitation status
            await env.DB.prepare(
                "UPDATE challenge_invitations SET status = 'declined', responded_at = ? WHERE id = ?"
            ).bind(now, invitation_id).run();

            return new Response(JSON.stringify({ message: 'Challenge invitation declined' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Respond to invitation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to respond to invitation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}