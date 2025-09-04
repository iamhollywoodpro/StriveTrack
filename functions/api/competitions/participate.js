// Competition Participation API
// Handles joining/leaving competitions and progress tracking

import { generateId, generateCompetitionId } from '../../utils/id-generator.js';

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
        const { competition_id, action } = data; // action: 'join' or 'leave'

        if (!competition_id || !action) {
            return new Response(JSON.stringify({ error: 'Competition ID and action are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get competition details
        const competition = await env.DB.prepare('SELECT * FROM competitions WHERE id = ?').bind(competition_id).first();
        if (!competition) {
            return new Response(JSON.stringify({ error: 'Competition not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if competition is active and hasn't started yet
        const now = new Date();
        const startDate = new Date(competition.start_date);
        
        if (competition.status !== 'active') {
            return new Response(JSON.stringify({ error: 'Competition is not active' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (action === 'join') {
            if (now >= startDate) {
                return new Response(JSON.stringify({ error: 'Competition has already started' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check if already participating
            const existingParticipant = await env.DB.prepare('SELECT * FROM competition_participants WHERE competition_id = ? AND user_id = ?').bind(competition_id, user.id).first();
            if (existingParticipant) {
                return new Response(JSON.stringify({ error: 'Already participating in this competition' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check participant limit
            const participantCount = await env.DB.prepare('SELECT COUNT(*) as count FROM competition_participants WHERE competition_id = ? AND status = "active"').bind(competition_id).first();
            if (participantCount.count >= competition.max_participants) {
                return new Response(JSON.stringify({ error: 'Competition is full' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Get user's current weight if it's a weight-based competition
            let startingWeight = null;
            if (competition.competition_type === 'weight_loss' || competition.competition_type === 'muscle_gain') {
                const latestWeight = await env.DB.prepare('SELECT weight_kg FROM user_weight_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 1').bind(user.id).first();
                startingWeight = latestWeight ? latestWeight.weight_kg : null;
            }

            // Join competition
            const participantId = generateId('participant');
            await env.DB.prepare(`
                INSERT INTO competition_participants (
                    id, competition_id, user_id, starting_weight_kg
                ) VALUES (?, ?, ?, ?)
            `).bind(participantId, competition_id, user.id, startingWeight).run();

            // Update user stats
            await env.DB.prepare('UPDATE users SET competitions_joined = competitions_joined + 1 WHERE id = ?').bind(user.id).run();

            // Check for first competition achievement
            const joinedCount = await env.DB.prepare('SELECT competitions_joined FROM users WHERE id = ?').bind(user.id).first();
            if (joinedCount.competitions_joined === 1) {
                await env.DB.prepare(`
                    INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at)
                    VALUES (?, ?, 'comp_first_join', datetime('now'))
                `).bind(generateId('achievement_unlock'), user.id).run();
            }

            // Check for consistent competitor achievement (5 competitions)
            if (joinedCount.competitions_joined === 5) {
                await env.DB.prepare(`
                    INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at)
                    VALUES (?, ?, 'comp_consistent', datetime('now'))
                `).bind(generateId('achievement_unlock'), user.id).run();
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Successfully joined competition',
                participant_id: participantId
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (action === 'leave') {
            // Check if participating
            const participant = await env.DB.prepare('SELECT * FROM competition_participants WHERE competition_id = ? AND user_id = ?').bind(competition_id, user.id).first();
            if (!participant) {
                return new Response(JSON.stringify({ error: 'Not participating in this competition' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (now >= startDate) {
                return new Response(JSON.stringify({ error: 'Cannot leave competition after it has started' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Update status to withdrawn
            await env.DB.prepare('UPDATE competition_participants SET status = "withdrawn" WHERE id = ?').bind(participant.id).run();

            // Decrease user's competition count
            await env.DB.prepare('UPDATE users SET competitions_joined = competitions_joined - 1 WHERE id = ?').bind(user.id).run();

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Successfully left competition'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else {
            return new Response(JSON.stringify({ error: 'Invalid action' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Error with competition participation:', error);
        return new Response(JSON.stringify({ error: 'Failed to process participation request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const sessionId = request.headers.get('x-session-id');
        const competitionId = url.searchParams.get('competition_id');
        
        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'No session provided' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!competitionId) {
            return new Response(JSON.stringify({ error: 'Competition ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get leaderboard for specific competition
        const leaderboard = await env.DB.prepare(`
            SELECT 
                cp.user_id,
                u.name as user_name,
                u.profile_image_url,
                cp.final_score,
                cp.ranking,
                cp.starting_weight_kg,
                COUNT(cprog.id) as progress_entries,
                MAX(cprog.progress_date) as last_update
            FROM competition_participants cp
            JOIN users u ON cp.user_id = u.id
            LEFT JOIN competition_progress cprog ON cp.id = cprog.participant_id
            WHERE cp.competition_id = ? AND cp.status = 'active'
            GROUP BY cp.id
            ORDER BY cp.ranking ASC, cp.final_score DESC
        `).bind(competitionId).all();

        return new Response(JSON.stringify({ 
            success: true, 
            leaderboard: leaderboard.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}