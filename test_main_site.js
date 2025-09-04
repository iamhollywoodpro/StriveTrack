// Test the main strivetrackapp.pages.dev site to check if fixes are deployed
console.log('🔍 TESTING MAIN SITE: https://strivetrackapp.pages.dev');

const MAIN_SITE = 'https://strivetrackapp.pages.dev';
const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function testMainSite() {
    console.log('Testing main site for all 5 critical issues...\n');
    
    try {
        // Test login
        const loginResponse = await fetch(`${MAIN_SITE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_CONFIG.admin)
        });
        
        if (!loginResponse.ok) {
            console.log('❌ LOGIN FAILED on main site:', loginResponse.status);
            return;
        }
        
        const loginData = await loginResponse.json();
        const sessionId = loginData.sessionId || loginData.session_id;
        console.log('✅ LOGIN SUCCESSFUL on main site');
        
        // Test achievements (was broken before)
        console.log('\n🏆 TESTING ACHIEVEMENTS...');
        const achievementsResponse = await fetch(`${MAIN_SITE}/api/achievements`, {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Achievements status:', achievementsResponse.status);
        if (achievementsResponse.ok) {
            const data = await achievementsResponse.json();
            console.log(`✅ ACHIEVEMENTS WORKING - ${data.achievements?.length || 0} achievements`);
        } else {
            console.log('❌ ACHIEVEMENTS STILL BROKEN:', await achievementsResponse.text());
        }
        
        // Test competitions (was broken before)
        console.log('\n🏁 TESTING COMPETITIONS...');
        const competitionsResponse = await fetch(`${MAIN_SITE}/api/competitions`, {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Competitions status:', competitionsResponse.status);
        if (competitionsResponse.ok) {
            const data = await competitionsResponse.json();
            console.log(`✅ COMPETITIONS WORKING - ${data.competitions?.length || 0} competitions`);
        } else {
            console.log('❌ COMPETITIONS STILL BROKEN:', await competitionsResponse.text());
        }
        
        // Test if we can create and delete a habit
        console.log('\n🔄 TESTING HABIT DELETION...');
        const habitResponse = await fetch(`${MAIN_SITE}/api/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({ name: 'Test Main Site Habit', target_frequency: 1 })
        });
        
        if (habitResponse.ok) {
            const habit = await habitResponse.json();
            const habitId = habit.id || habit.habitId;
            
            if (habitId) {
                const deleteResponse = await fetch(`${MAIN_SITE}/api/habits/${habitId}`, {
                    method: 'DELETE',
                    headers: { 'x-session-id': sessionId }
                });
                
                console.log('Habit deletion status:', deleteResponse.status);
                console.log(deleteResponse.ok ? '✅ HABIT DELETION WORKING' : '❌ HABIT DELETION BROKEN');
            } else {
                console.log('❌ HABIT CREATION returned undefined ID');
            }
        }
        
        // Test weight tracking  
        console.log('\n⚖️ TESTING WEIGHT TRACKING...');
        const today = new Date().toISOString().split('T')[0];
        const weightResponse = await fetch(`${MAIN_SITE}/api/weight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({ weight: 175, logged_date: today })
        });
        
        if (weightResponse.ok) {
            const getWeightResponse = await fetch(`${MAIN_SITE}/api/weight`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (getWeightResponse.ok) {
                const weightData = await getWeightResponse.json();
                const latest = weightData.weight_logs?.[0];
                
                if (latest) {
                    console.log(`Weight entry: ${latest.weight_lbs} lbs = ${latest.weight_kg} kg, BMI: ${latest.bmi}`);
                    
                    // Check if conversion is correct (175 lbs ≈ 79.4 kg)
                    const expectedKg = 175 * 0.453592;
                    const isCorrect = Math.abs(latest.weight_kg - expectedKg) < 1;
                    console.log(isCorrect ? '✅ WEIGHT CONVERSION WORKING' : '❌ WEIGHT CONVERSION BROKEN');
                }
            }
        }
        
    } catch (error) {
        console.log('❌ ERROR testing main site:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 MAIN SITE TEST COMPLETE');
    console.log('If APIs are still returning 500 errors, the fixes need to be deployed to main site');
}

testMainSite().catch(console.error);