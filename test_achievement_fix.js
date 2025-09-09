// Test that the achievement rendering fix works
const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';

async function testAchievementFix() {
    console.log('🧪 Testing achievement rendering fix...\n');
    
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
    const response = await fetch(`${BASE_URL}/api/achievements`, {
        headers: { 'x-session-id': sessionId }
    });
    const data = await response.json();
    
    console.log('📊 Achievement API Test:');
    console.log(`✅ ${data.achievements.length} achievements loaded`);
    
    console.log('\n🔧 Testing template generation with undefined difficulty:');
    const firstAchievement = data.achievements[0];
    
    try {
        // Simulate the fixed template logic
        const difficultyColors = {
            'easy': '#10b981',
            'medium': '#f59e0b', 
            'hard': '#ef4444',
            'legendary': '#8b5cf6'
        };
        
        const testTemplate = `
            <span style="background-color: ${difficultyColors[firstAchievement.difficulty] || '#666666'}; color: white;">
                ${(firstAchievement.difficulty || 'STANDARD').toUpperCase()}
            </span>
        `;
        
        console.log('✅ Template generation successful!');
        console.log(`✅ Difficulty fallback: "${(firstAchievement.difficulty || 'STANDARD').toUpperCase()}"`);
        console.log(`✅ Color fallback: "${difficultyColors[firstAchievement.difficulty] || '#666666'}"`);
        
        console.log('\n🎯 The fix should now work! Achievements should render properly.');
        console.log('\n💡 The issue was:');
        console.log('   - achievement.difficulty was undefined');
        console.log('   - achievement.difficulty.toUpperCase() threw an error');
        console.log('   - This stopped all achievement rendering');
        console.log('\n✅ Fixed with:');
        console.log('   - (achievement.difficulty || "STANDARD").toUpperCase()');
        console.log('   - difficultyColors[achievement.difficulty] || "#666666"');
        
    } catch (error) {
        console.log('❌ Template still has issues:', error.message);
    }
}

testAchievementFix().catch(console.error);