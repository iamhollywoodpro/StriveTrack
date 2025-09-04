#!/usr/bin/env node
// Comprehensive test script to verify the 5 critical issues are resolved
// Tests both API endpoints and frontend functionality

import fetch from 'node-fetch';

const BASE_URL = 'https://strivetrackapp.pages.dev';
let sessionId = null;

console.log('🔍 StriveTrack Critical Issues Verification');
console.log('==========================================\n');

// Test 1: Create test session (signup/login)
async function createTestSession() {
    console.log('1. CREATING TEST SESSION:');
    
    try {
        // Try to sign up with a test account
        const testUsername = `test_${Date.now()}`;
        const signupData = {
            name: testUsername,
            email: `${testUsername}@test.com`,
            password: 'TestPass123!',
            user_type: 'beginner'
        };

        console.log(`   Attempting signup with username: ${testUsername}`);
        
        const signupResponse = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
        });

        if (signupResponse.ok) {
            const data = await signupResponse.json();
            sessionId = data.session_id;
            console.log(`   ✅ Test account created successfully`);
            console.log(`   🔑 Session ID: ${sessionId ? 'Retrieved' : 'Missing'}\n`);
            return true;
        } else {
            console.log(`   ❌ Signup failed: ${signupResponse.status}`);
            const error = await signupResponse.text();
            console.log(`   Error: ${error}\n`);
            return false;
        }
    } catch (error) {
        console.error(`   💥 Error creating test session: ${error.message}\n`);
        return false;
    }
}

// Test 2: Test Habits API (creation and deletion)
async function testHabitsAPI() {
    console.log('2. TESTING HABITS API:');
    
    if (!sessionId) {
        console.log('   ❌ No session available\n');
        return false;
    }

    try {
        // Create a test habit
        const habitData = {
            name: 'Test Habit',
            description: 'Test habit for deletion testing',
            category: 'health',
            weekly_target: 5,
            difficulty: 'easy',
            emoji: '💪'
        };

        console.log('   Creating test habit...');
        const createResponse = await fetch(`${BASE_URL}/api/habits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(habitData)
        });

        if (!createResponse.ok) {
            console.log(`   ❌ Failed to create habit: ${createResponse.status}`);
            return false;
        }

        const createdHabit = await createResponse.json();
        const habitId = createdHabit.id || createdHabit.habit?.id;
        
        if (!habitId) {
            console.log('   ❌ No habit ID returned from creation');
            console.log(`   Response: ${JSON.stringify(createdHabit)}`);
            return false;
        }

        console.log(`   ✅ Test habit created: ${habitId}`);

        // Test habit deletion
        console.log('   Testing habit deletion...');
        const deleteResponse = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });

        if (deleteResponse.ok) {
            console.log('   ✅ Habit deletion works correctly\n');
            return true;
        } else {
            console.log(`   ❌ Habit deletion failed: ${deleteResponse.status}`);
            const error = await deleteResponse.text();
            console.log(`   Error: ${error}\n`);
            return false;
        }
    } catch (error) {
        console.error(`   💥 Error testing habits: ${error.message}\n`);
        return false;
    }
}

// Test 3: Test Nutrition API (creation and deletion)
async function testNutritionAPI() {
    console.log('3. TESTING NUTRITION API:');
    
    if (!sessionId) {
        console.log('   ❌ No session available\n');
        return false;
    }

    try {
        // Create a test nutrition entry
        const nutritionData = {
            meal_type: 'snack',
            food_name: 'Test Food',
            calories: 200,
            protein_g: 10,
            carbs_g: 20,
            fat_g: 5,
            logged_date: new Date().toISOString().split('T')[0]
        };

        console.log('   Creating test nutrition entry...');
        const createResponse = await fetch(`${BASE_URL}/api/nutrition`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(nutritionData)
        });

        if (!createResponse.ok) {
            console.log(`   ❌ Failed to create nutrition entry: ${createResponse.status}`);
            return false;
        }

        const createdEntry = await createResponse.json();
        const entryId = createdEntry.id || createdEntry.entry?.id;
        
        if (!entryId) {
            console.log('   ❌ No nutrition ID returned from creation');
            return false;
        }

        console.log(`   ✅ Test nutrition entry created: ${entryId}`);

        // Test nutrition deletion
        console.log('   Testing nutrition deletion...');
        const deleteResponse = await fetch(`${BASE_URL}/api/nutrition/${entryId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });

        if (deleteResponse.ok) {
            console.log('   ✅ Nutrition deletion works correctly\n');
            return true;
        } else {
            console.log(`   ❌ Nutrition deletion failed: ${deleteResponse.status}`);
            const error = await deleteResponse.text();
            console.log(`   Error: ${error}\n`);
            return false;
        }
    } catch (error) {
        console.error(`   💥 Error testing nutrition: ${error.message}\n`);
        return false;
    }
}

// Test 4: Test Weight Tracking API (unit conversion and BMI)
async function testWeightTracking() {
    console.log('4. TESTING WEIGHT TRACKING:');
    
    if (!sessionId) {
        console.log('   ❌ No session available\n');
        return false;
    }

    try {
        // Create a test weight entry with 200 lbs
        const weightData = {
            weight: 200,  // 200 lbs
            logged_date: new Date().toISOString().split('T')[0],
            notes: 'Test weight entry'
        };

        console.log('   Testing weight entry (200 lbs)...');
        const createResponse = await fetch(`${BASE_URL}/api/weight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(weightData)
        });

        if (!createResponse.ok) {
            console.log(`   ❌ Failed to create weight entry: ${createResponse.status}`);
            const error = await createResponse.text();
            console.log(`   Error: ${error}`);
            return false;
        }

        const result = await createResponse.json();
        console.log(`   ✅ Weight entry created`);
        
        if (result.calculated_bmi) {
            console.log(`   ✅ BMI calculated: ${result.calculated_bmi}`);
        } else {
            console.log(`   ⚠️  No BMI calculated (may need height data)`);
        }

        // Get weight data to check conversion
        console.log('   Fetching weight data...');
        const getResponse = await fetch(`${BASE_URL}/api/weight`, {
            headers: {
                'x-session-id': sessionId
            }
        });

        if (getResponse.ok) {
            const weightData = await getResponse.json();
            console.log('   ✅ Weight data retrieved successfully');
            
            if (weightData.weight_logs && weightData.weight_logs.length > 0) {
                const latest = weightData.weight_logs[0];
                console.log(`   📊 Weight: ${latest.weight_kg}kg / ${latest.weight_lbs}lbs`);
                console.log(`   📊 BMI: ${latest.bmi || 'Not calculated'}`);
            }
            console.log('');
            return true;
        } else {
            console.log(`   ❌ Failed to fetch weight data: ${getResponse.status}\n`);
            return false;
        }
    } catch (error) {
        console.error(`   💥 Error testing weight tracking: ${error.message}\n`);
        return false;
    }
}

// Test 5: Test Achievements API
async function testAchievements() {
    console.log('5. TESTING ACHIEVEMENTS API:');
    
    if (!sessionId) {
        console.log('   ❌ No session available\n');
        return false;
    }

    try {
        console.log('   Fetching achievements...');
        const response = await fetch(`${BASE_URL}/api/achievements`, {
            headers: {
                'x-session-id': sessionId
            }
        });

        if (response.ok) {
            const data = await response.json();
            const achievements = data.achievements || [];
            console.log(`   ✅ Achievements loaded: ${achievements.length} total`);
            
            if (achievements.length > 0) {
                const earned = achievements.filter(a => a.earned).length;
                console.log(`   📊 Earned: ${earned}/${achievements.length} achievements`);
                console.log('   ✅ Achievement system is working\n');
                return true;
            } else {
                console.log('   ⚠️  No achievements found in system\n');
                return false;
            }
        } else {
            console.log(`   ❌ Failed to fetch achievements: ${response.status}`);
            const error = await response.text();
            console.log(`   Error: ${error}\n`);
            return false;
        }
    } catch (error) {
        console.error(`   💥 Error testing achievements: ${error.message}\n`);
        return false;
    }
}

// Test 6: Test Competitions API
async function testCompetitions() {
    console.log('6. TESTING COMPETITIONS API:');
    
    if (!sessionId) {
        console.log('   ❌ No session available\n');
        return false;
    }

    try {
        console.log('   Fetching competitions...');
        const response = await fetch(`${BASE_URL}/api/competitions`, {
            headers: {
                'x-session-id': sessionId
            }
        });

        if (response.ok) {
            const data = await response.json();
            const competitions = data.competitions || [];
            console.log(`   ✅ Competitions loaded: ${competitions.length} total`);
            
            if (competitions.length > 0) {
                console.log('   ✅ Competition system is working\n');
                return true;
            } else {
                console.log('   ⚠️  No competitions found in system\n');
                return false;
            }
        } else {
            console.log(`   ❌ Failed to fetch competitions: ${response.status}`);
            const error = await response.text();
            console.log(`   Error: ${error}\n`);
            return false;
        }
    } catch (error) {
        console.error(`   💥 Error testing competitions: ${error.message}\n`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    const results = {
        sessionCreation: false,
        habitsAPI: false,
        nutritionAPI: false,
        weightTracking: false,
        achievements: false,
        competitions: false
    };

    try {
        results.sessionCreation = await createTestSession();
        
        if (results.sessionCreation) {
            results.habitsAPI = await testHabitsAPI();
            results.nutritionAPI = await testNutritionAPI();
            results.weightTracking = await testWeightTracking();
            results.achievements = await testAchievements();
            results.competitions = await testCompetitions();
        }

        // Summary
        console.log('=== TEST SUMMARY ===');
        console.log(`Session Creation: ${results.sessionCreation ? '✅' : '❌'}`);
        console.log(`Habits API: ${results.habitsAPI ? '✅' : '❌'}`);
        console.log(`Nutrition API: ${results.nutritionAPI ? '✅' : '❌'}`);
        console.log(`Weight Tracking: ${results.weightTracking ? '✅' : '❌'}`);
        console.log(`Achievements: ${results.achievements ? '✅' : '❌'}`);
        console.log(`Competitions: ${results.competitions ? '✅' : '❌'}`);

        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        
        console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All systems working correctly!');
        } else {
            console.log('⚠️  Some issues found - check details above');
        }

    } catch (error) {
        console.error('💥 Fatal error during testing:', error.message);
    }
}

// Run tests
runAllTests();