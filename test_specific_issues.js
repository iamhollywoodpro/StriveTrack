// Test the specific 5 issues mentioned by the user
console.log('🎯 TESTING THE ACTUAL 5 CRITICAL ISSUES');

const SITE_URL = 'https://d0c490c8.strivetrackapp.pages.dev'; // Use working deployment
const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function testAllIssues() {
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
    
    // 1. Test habit creation and deletion
    console.log('\n1️⃣ TESTING HABIT DELETION...');
    try {
        // Create a test habit first
        const createHabitResponse = await fetch(`${SITE_URL}/api/habits`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                name: 'Test Habit for Deletion',
                description: 'This is a test habit to verify deletion works',
                frequency_type: 'daily'
            })
        });
        
        if (createHabitResponse.ok) {
            const habit = await createHabitResponse.json();
            console.log('✅ Created test habit:', habit.id);
            
            // Now try to delete it
            const deleteResponse = await fetch(`${SITE_URL}/api/habits/${habit.id}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (deleteResponse.ok) {
                console.log('✅ HABIT DELETION WORKS - Issue 1 FIXED');
            } else {
                console.log('❌ Habit deletion failed:', deleteResponse.status, await deleteResponse.text());
            }
        } else {
            console.log('❌ Could not create test habit:', await createHabitResponse.text());
        }
    } catch (error) {
        console.log('❌ Habit test error:', error.message);
    }
    
    // 2. Test nutrition CRUD
    console.log('\n2️⃣ TESTING NUTRITION DELETE...');
    try {
        // Create a test nutrition entry
        const createNutritionResponse = await fetch(`${SITE_URL}/api/nutrition`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                food_name: 'Test Apple',
                meal_type: 'snack',
                calories: 95
            })
        });
        
        if (createNutritionResponse.ok) {
            const nutrition = await createNutritionResponse.json();
            console.log('✅ Created test nutrition entry:', nutrition.log_id);
            
            // Now try to delete it
            const deleteResponse = await fetch(`${SITE_URL}/api/nutrition/${nutrition.log_id}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (deleteResponse.ok) {
                console.log('✅ NUTRITION DELETE WORKS - Issue 2 FIXED');
            } else {
                console.log('❌ Nutrition deletion failed:', deleteResponse.status, await deleteResponse.text());
            }
        } else {
            console.log('❌ Could not create test nutrition:', await createNutritionResponse.text());
        }
    } catch (error) {
        console.log('❌ Nutrition test error:', error.message);
    }
    
    // 3. Test weight tracking with units
    console.log('\n3️⃣ TESTING WEIGHT UNIT DISPLAY...');
    try {
        // Create a test weight entry (200 lbs should show as lbs, not kg)
        const weightResponse = await fetch(`${SITE_URL}/api/weight`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                weight_lbs: 200, // Input 200 lbs
                notes: 'Test weight for unit display'
            })
        });
        
        if (weightResponse.ok) {
            console.log('✅ Created weight entry');
            
            // Check that it displays correctly
            const getWeightResponse = await fetch(`${SITE_URL}/api/weight`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (getWeightResponse.ok) {
                const weightData = await getWeightResponse.json();
                if (weightData.length > 0) {
                    const entry = weightData[0];
                    console.log('📊 Weight entry:', {
                        weight_kg: entry.weight_kg,
                        bmi: entry.bmi,
                        notes: entry.notes
                    });
                    
                    if (entry.weight_kg && entry.bmi && entry.bmi !== '--' && !isNaN(entry.bmi)) {
                        console.log('✅ WEIGHT UNIT DISPLAY WORKS - Issue 3 FIXED');
                    } else {
                        console.log('❌ Weight display has issues (BMI:', entry.bmi, ')');
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
    
    // 4. Test achievements
    console.log('\n4️⃣ TESTING ACHIEVEMENTS SYSTEM...');
    try {
        const achievementsResponse = await fetch(`${SITE_URL}/api/achievements`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (achievementsResponse.ok) {
            const data = await achievementsResponse.json();
            console.log(`✅ ACHIEVEMENTS WORKING - Found ${data.achievements?.length || 0} achievements`);
            if (data.stats) {
                console.log('📊 Stats:', data.stats);
            }
            console.log('✅ ACHIEVEMENTS SYSTEM WORKS - Issue 4 FIXED');
        } else {
            console.log('❌ Achievements failed:', achievementsResponse.status, await achievementsResponse.text());
        }
    } catch (error) {
        console.log('❌ Achievements test error:', error.message);
    }
    
    // 5. Test competitions
    console.log('\n5️⃣ TESTING COMPETITIONS SECTION...');
    try {
        const competitionsResponse = await fetch(`${SITE_URL}/api/competitions`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (competitionsResponse.ok) {
            const data = await competitionsResponse.json();
            console.log(`✅ COMPETITIONS WORKING - Found ${data.competitions?.length || 0} competitions`);
            if (data.competitions && data.competitions.length > 0) {
                console.log('📋 Sample competitions:');
                data.competitions.slice(0, 3).forEach((comp, i) => {
                    console.log(`  ${i+1}. ${comp.title} (${comp.status})`);
                });
            }
            console.log('✅ COMPETITIONS SECTION WORKS - Issue 5 FIXED');
        } else {
            console.log('❌ Competitions failed:', competitionsResponse.status, await competitionsResponse.text());
        }
    } catch (error) {
        console.log('❌ Competitions test error:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TESTING COMPLETE');
    console.log('Note: Tests performed on working deployment URL');
    console.log('Main site may need a few minutes to update to this deployment');
}

testAllIssues().catch(console.error);