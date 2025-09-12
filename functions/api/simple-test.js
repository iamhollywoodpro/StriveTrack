// Ultra-simple test without any imports or dependencies
export async function onRequestGet() {
    return Response.json({
        message: "Simple API test working!",
        timestamp: new Date().toISOString(),
        method: 'GET'
    });
}

export async function onRequestPost() {
    return Response.json({
        message: "POST method working!",
        timestamp: new Date().toISOString(),
        method: 'POST'
    });
}