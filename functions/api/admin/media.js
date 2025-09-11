// Helper function to get user from session
async function getUserFromSession(sessionId, env) {
    if (!sessionId) return null;
    
    const session = await env.DB.prepare(`
        SELECT s.*, u.id as user_id, u.email, u.role, u.points
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
    `).bind(sessionId).first();
    
    if (!session) return null;
    
    return {
        id: session.user_id,
        email: session.email,
        role: session.role,
        points: session.points
    };
}

// Check if user is admin (iamhollywoodpro@protonmail.com only)
function isAdmin(user, env) {
    return user && user.role === 'admin' && user.email === 'iamhollywoodpro@protonmail.com';
}

// GET - List all user media (admin only)
export async function onRequestGet(context) {
    const { request, env } = context;
    const sessionId = request.headers.get('x-session-id');
    
    try {
        const user = await getUserFromSession(sessionId, env);
        
        if (!isAdmin(user, env)) {
            return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const media = await env.DB.prepare(`
                SELECT 
                    m.*,
                    u.email as userEmail,
                    u.username
                FROM media_uploads m
                JOIN users u ON m.user_id = u.id
                ORDER BY m.uploaded_at DESC
            `).all();
            
            return new Response(JSON.stringify({ media: media.results || [] }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (dbError) {
            // If media_uploads table doesn't exist, return empty array
            console.log('Media table query error:', dbError);
            return new Response(JSON.stringify({ media: [] }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }



    } catch (error) {
        console.error('Admin get media error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch media' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}