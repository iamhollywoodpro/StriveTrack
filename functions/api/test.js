// Simple test endpoint to verify API functionality
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Test 1: Basic response
        const response = {
            status: 'API Working',
            timestamp: new Date().toISOString(),
            environment: env.ENVIRONMENT || 'unknown'
        };

        // Test 2: Database connectivity
        if (env.DB) {
            try {
                const dbTest = await env.DB.prepare('SELECT 1 as test').first();
                response.database = 'Connected';
                response.dbTest = dbTest;
            } catch (dbError) {
                response.database = 'Error: ' + dbError.message;
            }
        } else {
            response.database = 'No DB binding';
        }

        // Test 3: R2 storage
        if (env.MEDIA_BUCKET) {
            response.storage = 'R2 Binding Available';
        } else {
            response.storage = 'No R2 binding';
        }

        return new Response(JSON.stringify(response, null, 2), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Test endpoint failed',
            message: error.message,
            stack: error.stack
        }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    return new Response(JSON.stringify({
        message: 'POST method working',
        body: await context.request.text()
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}