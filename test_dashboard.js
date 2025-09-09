// Test script to verify dashboard functionality
const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';

async function testLogin(email, password) {
    console.log(`Testing login for ${email}...`);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    console.log('Login response:', result);
    
    if (result.sessionId) {
        console.log(`✅ Login successful for ${email}`);
        return result.sessionId;
    } else {
        console.log(`❌ Login failed for ${email}:`, result.error || result.message);
        return null;
    }
}

async function testHabitsAPI(sessionId) {
    console.log('\nTesting /api/habits endpoint...');
    
    const response = await fetch(`${BASE_URL}/api/habits`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    
    const result = await response.json();
    console.log('Habits API response:', result);
    
    if (result.habits) {
        console.log(`✅ Habits API returned ${result.habits.length} habits`);
        result.habits.forEach((habit, index) => {
            console.log(`  ${index + 1}. ${habit.name} - ${habit.description}`);
        });
        return result.habits;
    } else {
        console.log('❌ Habits API failed:', result.error || result.message);
        return [];
    }
}

async function testWeeklyHabitsAPI(sessionId) {
    console.log('\nTesting /api/habits/weekly endpoint...');
    
    const response = await fetch(`${BASE_URL}/api/habits/weekly`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    
    const result = await response.json();
    console.log('Weekly habits API response:', result);
    
    if (result.habits) {
        console.log(`✅ Weekly habits API returned ${result.habits.length} habits with weekly data`);
        return result.habits;
    } else {
        console.log('❌ Weekly habits API failed:', result.error || result.message);
        return [];
    }
}

async function testAchievementsAPI(sessionId) {
    console.log('\nTesting /api/achievements endpoint...');
    
    const response = await fetch(`${BASE_URL}/api/achievements`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    
    const result = await response.json();
    console.log('Achievements API response:', result);
    
    if (result.achievements) {
        console.log(`✅ Achievements API returned ${result.achievements.length} achievements`);
        console.log(`  - Earned: ${result.stats.earned_achievements}/${result.stats.total_achievements}`);
        console.log(`  - Unlockable: ${result.stats.unlockable_count}`);
        return result.achievements;
    } else {
        console.log('❌ Achievements API failed:', result.error || result.message);
        return [];
    }
}

async function runTests() {
    try {
        console.log('🚀 Starting dashboard functionality tests...\n');
        
        // Test regular user login and dashboard
        const userSessionId = await testLogin('test@example.com', 'password123');
        if (userSessionId) {
            const habits = await testHabitsAPI(userSessionId);
            await testWeeklyHabitsAPI(userSessionId);
            await testAchievementsAPI(userSessionId);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Test admin login
        const adminSessionId = await testLogin('admin@example.com', 'password123');
        if (adminSessionId) {
            console.log('✅ Admin login successful - admin dashboard should be accessible');
        }
        
        console.log('\n🏁 Tests completed!');
        
    } catch (error) {
        console.error('❌ Test execution error:', error);
    }
}

runTests();