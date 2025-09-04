// Test the latest deployment URL to verify all fixes
console.log('🔍 TESTING LATEST DEPLOYMENT: https://6e2d0453.strivetrackapp.pages.dev');

const LATEST_URL = 'https://6e2d0453.strivetrackapp.pages.dev';
const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function testLatestDeployment() {
    console.log('Testing latest deployment for all 5 critical issues...\n');
    
    try {
        // Test login
        const loginResponse = await fetch(`${LATEST_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_CONFIG.admin)
        });
        
        if (!loginResponse.ok) {
            console.log('❌ LOGIN FAILED:', loginResponse.status);
            return;
        }
        
        const loginData = await loginResponse.json();
        const sessionId = loginData.sessionId || loginData.session_id;
        console.log('✅ LOGIN SUCCESSFUL');
        
        const results = [];
        
        // Test achievements
        console.log('\n🏆 TESTING ACHIEVEMENTS...');
        const achievementsResponse = await fetch(`${LATEST_URL}/api/achievements`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (achievementsResponse.ok) {
            const data = await achievementsResponse.json();
            console.log(`✅ ACHIEVEMENTS: ${data.achievements?.length || 0} found`);
            results.push('✅ Achievements: FIXED');
        } else {
            console.log('❌ ACHIEVEMENTS BROKEN:', achievementsResponse.status);
            results.push('❌ Achievements: BROKEN');
        }
        
        // Test competitions
        console.log('\n🏁 TESTING COMPETITIONS...');
        const competitionsResponse = await fetch(`${LATEST_URL}/api/competitions`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (competitionsResponse.ok) {
            const data = await competitionsResponse.json();
            console.log(`✅ COMPETITIONS: ${data.competitions?.length || 0} found`);
            results.push('✅ Competitions: FIXED');
        } else {
            console.log('❌ COMPETITIONS BROKEN:', competitionsResponse.status);
            results.push('❌ Competitions: BROKEN');
        }
        
        // Test habit deletion
        console.log('\n🔄 TESTING HABIT DELETION...');
        const habitResponse = await fetch(`${LATEST_URL}/api/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({ name: 'Test Deletion', target_frequency: 1 })
        });
        
        if (habitResponse.ok) {
            const habit = await habitResponse.json();
            const habitId = habit.id || habit.habitId;
            
            if (habitId) {
                const deleteResponse = await fetch(`${LATEST_URL}/api/habits/${habitId}`, {
                    method: 'DELETE',
                    headers: { 'x-session-id': sessionId }
                });
                
                if (deleteResponse.ok) {
                    console.log('✅ HABIT DELETION WORKING');
                    results.push('✅ Habit Deletion: FIXED');
                } else {
                    console.log('❌ HABIT DELETION BROKEN');
                    results.push('❌ Habit Deletion: BROKEN');
                }
            } else {
                console.log('❌ HABIT ID undefined');
                results.push('❌ Habit Deletion: BROKEN');
            }
        }
        
        // Test nutrition deletion
        console.log('\n🍎 TESTING NUTRITION DELETION...');
        const nutritionResponse = await fetch(`${LATEST_URL}/api/nutrition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({ food_name: 'Test Food', meal_type: 'snack', calories: 50 })
        });
        
        if (nutritionResponse.ok) {
            const nutrition = await nutritionResponse.json();
            const deleteResponse = await fetch(`${LATEST_URL}/api/nutrition/${nutrition.log_id}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (deleteResponse.ok) {
                console.log('✅ NUTRITION DELETION WORKING');
                results.push('✅ Nutrition Delete: FIXED');
            } else {
                console.log('❌ NUTRITION DELETION BROKEN');
                results.push('❌ Nutrition Delete: BROKEN');
            }
        }
        
        // Test weight conversion
        console.log('\n⚖️ TESTING WEIGHT CONVERSION...');
        const today = new Date().toISOString().split('T')[0];
        const weightResponse = await fetch(`${LATEST_URL}/api/weight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({ weight: 160, logged_date: today })
        });
        
        if (weightResponse.ok) {
            const getWeightResponse = await fetch(`${LATEST_URL}/api/weight`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (getWeightResponse.ok) {
                const weightData = await getWeightResponse.json();
                const latest = weightData.weight_logs?.[0];
                
                if (latest) {
                    const expectedKg = 160 * 0.453592; // ~72.6 kg
                    const isCorrect = Math.abs(latest.weight_kg - expectedKg) < 1;
                    
                    console.log(`Weight: ${latest.weight_lbs} lbs = ${latest.weight_kg} kg, BMI: ${latest.bmi}`);
                    
                    if (isCorrect && latest.bmi && latest.bmi > 0) {
                        console.log('✅ WEIGHT CONVERSION WORKING');
                        results.push('✅ Weight Conversion: FIXED');
                    } else {
                        console.log('❌ WEIGHT CONVERSION BROKEN');
                        results.push('❌ Weight Conversion: BROKEN');
                    }
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 LATEST DEPLOYMENT TEST RESULTS:');
        console.log('='.repeat(60));
        results.forEach(result => console.log(result));
        
        const fixedCount = results.filter(r => r.includes('✅')).length;
        console.log(`\n📊 ${fixedCount}/5 issues fixed on latest deployment`);
        
        if (fixedCount === 5) {
            console.log('\n🎉 ALL FIXES WORKING ON LATEST DEPLOYMENT!');
            console.log('⏳ Main site should update shortly to this version');
        }
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }
}

testLatestDeployment().catch(console.error);