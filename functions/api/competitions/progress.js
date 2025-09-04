// Competition Progress Tracking API
// Handles progress updates and score calculations

import { v4 as uuidv4 } from 'uuid';

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
        const { competition_id, progress_value, progress_type, notes, media_url } = data;

        if (!competition_id || progress_value === undefined || !progress_type) {
            return new Response(JSON.stringify({ error: 'Competition ID, progress value, and progress type are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get competition and participant info
        const competition = await env.DB.prepare('SELECT * FROM competitions WHERE id = ?').bind(competition_id).first();
        if (!competition) {
            return new Response(JSON.stringify({ error: 'Competition not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const participant = await env.DB.prepare('SELECT * FROM competition_participants WHERE competition_id = ? AND user_id = ? AND status = "active"').bind(competition_id, user.id).first();
        if (!participant) {
            return new Response(JSON.stringify({ error: 'Not participating in this competition' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if competition is active and ongoing
        const now = new Date();
        const startDate = new Date(competition.start_date);
        const endDate = new Date(competition.end_date);

        if (competition.status !== 'active') {
            return new Response(JSON.stringify({ error: 'Competition is not active' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (now < startDate) {
            return new Response(JSON.stringify({ error: 'Competition has not started yet' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (now > endDate) {
            return new Response(JSON.stringify({ error: 'Competition has ended' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Log progress
        const progressId = uuidv4();
        await env.DB.prepare(`
            INSERT INTO competition_progress (
                id, competition_id, participant_id, user_id, 
                progress_date, progress_value, progress_type, 
                notes, media_url
            ) VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)
        `).bind(
            progressId,
            competition_id,
            participant.id,
            user.id,
            progress_value,
            progress_type,
            notes || '',
            media_url || null
        ).run();

        // Calculate and update score based on competition type
        await calculateCompetitionScore(env, competition, participant);

        // Update rankings for all participants in this competition
        await updateCompetitionRankings(env, competition_id);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Progress logged successfully',
            progress_id: progressId
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error logging competition progress:', error);
        return new Response(JSON.stringify({ error: 'Failed to log progress' }), {
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
        const userId = url.searchParams.get('user_id'); // Optional, defaults to current user
        
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

        const targetUserId = userId || session.user_id;

        if (!competitionId) {
            return new Response(JSON.stringify({ error: 'Competition ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get progress entries for the user in this competition
        const progress = await env.DB.prepare(`
            SELECT 
                cp.*,
                u.name as user_name
            FROM competition_progress cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.competition_id = ? AND cp.user_id = ?
            ORDER BY cp.progress_date DESC
        `).bind(competitionId, targetUserId).all();

        return new Response(JSON.stringify({ 
            success: true, 
            progress: progress.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching competition progress:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch progress' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to calculate competition scores
async function calculateCompetitionScore(env, competition, participant) {
    try {
        let score = 0;
        
        if (competition.competition_type === 'weight_loss') {
            // Score based on weight lost (higher is better)
            const latestProgress = await env.DB.prepare(`
                SELECT progress_value FROM competition_progress 
                WHERE participant_id = ? AND progress_type = 'weight' 
                ORDER BY progress_date DESC LIMIT 1
            `).bind(participant.id).first();

            if (latestProgress && participant.starting_weight_kg) {
                const weightLost = participant.starting_weight_kg - latestProgress.progress_value;
                score = Math.max(0, weightLost); // Negative weight loss = 0 score
            }

        } else if (competition.competition_type === 'muscle_gain') {
            // Score based on weight gained (higher is better)
            const latestProgress = await env.DB.prepare(`
                SELECT progress_value FROM competition_progress 
                WHERE participant_id = ? AND progress_type = 'weight' 
                ORDER BY progress_date DESC LIMIT 1
            `).bind(participant.id).first();

            if (latestProgress && participant.starting_weight_kg) {
                const weightGained = latestProgress.progress_value - participant.starting_weight_kg;
                score = Math.max(0, weightGained); // Negative weight gain = 0 score
            }

        } else if (competition.competition_type === 'workout_frequency') {
            // Score based on number of workout entries
            const workoutCount = await env.DB.prepare(`
                SELECT COUNT(*) as count FROM competition_progress 
                WHERE participant_id = ? AND progress_type = 'workout_count'
            `).bind(participant.id).first();

            score = workoutCount ? workoutCount.count : 0;

        } else {
            // For custom competitions, use the latest progress value
            const latestProgress = await env.DB.prepare(`
                SELECT progress_value FROM competition_progress 
                WHERE participant_id = ? 
                ORDER BY progress_date DESC LIMIT 1
            `).bind(participant.id).first();

            score = latestProgress ? latestProgress.progress_value : 0;
        }

        // Update participant's score
        await env.DB.prepare('UPDATE competition_participants SET final_score = ? WHERE id = ?').bind(score, participant.id).run();

    } catch (error) {
        console.error('Error calculating competition score:', error);
    }
}

// Helper function to update rankings for all participants
async function updateCompetitionRankings(env, competitionId) {
    try {
        // Get all participants ordered by score (descending)
        const participants = await env.DB.prepare(`
            SELECT id, final_score FROM competition_participants 
            WHERE competition_id = ? AND status = 'active'
            ORDER BY final_score DESC
        `).bind(competitionId).all();

        // Update rankings
        for (let i = 0; i < participants.results.length; i++) {
            const participant = participants.results[i];
            const ranking = i + 1;
            
            await env.DB.prepare('UPDATE competition_participants SET ranking = ? WHERE id = ?').bind(ranking, participant.id).run();
        }

        // Check for podium achievements after competition ends
        const competition = await env.DB.prepare('SELECT * FROM competitions WHERE id = ?').bind(competitionId).first();
        if (competition && competition.status === 'completed') {
            // Award achievements to top 3
            const topThree = participants.results.slice(0, 3);
            
            for (let i = 0; i < topThree.length; i++) {
                const participant = await env.DB.prepare('SELECT user_id FROM competition_participants WHERE id = ?').bind(topThree[i].id).first();
                
                if (i === 0) {
                    // Winner achievement
                    await env.DB.prepare(`
                        INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at)
                        VALUES (?, ?, 'comp_winner', datetime('now'))
                    `).bind(uuidv4(), participant.user_id).run();
                    
                    // Update user stats
                    await env.DB.prepare('UPDATE users SET competitions_won = competitions_won + 1 WHERE id = ?').bind(participant.user_id).run();
                }
                
                // Podium achievement for top 3
                await env.DB.prepare(`
                    INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, earned_at)
                    VALUES (?, ?, 'comp_podium', datetime('now'))
                `).bind(uuidv4(), participant.user_id).run();
            }
        }

    } catch (error) {
        console.error('Error updating competition rankings:', error);
    }
}