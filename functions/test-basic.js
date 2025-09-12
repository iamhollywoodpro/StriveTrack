// Ultra-minimal function with zero imports or dependencies
export function onRequestGet() {
    return new Response('{"message": "BASIC FUNCTION WORKS!", "timestamp": "' + new Date().toISOString() + '"}', {
        status: 200,
        headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    });
}