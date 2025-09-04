// Test the new deployment specifically
console.log('🔍 TESTING NEW DEPLOYMENT');

const NEW_DEPLOYMENT_URL = 'https://d0c490c8.strivetrackapp.pages.dev';
const MAIN_SITE_URL = 'https://strivetrackapp.pages.dev';

const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function testBothSites() {
    console.log('\n🆚 COMPARING BOTH DEPLOYMENTS...');
    
    for (const [name, url] of [['NEW DEPLOYMENT', NEW_DEPLOYMENT_URL], ['MAIN SITE', MAIN_SITE_URL]]) {
        console.log(`\n--- TESTING ${name}: ${url} ---`);
        
        try {
            // Test login
            const loginResponse = await fetch(`${url}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(TEST_CONFIG.admin)
            });
            
            if (!loginResponse.ok) {
                console.log(`❌ ${name} login failed:`, loginResponse.status);
                continue;
            }
            
            const loginData = await loginResponse.json();
            const sessionId = loginData.sessionId || loginData.session_id;
            console.log(`✅ ${name} login successful`);
            
            // Test achievements
            const achievementsResponse = await fetch(`${url}/api/achievements`, {
                headers: { 'x-session-id': sessionId }
            });
            
            console.log(`🏆 ${name} achievements status:`, achievementsResponse.status);
            if (achievementsResponse.status === 500) {
                const error = await achievementsResponse.text();
                console.log(`   Error:`, error.substring(0, 200));
            } else if (achievementsResponse.ok) {
                const data = await achievementsResponse.json();
                console.log(`   ✅ Found ${data.achievements?.length || 0} achievements`);
            }
            
            // Test competitions  
            const competitionsResponse = await fetch(`${url}/api/competitions`, {
                headers: { 'x-session-id': sessionId }
            });
            
            console.log(`🏁 ${name} competitions status:`, competitionsResponse.status);
            if (competitionsResponse.status === 500) {
                const error = await competitionsResponse.text();
                console.log(`   Error:`, error.substring(0, 200));
            } else if (competitionsResponse.ok) {
                const data = await competitionsResponse.json();
                console.log(`   ✅ Found ${data.competitions?.length || 0} competitions`);
            }
            
        } catch (error) {
            console.log(`❌ ${name} test failed:`, error.message);
        }
    }
}

testBothSites().catch(console.error);