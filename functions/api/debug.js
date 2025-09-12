// Emergency debug endpoint - trying different approaches

// Method 1: Modern export
export const onRequestGet = async (context) => {
    return new Response(JSON.stringify({
        status: "FUNCTIONS ARE WORKING!",
        method: "GET",
        timestamp: new Date().toISOString(),
        message: "If you see this JSON, the functions are deployed correctly"
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        }
    });
};

// Method 2: Alternative export style
export function onRequestPost(context) {
    return Response.json({
        status: "POST METHOD WORKING",
        method: "POST", 
        timestamp: new Date().toISOString(),
        message: "Functions deployment successful!"
    });
}