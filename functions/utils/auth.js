// Authentication utilities for StriveTrack

export async function getCurrentUser(request, env) {
    // Try to get session ID from header first, then from cookie
    let sessionId = request.headers.get('x-session-id');
    
    if (!sessionId) {
        // Try to get from cookie as fallback
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});
            sessionId = cookies.sessionId;
        }
    }
    
    if (!sessionId) {
        return null;
    }

    // Check if session exists and is valid
    const session = await env.DB.prepare(`
        SELECT s.*, u.id as user_id, u.email, u.role, u.points
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
    `).bind(sessionId).first();

    if (!session) {
        return null;
    }

    return {
        id: session.user_id,
        email: session.email,
        role: session.role,
        points: session.points
    };
}

export async function requireAuth(request, env) {
    const user = await getCurrentUser(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return user;
}

export async function requireAdmin(request, env) {
    const user = await getCurrentUser(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return user;
}

export async function createSession(userId, env) {
    const { generateSessionId } = await import('./id-generator.js');
    
    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await env.DB.prepare(`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (?, ?, ?)
    `).bind(sessionId, userId, expiresAt.toISOString()).run();

    return sessionId;
}

export async function deleteSession(sessionId, env) {
    if (!sessionId) return;
    
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?')
        .bind(sessionId).run();
}

export async function cleanupExpiredSessions(env) {
    // Clean up expired sessions
    await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
}