// Debug script to find exact cause of API 500 errors
console.log('🔍 DEBUGGING API ERRORS');

const TEST_CONFIG = {
    site: 'https://strivetrackapp.pages.dev',
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

// Login to get session
async function login() {
    const response = await fetch(`${TEST_CONFIG.site}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CONFIG.admin)
    });
    
    if (response.ok) {
        const data = await response.json();
        console.log('✅ Login successful, session:', data.sessionId?.substring(0, 8) + '...');
        return data.sessionId || data.session_id;
    } else {
        console.log('❌ Login failed:', response.status, await response.text());
        return null;
    }
}

// Debug achievements API
async function debugAchievements(sessionId) {
    console.log('\n🏆 DEBUGGING ACHIEVEMENTS API...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.site}/api/achievements`, {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('Response body (first 500 chars):', text.substring(0, 500));
        
        if (response.status === 500) {
            console.log('❌ 500 error - likely an issue in the achievements API logic');
            
            // Try to parse as JSON to see error details
            try {
                const json = JSON.parse(text);
                console.log('Error details:', json);
            } catch (e) {
                console.log('Response is not JSON, raw text:', text);
            }
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

// Debug competitions API
async function debugCompetitions(sessionId) {
    console.log('\n🏁 DEBUGGING COMPETITIONS API...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.site}/api/competitions`, {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('Response body (first 500 chars):', text.substring(0, 500));
        
        if (response.status === 500) {
            console.log('❌ 500 error - likely an issue in the competitions API logic');
            
            try {
                const json = JSON.parse(text);
                console.log('Error details:', json);
            } catch (e) {
                console.log('Response is not JSON, raw text:', text);
            }
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

// Debug user/session to verify auth is working
async function debugUserSession(sessionId) {
    console.log('\n👤 DEBUGGING USER SESSION...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.site}/api/user/profile`, {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('User profile response status:', response.status);
        
        if (response.ok) {
            const user = await response.json();
            console.log('✅ User session working, user:', {
                id: user.id?.substring(0, 8) + '...',
                email: user.email,
                name: user.name || 'unnamed'
            });
            return true;
        } else {
            console.log('❌ User session issue:', response.status, await response.text());
            return false;
        }
    } catch (error) {
        console.log('❌ User session error:', error.message);
        return false;
    }
}

// Test a simple API that should work
async function testSimpleAPI(sessionId) {
    console.log('\n📋 TESTING SIMPLE API (habits)...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.site}/api/habits`, {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Habits API status:', response.status);
        
        if (response.ok) {
            const habits = await response.json();
            console.log('✅ Habits API working, found', habits.length || 0, 'habits');
        } else {
            console.log('❌ Habits API issue:', response.status, await response.text());
        }
    } catch (error) {
        console.log('❌ Habits API error:', error.message);
    }
}

// Main debug function
async function runDebug() {
    console.log('Starting API debugging...\n');
    
    const sessionId = await login();
    if (!sessionId) {
        console.log('❌ Cannot proceed without session');
        return;
    }
    
    // Test order: simple APIs first, then problematic ones
    await debugUserSession(sessionId);
    await testSimpleAPI(sessionId);
    await debugAchievements(sessionId);
    await debugCompetitions(sessionId);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 SUMMARY: The issues are in achievements and competitions APIs');
    console.log('Both are returning 500 errors despite database having data');
    console.log('Need to check the Function code logic for bugs');
}

runDebug().catch(console.error);