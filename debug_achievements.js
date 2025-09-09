// Debug script to check achievements API response structure
const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';

async function debugAchievements() {
    console.log('🏆 Debugging achievements display issue...\n');
    
    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: 'test@example.com', 
            password: 'password123' 
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.sessionId) {
        console.log('❌ Login failed');
        return;
    }
    
    console.log('✅ Login successful');
    const sessionId = loginData.sessionId;
    
    // Test achievements API
    console.log('\n🏆 Testing /api/achievements...');
    const response = await fetch(`${BASE_URL}/api/achievements`, {
        headers: { 'x-session-id': sessionId }
    });
    
    const data = await response.json();
    
    console.log('\nResponse structure:');
    console.log('- Status:', response.status);
    console.log('- Has achievements array:', !!data.achievements);
    console.log('- Achievements count:', data.achievements?.length || 0);
    console.log('- Has stats:', !!data.stats);
    console.log('- Has grouped_achievements:', !!data.grouped_achievements);
    
    if (data.achievements && data.achievements.length > 0) {
        console.log('\nFirst achievement structure:');
        const first = data.achievements[0];
        console.log(JSON.stringify(first, null, 2));
    }
    
    if (data.grouped_achievements) {
        console.log('\nGrouped achievements keys:', Object.keys(data.grouped_achievements));
    } else {
        console.log('\n❌ Missing grouped_achievements - this might be the issue!');
        console.log('The displayAchievements() function expects data.grouped_achievements[category.key]');
        console.log('But the API is only returning a flat achievements array');
    }
    
    console.log('\nStats:', data.stats);
}

debugAchievements().catch(console.error);