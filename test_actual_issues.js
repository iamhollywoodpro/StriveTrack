// Comprehensive test to verify the actual state of the 5 critical issues
// This will test the REAL functionality on the live site

const TEST_CONFIG = {
    site: 'https://strivetrackapp.pages.dev',
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

console.log('🔍 TESTING ACTUAL ISSUES ON LIVE SITE');
console.log('Site:', TEST_CONFIG.site);

// Test 1: Login and access dashboard
async function testLogin() {
    console.log('\n1️⃣ TESTING LOGIN...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.site}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_CONFIG.admin)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login successful');
            return data.sessionId || data.session_id;
        } else {
            console.log('❌ Login failed:', response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return null;
    }
}

// Test 2: Check if habit deletion works
async function testHabitDeletion(sessionId) {
    console.log('\n2️⃣ TESTING HABIT DELETION...');
    
    if (!sessionId) {
        console.log('❌ No session - cannot test habit deletion');
        return false;
    }
    
    try {
        // First try to get habits
        const habitsResponse = await fetch(`${TEST_CONFIG.site}/api/habits`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (habitsResponse.ok) {
            const habits = await habitsResponse.json();
            console.log('📊 Found', habits.length || 0, 'habits');
            
            if (habits.length > 0) {
                // Try to delete the first habit
                const habitId = habits[0].id;
                const deleteResponse = await fetch(`${TEST_CONFIG.site}/api/habits/${habitId}`, {
                    method: 'DELETE',
                    headers: { 'x-session-id': sessionId }
                });
                
                if (deleteResponse.ok) {
                    console.log('✅ Habit deletion endpoint works');
                    return true;
                } else {
                    console.log('❌ Habit deletion failed:', deleteResponse.status);
                    return false;
                }
            } else {
                console.log('⚠️ No habits to test deletion');
                return 'no_data';
            }
        } else {
            console.log('❌ Cannot fetch habits:', habitsResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Habit deletion test error:', error.message);
        return false;
    }
}

// Test 3: Check nutrition CRUD operations
async function testNutritionCRUD(sessionId) {
    console.log('\n3️⃣ TESTING NUTRITION CRUD...');
    
    if (!sessionId) {
        console.log('❌ No session - cannot test nutrition');
        return false;
    }
    
    try {
        // Check if nutrition API exists
        const nutritionResponse = await fetch(`${TEST_CONFIG.site}/api/nutrition`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (nutritionResponse.ok) {
            const nutrition = await nutritionResponse.json();
            console.log('📊 Found', nutrition.length || 0, 'nutrition entries');
            
            // Check if DELETE endpoint exists
            if (nutrition.length > 0) {
                const entryId = nutrition[0].id;
                const deleteResponse = await fetch(`${TEST_CONFIG.site}/api/nutrition/${entryId}`, {
                    method: 'DELETE',
                    headers: { 'x-session-id': sessionId }
                });
                
                if (deleteResponse.status === 404) {
                    console.log('❌ Nutrition DELETE endpoint missing (404)');
                    return false;
                } else if (deleteResponse.ok) {
                    console.log('✅ Nutrition DELETE endpoint exists');
                    return true;
                } else {
                    console.log('❌ Nutrition DELETE failed:', deleteResponse.status);
                    return false;
                }
            } else {
                console.log('⚠️ No nutrition entries to test deletion');
                return 'no_data';
            }
        } else {
            console.log('❌ Cannot fetch nutrition:', nutritionResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Nutrition test error:', error.message);
        return false;
    }
}

// Test 4: Check weight tracking with units
async function testWeightTracking(sessionId) {
    console.log('\n4️⃣ TESTING WEIGHT TRACKING...');
    
    if (!sessionId) {
        console.log('❌ No session - cannot test weight tracking');
        return false;
    }
    
    try {
        const weightResponse = await fetch(`${TEST_CONFIG.site}/api/weight`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (weightResponse.ok) {
            const weightData = await weightResponse.json();
            console.log('📊 Found', weightData.length || 0, 'weight entries');
            
            // Check if there are any weight entries with proper units
            if (weightData.length > 0) {
                const entry = weightData[0];
                console.log('📝 Sample entry:', {
                    weight_kg: entry.weight_kg,
                    bmi: entry.bmi,
                    logged_at: entry.logged_at
                });
                
                if (entry.weight_kg && entry.bmi && entry.bmi !== '--') {
                    console.log('✅ Weight data appears properly formatted');
                    return true;
                } else {
                    console.log('❌ Weight data has issues (BMI: ' + entry.bmi + ')');
                    return false;
                }
            } else {
                console.log('⚠️ No weight entries to check');
                return 'no_data';
            }
        } else {
            console.log('❌ Cannot fetch weight data:', weightResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Weight tracking test error:', error.message);
        return false;
    }
}

// Test 5: Check achievements system
async function testAchievements(sessionId) {
    console.log('\n5️⃣ TESTING ACHIEVEMENTS...');
    
    if (!sessionId) {
        console.log('❌ No session - cannot test achievements');
        return false;
    }
    
    try {
        const achievementsResponse = await fetch(`${TEST_CONFIG.site}/api/achievements`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (achievementsResponse.ok) {
            const achievements = await achievementsResponse.json();
            console.log('📊 Found', achievements.length || 0, 'achievements');
            
            if (achievements.length > 0) {
                console.log('✅ Achievements system has data');
                return true;
            } else {
                console.log('❌ No achievements found');
                return false;
            }
        } else {
            console.log('❌ Cannot fetch achievements:', achievementsResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Achievements test error:', error.message);
        return false;
    }
}

// Test 6: Check competitions
async function testCompetitions(sessionId) {
    console.log('\n6️⃣ TESTING COMPETITIONS...');
    
    if (!sessionId) {
        console.log('❌ No session - cannot test competitions');
        return false;
    }
    
    try {
        const competitionsResponse = await fetch(`${TEST_CONFIG.site}/api/competitions`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (competitionsResponse.ok) {
            const competitions = await competitionsResponse.json();
            console.log('📊 Found', competitions.length || 0, 'competitions');
            
            if (competitions.length > 0) {
                console.log('✅ Competitions system has data');
                competitions.forEach((comp, i) => {
                    console.log(`  ${i+1}. ${comp.title || comp.name} (${comp.status})`);
                });
                return true;
            } else {
                console.log('❌ No competitions found');
                return false;
            }
        } else {
            console.log('❌ Cannot fetch competitions:', competitionsResponse.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Competitions test error:', error.message);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE LIVE SITE TESTING...');
    console.log('='.repeat(60));
    
    const sessionId = await testLogin();
    
    const results = {
        login: !!sessionId,
        habitDeletion: await testHabitDeletion(sessionId),
        nutritionCRUD: await testNutritionCRUD(sessionId),
        weightTracking: await testWeightTracking(sessionId),
        achievements: await testAchievements(sessionId),
        competitions: await testCompetitions(sessionId)
    };
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS:');
    console.log('='.repeat(60));
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result === true ? '✅' : 
                      result === 'no_data' ? '⚠️' : '❌';
        const message = result === true ? 'WORKING' :
                       result === 'no_data' ? 'NO DATA TO TEST' : 'BROKEN';
        console.log(`${status} ${test.toUpperCase()}: ${message}`);
    });
    
    const workingCount = Object.values(results).filter(r => r === true).length;
    const totalCount = Object.keys(results).length;
    
    console.log('\n📈 SUMMARY:');
    console.log(`${workingCount}/${totalCount} systems working properly`);
    
    if (workingCount === totalCount) {
        console.log('🎉 ALL SYSTEMS WORKING!');
    } else {
        console.log('❌ ISSUES STILL EXIST - FIXES NEEDED');
    }
}

// Run the tests
runAllTests().catch(console.error);