// Test the fixes for the remaining 3 issues
console.log('🔧 TESTING FIXES FOR REMAINING ISSUES');

const SITE_URL = 'https://6011de11.strivetrackapp.pages.dev'; // Use latest deployment with fixes
const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function testFixes() {
    console.log('Site:', SITE_URL);
    console.log('='.repeat(60));
    
    // Login first
    const loginResponse = await fetch(`${SITE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CONFIG.admin)
    });
    
    if (!loginResponse.ok) {
        console.log('❌ Login failed - cannot test other issues');
        return;
    }
    
    const loginData = await loginResponse.json();
    const sessionId = loginData.sessionId || loginData.session_id;
    console.log('✅ Login successful');
    
    // 1. Test habit creation and deletion (FIXED)
    console.log('\n1️⃣ TESTING HABIT DELETION (SHOULD BE FIXED)...');
    try {
        // Create a test habit first with proper parameters
        const createHabitResponse = await fetch(`${SITE_URL}/api/habits`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                name: 'Test Habit for Deletion Fix',
                description: 'Testing the deletion fix',
                target_frequency: 1,
                weekly_target: 7
            })
        });
        
        if (createHabitResponse.ok) {
            const result = await createHabitResponse.json();
            const habitId = result.id || result.habitId;
            console.log('✅ Created test habit with ID:', habitId);
            
            if (habitId) {
                // Now try to delete it
                const deleteResponse = await fetch(`${SITE_URL}/api/habits/${habitId}`, {
                    method: 'DELETE',
                    headers: { 'x-session-id': sessionId }
                });
                
                if (deleteResponse.ok) {
                    console.log('✅ HABIT DELETION WORKS - Issue 1 FIXED! 🎉');
                } else {
                    console.log('❌ Habit deletion still failed:', deleteResponse.status, await deleteResponse.text());
                }
            } else {
                console.log('❌ Habit ID still undefined');
            }
        } else {
            console.log('❌ Could not create test habit:', await createHabitResponse.text());
        }
    } catch (error) {
        console.log('❌ Habit test error:', error.message);
    }
    
    // 2. Test nutrition DELETE with correct URL pattern
    console.log('\n2️⃣ TESTING NUTRITION DELETE (SHOULD BE FIXED)...');
    try {
        // Create a test nutrition entry
        const createNutritionResponse = await fetch(`${SITE_URL}/api/nutrition`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                food_name: 'Test Apple Fix',
                meal_type: 'snack',
                calories: 95
            })
        });
        
        if (createNutritionResponse.ok) {
            const nutrition = await createNutritionResponse.json();
            const nutritionId = nutrition.log_id;
            console.log('✅ Created test nutrition entry:', nutritionId);
            
            // Now try to delete it using the correct endpoint pattern
            const deleteResponse = await fetch(`${SITE_URL}/api/nutrition/${nutritionId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            console.log('Delete response status:', deleteResponse.status);
            
            if (deleteResponse.ok) {
                console.log('✅ NUTRITION DELETE WORKS - Issue 2 FIXED! 🎉');
            } else {
                console.log('❌ Nutrition deletion still failed:', deleteResponse.status, await deleteResponse.text());
            }
        } else {
            console.log('❌ Could not create test nutrition:', await createNutritionResponse.text());
        }
    } catch (error) {
        console.log('❌ Nutrition test error:', error.message);
    }
    
    // 3. Test weight tracking with correct parameters
    console.log('\n3️⃣ TESTING WEIGHT TRACKING (SHOULD BE FIXED)...');
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create a test weight entry with correct parameters
        const weightResponse = await fetch(`${SITE_URL}/api/weight`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                weight: 200, // 200 lbs
                logged_date: today,
                notes: 'Test weight for unit display fix'
            })
        });
        
        if (weightResponse.ok) {
            const result = await weightResponse.json();
            console.log('✅ Created weight entry');
            
            // Check that it displays correctly
            const getWeightResponse = await fetch(`${SITE_URL}/api/weight`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (getWeightResponse.ok) {
                const weightData = await getWeightResponse.json();
                const logs = weightData.weight_logs || [];
                
                if (logs.length > 0) {
                    const entry = logs[0];
                    console.log('📊 Latest weight entry:', {
                        weight_lbs: entry.weight_lbs,
                        weight_kg: Math.round(entry.weight_kg * 100) / 100,
                        bmi: entry.bmi,
                        logged_date: entry.logged_date
                    });
                    
                    // Check if 200 lbs is properly converted and BMI calculated
                    const expectedKg = 200 * 0.453592; // ~90.7 kg
                    const isWeightCorrect = Math.abs(entry.weight_kg - expectedKg) < 1;
                    const isBMIValid = entry.bmi && entry.bmi !== '--' && !isNaN(entry.bmi) && entry.bmi > 0;
                    
                    if (isWeightCorrect && isBMIValid) {
                        console.log('✅ WEIGHT UNIT DISPLAY WORKS - Issue 3 FIXED! 🎉');
                        console.log(`   200 lbs = ${Math.round(entry.weight_kg * 100) / 100} kg ✅`);
                        console.log(`   BMI = ${entry.bmi} ✅`);
                    } else {
                        console.log('❌ Weight display still has issues:');
                        console.log(`   Weight conversion: ${isWeightCorrect ? '✅' : '❌'}`);
                        console.log(`   BMI calculation: ${isBMIValid ? '✅' : '❌'} (BMI: ${entry.bmi})`);
                    }
                } else {
                    console.log('❌ No weight data returned');
                }
            }
        } else {
            console.log('❌ Could not create weight entry:', await weightResponse.text());
        }
    } catch (error) {
        console.log('❌ Weight test error:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL TEST RESULTS');
    console.log('If all 3 tests show "FIXED! 🎉" then all 5 original issues are resolved');
}

testFixes().catch(console.error);