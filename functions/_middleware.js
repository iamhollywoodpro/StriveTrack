// StriveTrack Cloudflare Pages Middleware - SIMPLIFIED FOR DEBUGGING

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    console.log('🔧 Middleware executing for:', url.pathname);

    // Add CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
        'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 204,
            headers: corsHeaders 
        });
    }

    // SIMPLIFIED: Skip database initialization for now to avoid import issues
    console.log('⏭️ Skipping database initialization for debugging');

    // Get response from the function
    const response = await next();

    console.log('📤 Response status:', response.status);

    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

async function initializeDatabase(env) {
    // Check if admin user exists, create if not
    try {
        const adminCheck = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(env.ADMIN_EMAIL).first();

        if (!adminCheck) {
            const bcrypt = await import('bcryptjs');
            const { generateUserId } = await import('./utils/id-generator.js');
            
            const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
            const adminId = generateUserId();

            await env.DB.prepare(`
                INSERT INTO users (id, email, password_hash, role, points)
                VALUES (?, ?, ?, 'admin', 0)
            `).bind(adminId, env.ADMIN_EMAIL, hashedPassword).run();
            
            console.log('Created admin user:', env.ADMIN_EMAIL);
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
        // If there's an error, it might be that tables don't exist yet
        // The schema should be applied manually via wrangler d1 execute
    }
}