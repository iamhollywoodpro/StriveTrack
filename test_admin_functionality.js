#!/usr/bin/env node

// Comprehensive Admin & User Feature Testing Script
// Tests all USER features and ADMIN dashboard capabilities

const ADMIN_EMAIL = 'iamhollywoodpro@protonmail.com';
const ADMIN_PASSWORD = 'password@1981';
const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

let adminSessionId = null;
let testUserSessionId = null;
let baseUrl = null;

// Helper function for API requests
async function makeRequest(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    console.log(`🌐 ${mergedOptions.method || 'GET'} ${url}`);
    
    try {
        const response = await fetch(url, mergedOptions);
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`📊 Status: ${response.status}, Response:`, JSON.stringify(data, null, 2));
            return { response, data };
        } else {
            console.log(`📊 Status: ${response.status}, Content-Type: ${contentType}`);
            return { response, data: null };
        }
    } catch (error) {
        console.error(`❌ Request failed:`, error.message);
        return { response: null, data: null };
    }
}

// Test admin authentication
async function testAdminLogin() {
    console.log('\n🔐 Testing Admin Login...');
    
    const { response, data } = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })
    });
    
    if (response && response.ok && data && data.sessionId) {
        adminSessionId = data.sessionId;
        console.log('✅ Admin login successful');
        return true;
    } else {
        console.log('❌ Admin login failed');
        return false;
    }
}

// Test user registration and authentication
async function testUserRegistration() {
    console.log('\n👤 Testing User Registration...');
    
    // First try to register a test user
    const { response, data } = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD
        })
    });
    
    if (response && response.ok) {
        console.log('✅ User registration successful (or user exists)');
        
        // Now login as the test user
        const { response: loginResponse, data: loginData } = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: TEST_USER_EMAIL,
                password: TEST_USER_PASSWORD
            })
        });
        
        if (loginResponse && loginResponse.ok && loginData && loginData.sessionId) {
            testUserSessionId = loginData.sessionId;
            console.log('✅ Test user login successful');
            return true;
        }
    }
    
    console.log('❌ User registration/login failed');
    return false;
}

// Test admin user management
async function testAdminUserManagement() {
    console.log('\n👥 Testing Admin User Management...');
    
    if (!adminSessionId) {
        console.log('❌ Admin not authenticated');
        return false;
    }
    
    const { response, data } = await makeRequest('/api/admin/users', {
        headers: {
            'x-session-id': adminSessionId
        }
    });
    
    if (response && response.ok && data) {
        console.log('✅ Admin can access user list');
        console.log(`📊 Total users: ${data.users.length}`);
        console.log(`📊 Platform stats:`, data.stats);
        
        // Check if we can see user activity status
        data.users.forEach(user => {
            console.log(`👤 User: ${user.email}, Active Sessions: ${user.active_sessions}, Last Session: ${user.last_session || 'Never'}`);
        });
        
        return true;
    } else {
        console.log('❌ Admin user management access failed');
        return false;
    }
}

// Test admin media management
async function testAdminMediaManagement() {
    console.log('\n📸 Testing Admin Media Management...');
    
    if (!adminSessionId) {
        console.log('❌ Admin not authenticated');
        return false;
    }
    
    // Test getting all media
    const { response, data } = await makeRequest('/api/admin/media', {
        headers: {
            'x-session-id': adminSessionId
        }
    });
    
    if (response && response.ok && data) {
        console.log('✅ Admin can access media list');
        console.log(`📊 Total media files: ${data.pagination.total}`);
        
        if (data.media && data.media.length > 0) {
            const testMedia = data.media[0];
            console.log(`📁 Sample media: ${testMedia.filename}, Type: ${testMedia.media_type}, Flagged: ${testMedia.is_flagged}`);
            
            // Test flagging functionality
            await testMediaFlagging(testMedia.id);
            
            // Test download functionality
            await testMediaDownload(testMedia.id);
        }
        
        return true;
    } else {
        console.log('❌ Admin media management access failed');
        return false;
    }
}

// Test media flagging
async function testMediaFlagging(mediaId) {
    console.log(`\n🚩 Testing Media Flagging for ID: ${mediaId}...`);
    
    const { response, data } = await makeRequest(`/api/admin/media/${mediaId}/flag`, {
        method: 'POST',
        headers: {
            'x-session-id': adminSessionId
        }
    });
    
    if (response && response.ok && data) {
        console.log(`✅ Media flagging successful: ${data.message}`);
        return true;
    } else {
        console.log('❌ Media flagging failed');
        return false;
    }
}

// Test media download
async function testMediaDownload(mediaId) {
    console.log(`\n⬇️ Testing Media Download for ID: ${mediaId}...`);
    
    const { response, data } = await makeRequest(`/api/admin/media/${mediaId}/download`, {
        headers: {
            'x-session-id': adminSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ Media download access successful');
        return true;
    } else {
        console.log('❌ Media download failed');
        return false;
    }
}

// Test user features (habits, goals, etc.)
async function testUserFeatures() {
    console.log('\n🎯 Testing User Features...');
    
    if (!testUserSessionId) {
        console.log('❌ Test user not authenticated');
        return false;
    }
    
    // Test habits
    await testUserHabits();
    
    // Test goals
    await testUserGoals();
    
    // Test nutrition
    await testUserNutrition();
    
    // Test weight tracking
    await testUserWeight();
    
    // Test competitions
    await testUserCompetitions();
    
    // Test achievements
    await testUserAchievements();
    
    // Test media uploads (basic check)
    await testUserMedia();
    
    return true;
}

// Test user habits
async function testUserHabits() {
    console.log('\n📋 Testing User Habits...');
    
    const { response, data } = await makeRequest('/api/habits', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User habits API accessible');
        console.log(`📊 User has ${data.length || 0} habits`);
        return true;
    } else {
        console.log('❌ User habits API failed');
        return false;
    }
}

// Test user goals
async function testUserGoals() {
    console.log('\n🎯 Testing User Goals...');
    
    const { response, data } = await makeRequest('/api/goals', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User goals API accessible');
        return true;
    } else {
        console.log('❌ User goals API failed');
        return false;
    }
}

// Test user nutrition
async function testUserNutrition() {
    console.log('\n🥗 Testing User Nutrition...');
    
    const { response, data } = await makeRequest('/api/nutrition', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User nutrition API accessible');
        return true;
    } else {
        console.log('❌ User nutrition API failed');
        return false;
    }
}

// Test user weight tracking
async function testUserWeight() {
    console.log('\n⚖️ Testing User Weight Tracking...');
    
    const { response, data } = await makeRequest('/api/weight', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User weight tracking API accessible');
        return true;
    } else {
        console.log('❌ User weight tracking API failed');
        return false;
    }
}

// Test user competitions
async function testUserCompetitions() {
    console.log('\n🏆 Testing User Competitions...');
    
    const { response, data } = await makeRequest('/api/competitions', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User competitions API accessible');
        return true;
    } else {
        console.log('❌ User competitions API failed');
        return false;
    }
}

// Test user achievements
async function testUserAchievements() {
    console.log('\n🏅 Testing User Achievements...');
    
    const { response, data } = await makeRequest('/api/achievements', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User achievements API accessible');
        return true;
    } else {
        console.log('❌ User achievements API failed');
        return false;
    }
}

// Test user media
async function testUserMedia() {
    console.log('\n📱 Testing User Media...');
    
    const { response, data } = await makeRequest('/api/media', {
        headers: {
            'x-session-id': testUserSessionId
        }
    });
    
    if (response && response.ok) {
        console.log('✅ User media API accessible');
        return true;
    } else {
        console.log('❌ User media API failed');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Feature Testing...');
    
    // Get base URL from command line or use default
    baseUrl = process.argv[2] || 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';
    console.log(`🌐 Using base URL: ${baseUrl}`);
    
    let allTestsPassed = true;
    
    // Test admin functionality
    console.log('\n=== ADMIN FUNCTIONALITY TESTING ===');
    
    if (await testAdminLogin()) {
        await testAdminUserManagement();
        await testAdminMediaManagement();
    } else {
        allTestsPassed = false;
    }
    
    // Test user functionality
    console.log('\n=== USER FUNCTIONALITY TESTING ===');
    
    if (await testUserRegistration()) {
        await testUserFeatures();
    } else {
        allTestsPassed = false;
    }
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    if (allTestsPassed) {
        console.log('✅ All tests completed - check individual results above');
    } else {
        console.log('❌ Some tests failed - check logs above');
    }
    
    console.log('\n📝 Test Report Complete');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export { runAllTests };