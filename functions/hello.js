// Simplest possible function test
export async function onRequestGet() {
    return new Response(JSON.stringify({ 
        message: "Hello from Cloudflare Pages Functions!",
        timestamp: new Date().toISOString() 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}