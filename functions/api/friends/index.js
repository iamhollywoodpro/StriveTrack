export async function onRequestGet({ request, env }) {
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

        // Get friends list
        const friends = await env.DB.prepare(`
            SELECT 
                u.id,
                u.email,
                u.points,
                u.weekly_points,
                uf.created_at as friendship_date,
                (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements
            FROM user_friends uf
            JOIN users u ON (
                CASE 
                    WHEN uf.user_id = ? THEN u.id = uf.friend_id
                    ELSE u.id = uf.user_id
                END
            )
            WHERE (uf.user_id = ? OR uf.friend_id = ?) AND uf.status = 'accepted'
            ORDER BY uf.created_at DESC
        `).bind(userId, userId, userId).all();

        // Get pending friend requests (received)
        const pendingRequests = await env.DB.prepare(`
            SELECT 
                fr.id,
                u.email,
                fr.created_at
            FROM friend_requests fr
            JOIN users u ON fr.from_user_id = u.id
            WHERE fr.to_user_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `).bind(userId).all();

        // Get sent requests
        const sentRequests = await env.DB.prepare(`
            SELECT 
                fr.id,
                u.email,
                fr.created_at
            FROM friend_requests fr
            JOIN users u ON fr.to_user_id = u.id
            WHERE fr.from_user_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `).bind(userId).all();

        return new Response(JSON.stringify({
            friends: friends.results || [],
            pending_requests: pendingRequests.results || [],
            sent_requests: sentRequests.results || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Friends list error:', error);
        return new Response(JSON.stringify({ error: 'Failed to load friends' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const sessionId = request.headers.get('x-session-id');
        const { action, email, request_id } = await request.json();
        
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
        const { v4: uuidv4 } = await import('uuid');

        if (action === 'send_request') {
            // Find user by email
            const targetUser = await env.DB.prepare(
                'SELECT id FROM users WHERE email = ?'
            ).bind(email).first();

            if (!targetUser) {
                return new Response(JSON.stringify({ error: 'User not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (targetUser.id === userId) {
                return new Response(JSON.stringify({ error: 'Cannot add yourself as friend' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check if friendship already exists
            const existingFriendship = await env.DB.prepare(`
                SELECT id FROM user_friends 
                WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
            `).bind(userId, targetUser.id, targetUser.id, userId).first();

            if (existingFriendship) {
                return new Response(JSON.stringify({ error: 'Friendship already exists' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check if request already exists
            const existingRequest = await env.DB.prepare(`
                SELECT id FROM friend_requests 
                WHERE ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?))
                AND status = 'pending'
            `).bind(userId, targetUser.id, targetUser.id, userId).first();

            if (existingRequest) {
                return new Response(JSON.stringify({ error: 'Friend request already sent' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Create friend request
            await env.DB.prepare(`
                INSERT INTO friend_requests (id, from_user_id, to_user_id)
                VALUES (?, ?, ?)
            `).bind(uuidv4(), userId, targetUser.id).run();

            return new Response(JSON.stringify({ message: 'Friend request sent!' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (action === 'accept_request') {
            // Accept friend request
            const request = await env.DB.prepare(
                'SELECT * FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = "pending"'
            ).bind(request_id, userId).first();

            if (!request) {
                return new Response(JSON.stringify({ error: 'Invalid request' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Update request status
            await env.DB.prepare(`
                UPDATE friend_requests 
                SET status = 'accepted', responded_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).bind(request_id).run();

            // Create friendship entries
            const friendshipId1 = uuidv4();
            const friendshipId2 = uuidv4();
            
            await env.DB.prepare(`
                INSERT INTO user_friends (id, user_id, friend_id, status, accepted_at)
                VALUES (?, ?, ?, 'accepted', CURRENT_TIMESTAMP)
            `).bind(friendshipId1, request.from_user_id, userId).run();

            await env.DB.prepare(`
                INSERT INTO user_friends (id, user_id, friend_id, status, accepted_at)
                VALUES (?, ?, ?, 'accepted', CURRENT_TIMESTAMP)
            `).bind(friendshipId2, userId, request.from_user_id).run();

            // Update friend counts
            await env.DB.prepare('UPDATE users SET total_friends = total_friends + 1 WHERE id = ?').bind(userId).run();
            await env.DB.prepare('UPDATE users SET total_friends = total_friends + 1 WHERE id = ?').bind(request.from_user_id).run();

            return new Response(JSON.stringify({ message: 'Friend request accepted!' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (action === 'decline_request') {
            await env.DB.prepare(`
                UPDATE friend_requests 
                SET status = 'declined', responded_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND to_user_id = ?
            `).bind(request_id, userId).run();

            return new Response(JSON.stringify({ message: 'Friend request declined' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Friends action error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}