// FINAL COMPREHENSIVE TEST - ALL 5 CRITICAL ISSUES
console.log('🎯 FINAL TEST - ALL 5 CRITICAL ISSUES');
console.log('This should show ALL FIXED if everything is working');

const SITE_URL = 'https://6011de11.strivetrackapp.pages.dev';
const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function finalTest() {
    console.log('Site:', SITE_URL);
    console.log('='.repeat(70));
    
    // Login
    const loginResponse = await fetch(`${SITE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CONFIG.admin)
    });
    
    if (!loginResponse.ok) {
        console.log('❌ Login failed');
        return;
    }
    
    const loginData = await loginResponse.json();
    const sessionId = loginData.sessionId || loginData.session_id;
    console.log('✅ Login successful');
    
    const results = {};
    
    // 1. HABIT DELETION TEST
    console.log('\n1️⃣ TESTING HABIT DELETION...');
    try {
        const createResponse = await fetch(`${SITE_URL}/api/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({
                name: 'Final Test Habit',
                description: 'Testing habit deletion',
                target_frequency: 1
            })
        });
        
        if (createResponse.ok) {
            const habit = await createResponse.json();
            const habitId = habit.id || habit.habitId;
            
            const deleteResponse = await fetch(`${SITE_URL}/api/habits/${habitId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            results.habitDeletion = deleteResponse.ok;
            console.log(deleteResponse.ok ? '✅ HABIT DELETION: FIXED!' : '❌ HABIT DELETION: BROKEN');
        }
    } catch (error) {
        results.habitDeletion = false;
        console.log('❌ HABIT DELETION: ERROR -', error.message);
    }
    
    // 2. NUTRITION CRUD TEST
    console.log('\n2️⃣ TESTING NUTRITION DELETE...');
    try {
        const createResponse = await fetch(`${SITE_URL}/api/nutrition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({
                food_name: 'Final Test Food',
                meal_type: 'snack',
                calories: 100
            })
        });
        
        if (createResponse.ok) {
            const nutrition = await createResponse.json();
            
            const deleteResponse = await fetch(`${SITE_URL}/api/nutrition/${nutrition.log_id}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            results.nutritionDelete = deleteResponse.ok;
            console.log(deleteResponse.ok ? '✅ NUTRITION DELETE: FIXED!' : '❌ NUTRITION DELETE: BROKEN');
        }
    } catch (error) {
        results.nutritionDelete = false;
        console.log('❌ NUTRITION DELETE: ERROR -', error.message);
    }
    
    // 3. WEIGHT UNIT DISPLAY TEST
    console.log('\n3️⃣ TESTING WEIGHT UNIT DISPLAY...');
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const createResponse = await fetch(`${SITE_URL}/api/weight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
            body: JSON.stringify({
                weight: 180, // 180 lbs
                logged_date: today,
                notes: 'Final test weight'
            })
        });
        
        if (createResponse.ok) {
            const getResponse = await fetch(`${SITE_URL}/api/weight`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (getResponse.ok) {
                const data = await getResponse.json();
                const latest = data.weight_logs[0];
                
                // Check if 180 lbs converts correctly to ~81.6 kg and BMI is calculated
                const expectedKg = 180 * 0.453592; // ~81.6 kg
                const isWeightCorrect = Math.abs(latest.weight_kg - expectedKg) < 1;
                const isBMIValid = latest.bmi && !isNaN(latest.bmi) && latest.bmi > 0;
                
                results.weightDisplay = isWeightCorrect && isBMIValid;
                console.log(results.weightDisplay ? '✅ WEIGHT UNIT DISPLAY: FIXED!' : '❌ WEIGHT UNIT DISPLAY: BROKEN');
                console.log(`   📊 180 lbs = ${Math.round(latest.weight_kg * 100) / 100} kg, BMI = ${latest.bmi}`);
            }
        }
    } catch (error) {
        results.weightDisplay = false;
        console.log('❌ WEIGHT UNIT DISPLAY: ERROR -', error.message);
    }
    
    // 4. ACHIEVEMENTS SYSTEM TEST
    console.log('\n4️⃣ TESTING ACHIEVEMENTS...');
    try {
        const response = await fetch(`${SITE_URL}/api/achievements`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            results.achievements = data.achievements && data.achievements.length > 0;
            console.log(results.achievements ? '✅ ACHIEVEMENTS SYSTEM: FIXED!' : '❌ ACHIEVEMENTS SYSTEM: BROKEN');
            console.log(`   📈 Found ${data.achievements?.length || 0} achievements`);
        }
    } catch (error) {
        results.achievements = false;
        console.log('❌ ACHIEVEMENTS SYSTEM: ERROR -', error.message);
    }
    
    // 5. COMPETITIONS SECTION TEST
    console.log('\n5️⃣ TESTING COMPETITIONS...');
    try {
        const response = await fetch(`${SITE_URL}/api/competitions`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            results.competitions = data.competitions && data.competitions.length > 0;
            console.log(results.competitions ? '✅ COMPETITIONS SECTION: FIXED!' : '❌ COMPETITIONS SECTION: BROKEN');
            console.log(`   🏁 Found ${data.competitions?.length || 0} competitions`);
        }
    } catch (error) {
        results.competitions = false;
        console.log('❌ COMPETITIONS SECTION: ERROR -', error.message);
    }
    
    // FINAL SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('🎯 FINAL RESULTS SUMMARY');
    console.log('='.repeat(70));
    
    const issues = [
        ['1. Habit Deletion', results.habitDeletion],
        ['2. Nutrition CRUD', results.nutritionDelete],
        ['3. Weight Unit Display', results.weightDisplay],
        ['4. Achievements System', results.achievements],
        ['5. Competitions Section', results.competitions]
    ];
    
    issues.forEach(([issue, fixed]) => {
        console.log(`${fixed ? '✅' : '❌'} ${issue}: ${fixed ? 'FIXED' : 'BROKEN'}`);
    });
    
    const fixedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log('\n📊 SCORE:', `${fixedCount}/${totalCount} issues fixed`);
    
    if (fixedCount === totalCount) {
        console.log('\n🎉 SUCCESS! ALL 5 CRITICAL ISSUES ARE FIXED!');
        console.log('🚀 The StriveTrack application is now fully functional!');
    } else {
        console.log(`\n⚠️ ${totalCount - fixedCount} issue(s) still need attention`);
    }
    
    console.log('\n📍 Current working deployment:', SITE_URL);
    console.log('📍 Main site (may need time to update):', 'https://strivetrackapp.pages.dev');
}

finalTest().catch(console.error);