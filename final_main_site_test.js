// Quick final test of main site
const MAIN_SITE = 'https://strivetrackapp.pages.dev';
const TEST_CONFIG = {
    admin: { email: 'iamhollywoodpro@protonmail.com', password: 'password@1981' }
};

async function quickTest() {
    console.log('🔍 FINAL TEST OF MAIN SITE:', MAIN_SITE);
    
    try {
        // Login
        const loginResponse = await fetch(`${MAIN_SITE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_CONFIG.admin)
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const sessionId = loginData.sessionId || loginData.session_id;
            console.log('✅ Login: Working');
            
            // Test achievements (main issue)
            const achievementsResponse = await fetch(`${MAIN_SITE}/api/achievements`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (achievementsResponse.ok) {
                const data = await achievementsResponse.json();
                console.log(`✅ Achievements: Working (${data.achievements?.length || 0} found)`);
            } else {
                console.log(`❌ Achievements: Still broken (${achievementsResponse.status})`);
            }
            
            // Test competitions (main issue)  
            const competitionsResponse = await fetch(`${MAIN_SITE}/api/competitions`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (competitionsResponse.ok) {
                const data = await competitionsResponse.json();
                console.log(`✅ Competitions: Working (${data.competitions?.length || 0} found)`);
            } else {
                console.log(`❌ Competitions: Still broken (${competitionsResponse.status})`);
            }
            
        } else {
            console.log('❌ Login failed:', loginResponse.status);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

quickTest().catch(console.error);