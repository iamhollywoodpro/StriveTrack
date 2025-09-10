// Check current state with correct credentials
const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';

async function checkCurrentState() {
    console.log('🔍 Checking current state with correct credentials...\n');
    
    // Test with correct login
    console.log('1. Testing login with iamhollywoodpro@protonmail.co...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: 'iamhollywoodpro@protonmail.co', 
            password: 'password@123' 
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.sessionId) {
        console.log('❌ Login failed:', loginData);
        return;
    }
    
    console.log('✅ Login successful with correct credentials');
    const sessionId = loginData.sessionId;
    
    // Check habits
    console.log('\n2. Checking habits...');
    const habitsResponse = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'x-session-id': sessionId }
    });
    const habitsData = await habitsResponse.json();
    console.log(`   - Found ${habitsData.habits?.length || 0} habits`);
    
    // Check achievements 
    console.log('\n3. Checking achievements...');
    const achievementsResponse = await fetch(`${BASE_URL}/api/achievements`, {
        headers: { 'x-session-id': sessionId }
    });
    const achievementsData = await achievementsResponse.json();
    console.log(`   - Found ${achievementsData.achievements?.length || 0} achievements`);
    console.log(`   - Expected: 40 achievements`);
    
    if (achievementsData.achievements && achievementsData.achievements.length > 0) {
        console.log(`   - Sample achievements:`);
        achievementsData.achievements.slice(0, 3).forEach((ach, i) => {
            console.log(`     ${i+1}. ${ach.name}`);
        });
    }
    
    // Check if user has admin access
    console.log('\n4. Checking user role...');
    console.log(`   - User role: ${loginData.user?.role || 'unknown'}`);
    
    console.log('\n📋 Issues to address:');
    if ((achievementsData.achievements?.length || 0) < 40) {
        console.log('❌ Missing achievements - need to restore all 40');
    }
    console.log('❌ Need to check add habit functionality');
    console.log('❌ Need to add Goals section');
}

checkCurrentState().catch(console.error);