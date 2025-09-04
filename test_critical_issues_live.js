// Test script to check the 5 critical issues on live site
// Run this script in browser console on https://strivetrackapp.pages.dev

console.log('🔍 Testing Critical Issues on StriveTrack Live Site');
console.log('===================================================');

// Test 1: Check if habits delete buttons are functional
function testHabitsDeleteButtons() {
    console.log('\n1. TESTING HABITS DELETE FUNCTIONALITY:');
    
    // Check if we're on habits section
    const habitsSection = document.getElementById('habits-section');
    if (!habitsSection) {
        console.log('❌ Habits section not found');
        return;
    }
    
    // Look for delete buttons
    const deleteButtons = document.querySelectorAll('.delete-habit-btn');
    console.log(`📊 Found ${deleteButtons.length} habit delete buttons`);
    
    if (deleteButtons.length === 0) {
        console.log('❌ No habit delete buttons found');
        return;
    }
    
    // Check if buttons have proper event listeners
    deleteButtons.forEach((btn, i) => {
        const habitId = btn.getAttribute('data-habit-id');
        console.log(`   Button ${i+1}: habitId=${habitId}, hasClickEvent=${btn.onclick ? 'Yes' : 'No'}`);
    });
    
    console.log('✅ Found habit delete buttons - check if clicking works');
}

// Test 2: Check nutrition edit/delete buttons
function testNutritionEditDelete() {
    console.log('\n2. TESTING NUTRITION EDIT/DELETE FUNCTIONALITY:');
    
    const nutritionSection = document.getElementById('nutrition-section');
    if (!nutritionSection) {
        console.log('❌ Nutrition section not found');
        return;
    }
    
    const editButtons = document.querySelectorAll('.edit-nutrition-btn');
    const deleteButtons = document.querySelectorAll('.delete-nutrition-btn');
    
    console.log(`📊 Found ${editButtons.length} nutrition edit buttons`);
    console.log(`📊 Found ${deleteButtons.length} nutrition delete buttons`);
    
    if (editButtons.length === 0 && deleteButtons.length === 0) {
        console.log('❌ No nutrition edit/delete buttons found');
    } else {
        console.log('✅ Found nutrition edit/delete buttons');
    }
}

// Test 3: Check weight tracking unit conversion and BMI
function testWeightTracking() {
    console.log('\n3. TESTING WEIGHT TRACKING CONVERSION & BMI:');
    
    // Check current weight display
    const currentWeight = document.getElementById('current-weight')?.textContent;
    const weightUnit = document.getElementById('weight-unit')?.textContent;
    const currentBMI = document.getElementById('current-bmi')?.textContent;
    const bmiCategory = document.getElementById('bmi-category')?.textContent;
    
    console.log(`📊 Current Weight: ${currentWeight} ${weightUnit}`);
    console.log(`📊 Current BMI: ${currentBMI}`);
    console.log(`📊 BMI Category: ${bmiCategory}`);
    
    if (currentBMI === '--' || currentBMI === '-') {
        console.log('❌ BMI calculation issue - showing "--"');
    } else {
        console.log('✅ BMI is calculated');
    }
    
    // Check if weight logs show proper conversion
    const weightLogs = document.querySelectorAll('.weight-log-entry');
    console.log(`📊 Found ${weightLogs.length} weight log entries`);
}

// Test 4: Check achievements system
function testAchievements() {
    console.log('\n4. TESTING ACHIEVEMENTS SYSTEM:');
    
    const achievementsSection = document.getElementById('achievements-section');
    if (!achievementsSection) {
        console.log('❌ Achievements section not found');
        return;
    }
    
    const achievementCards = document.querySelectorAll('.achievement-card');
    console.log(`📊 Found ${achievementCards.length} achievement cards`);
    
    if (achievementCards.length === 0) {
        console.log('❌ No achievements found - system not working');
    } else {
        console.log('✅ Achievements are loading');
    }
}

// Test 5: Check competitions system
function testCompetitions() {
    console.log('\n5. TESTING COMPETITIONS SYSTEM:');
    
    const competitionsSection = document.getElementById('competitions-section');
    if (!competitionsSection) {
        console.log('❌ Competitions section not found');
        return;
    }
    
    const competitionCards = document.querySelectorAll('.competition-card');
    console.log(`📊 Found ${competitionCards.length} competition cards`);
    
    if (competitionCards.length === 0) {
        console.log('❌ No competitions found - system not loading');
    } else {
        console.log('✅ Competitions are loading');
    }
}

// Test API endpoints directly
async function testAPIEndpoints() {
    console.log('\n6. TESTING API ENDPOINTS:');
    
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        console.log('❌ No session ID found');
        return;
    }
    
    const endpoints = [
        { name: 'Achievements', url: '/api/achievements' },
        { name: 'Competitions', url: '/api/competitions' },
        { name: 'Habits', url: '/api/habits' },
        { name: 'Nutrition', url: '/api/nutrition' },
        { name: 'Weight', url: '/api/weight' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint.name}: Status ${response.status}`);
            } else {
                console.log(`❌ ${endpoint.name}: Status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
        }
    }
}

// Run all tests
function runAllTests() {
    testHabitsDeleteButtons();
    testNutritionEditDelete();
    testWeightTracking();
    testAchievements();
    testCompetitions();
    testAPIEndpoints();
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('Run individual tests: testHabitsDeleteButtons(), testNutritionEditDelete(), etc.');
    console.log('Check network tab for failed API calls');
    console.log('Check console for JavaScript errors');
}

// Auto-run tests when script loads
setTimeout(runAllTests, 1000);

// Export functions for manual testing
window.testCriticalIssues = {
    testHabitsDeleteButtons,
    testNutritionEditDelete,
    testWeightTracking,
    testAchievements,
    testCompetitions,
    testAPIEndpoints,
    runAllTests
};

console.log('\n💡 Use window.testCriticalIssues.runAllTests() to run again');