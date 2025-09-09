// Debug script to check habits API responses
const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';

async function debugHabits() {
    console.log('🔍 Debugging habits display issue...\n');
    
    // First login to get session
    console.log('1. Logging in...');
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
        console.log('❌ Login failed:', loginData);
        return;
    }
    
    console.log('✅ Login successful, sessionId:', loginData.sessionId);
    const sessionId = loginData.sessionId;
    
    // Test regular habits API
    console.log('\n2. Testing /api/habits...');
    const habitsResponse = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'x-session-id': sessionId }
    });
    const habitsData = await habitsResponse.json();
    
    console.log('Regular habits response:');
    console.log(`- Status: ${habitsResponse.status}`);
    console.log(`- Habits count: ${habitsData.habits?.length || 0}`);
    if (habitsData.habits?.length > 0) {
        console.log('- First habit:', habitsData.habits[0].name);
    }
    
    // Test weekly habits API
    console.log('\n3. Testing /api/habits/weekly...');
    const weeklyResponse = await fetch(`${BASE_URL}/api/habits/weekly`, {
        headers: { 'x-session-id': sessionId }
    });
    const weeklyData = await weeklyResponse.json();
    
    console.log('Weekly habits response:');
    console.log(`- Status: ${weeklyResponse.status}`);
    console.log(`- Habits count: ${weeklyData.habits?.length || 0}`);
    if (weeklyData.habits?.length > 0) {
        console.log('- First habit:', weeklyData.habits[0].name);
        console.log('- Has weekStart:', !!weeklyData.habits[0].weekStart);
        console.log('- Has completedDays:', !!weeklyData.habits[0].completedDays);
    }
    
    // Check specific container elements
    console.log('\n4. Frontend debugging (if we could access DOM):');
    console.log('The issue is likely that:');
    console.log('- showSection("habits") calls loadWeeklyHabits()');
    console.log('- loadWeeklyHabits() calls displayWeeklyHabits()');  
    console.log('- displayWeeklyHabits() calls createWeeklyHabitElement()');
    console.log('');
    console.log('Potential fixes:');
    console.log('1. Change showSection("habits") to call loadHabits() instead of loadWeeklyHabits()');
    console.log('2. Or fix displayWeeklyHabits() to handle empty/missing data correctly');
    console.log('3. Or ensure weekly API returns proper weekly data structure');
}

debugHabits().catch(console.error);