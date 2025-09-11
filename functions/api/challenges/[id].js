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

// GET - Get specific challenge details
export async function onRequestGet(context) {
    const { request, env, params } = context;
    const sessionId = request.headers.get('x-session-id');
    const challengeId = params.id;
    
    try {
        const user = await getUserFromSession(sessionId, env);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get challenge details
        const challenge = await env.DB.prepare(`
            SELECT 
                c.*,
                u.username as creator_username,
                u.email as creator_email,
                p.status as user_participation_status,
                p.progress_value as user_progress_value,
                p.progress_percentage as user_progress_percentage
            FROM social_challenges c
            LEFT JOIN users u ON c.creator_id = u.id
            LEFT JOIN challenge_participants p ON c.id = p.challenge_id AND p.user_id = ?
            WHERE c.id = ?
        `).bind(user.id, challengeId).first();

        if (!challenge) {
            return new Response(JSON.stringify({ error: 'Challenge not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all participants
        const participants = await env.DB.prepare(`
            SELECT 
                p.*,
                u.username,
                u.email
            FROM challenge_participants p
            JOIN users u ON p.user_id = u.id
            WHERE p.challenge_id = ? AND p.status IN ('accepted', 'completed')
            ORDER BY p.progress_percentage DESC, p.joined_at ASC
        `).bind(challengeId).all();

        challenge.participants = participants.results;

        // Get progress history for user if they're participating
        if (challenge.user_participation_status) {
            const userProgress = await env.DB.prepare(`
                SELECT * FROM challenge_progress 
                WHERE challenge_id = ? AND participant_id IN (
                    SELECT id FROM challenge_participants 
                    WHERE challenge_id = ? AND user_id = ?
                )
                ORDER BY progress_date DESC
            `).bind(challengeId, challengeId, user.id).all();

            challenge.user_progress_history = userProgress.results;
        }

        return new Response(JSON.stringify({ challenge }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get challenge error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch challenge' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Join challenge or update progress
export async function onRequestPost(context) {
    const { request, env, params } = context;
    const sessionId = request.headers.get('x-session-id');
    const challengeId = params.id;
    
    try {
        const user = await getUserFromSession(sessionId, env);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        const { action, progress_value, progress_notes } = data;

        if (action === 'join') {
            // Join challenge
            const challenge = await env.DB.prepare(
                "SELECT * FROM social_challenges WHERE id = ?"
            ).bind(challengeId).first();

            if (!challenge) {
                return new Response(JSON.stringify({ error: 'Challenge not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check if user is already a participant
            const existingParticipant = await env.DB.prepare(
                "SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?"
            ).bind(challengeId, user.id).first();

            if (existingParticipant) {
                if (existingParticipant.status === 'invited') {
                    // Accept invitation
                    await env.DB.prepare(
                        "UPDATE challenge_participants SET status = 'accepted' WHERE id = ?"
                    ).bind(existingParticipant.id).run();

                    return new Response(JSON.stringify({ message: 'Successfully joined challenge' }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    return new Response(JSON.stringify({ error: 'Already participating in this challenge' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } else {
                // Check participant limit
                const participantCount = await env.DB.prepare(
                    "SELECT COUNT(*) as count FROM challenge_participants WHERE challenge_id = ? AND status = 'accepted'"
                ).bind(challengeId).first();

                if (participantCount.count >= challenge.max_participants) {
                    return new Response(JSON.stringify({ error: 'Challenge is full' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // Create new participant
                const participantId = generateId();
                await env.DB.prepare(`
                    INSERT INTO challenge_participants (id, challenge_id, user_id, status, joined_at)
                    VALUES (?, ?, ?, 'accepted', ?)
                `).bind(participantId, challengeId, user.id, new Date().toISOString()).run();

                return new Response(JSON.stringify({ message: 'Successfully joined challenge' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

        } else if (action === 'update_progress') {
            // Update progress
            const participant = await env.DB.prepare(
                "SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ? AND status = 'accepted'"
            ).bind(challengeId, user.id).first();

            if (!participant) {
                return new Response(JSON.stringify({ error: 'Not participating in this challenge' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const challenge = await env.DB.prepare(
                "SELECT * FROM social_challenges WHERE id = ?"
            ).bind(challengeId).first();

            // Calculate progress percentage
            const progressPercentage = Math.min(100, (progress_value / challenge.target_value) * 100);

            // Update participant progress
            await env.DB.prepare(
                "UPDATE challenge_participants SET progress_value = ?, progress_percentage = ? WHERE id = ?"
            ).bind(progress_value, progressPercentage, participant.id).run();

            // Add progress entry for today
            const today = new Date().toISOString().split('T')[0];
            const progressId = generateId();
            
            await env.DB.prepare(`
                INSERT OR REPLACE INTO challenge_progress (
                    id, challenge_id, participant_id, progress_date, progress_value, progress_notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                progressId, challengeId, participant.id, today, progress_value, 
                progress_notes || '', new Date().toISOString()
            ).run();

            return new Response(JSON.stringify({ 
                message: 'Progress updated successfully',
                progress_percentage: progressPercentage 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Challenge action error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process challenge action' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE - Leave challenge or delete challenge (if creator)
export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const sessionId = request.headers.get('x-session-id');
    const challengeId = params.id;
    
    try {
        const user = await getUserFromSession(sessionId, env);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const challenge = await env.DB.prepare(
            "SELECT * FROM social_challenges WHERE id = ?"
        ).bind(challengeId).first();

        if (!challenge) {
            return new Response(JSON.stringify({ error: 'Challenge not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (challenge.creator_id === user.id) {
            // Delete entire challenge if user is creator
            await env.DB.prepare("DELETE FROM social_challenges WHERE id = ?").bind(challengeId).run();
            // Cascading deletes will handle participants, progress, and invitations
            
            return new Response(JSON.stringify({ message: 'Challenge deleted successfully' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Leave challenge if user is participant
            await env.DB.prepare(
                "DELETE FROM challenge_participants WHERE challenge_id = ? AND user_id = ?"
            ).bind(challengeId, user.id).run();

            return new Response(JSON.stringify({ message: 'Left challenge successfully' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Delete challenge error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete/leave challenge' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}