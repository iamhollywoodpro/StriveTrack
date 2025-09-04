// Debug the weight conversion issue
console.log('🔍 DEBUGGING WEIGHT CONVERSION ISSUE');

const SITE_URL = 'https://6011de11.strivetrackapp.pages.dev';
const TEST_CONFIG = {
    admin: {
        email: 'iamhollywoodpro@protonmail.com',
        password: 'password@1981'
    }
};

async function debugWeight() {
    // Login first
    const loginResponse = await fetch(`${SITE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CONFIG.admin)
    });
    
    const loginData = await loginResponse.json();
    const sessionId = loginData.sessionId || loginData.session_id;
    console.log('✅ Login successful');
    
    // Check user profile to see weight_unit setting
    const profileResponse = await fetch(`${SITE_URL}/api/user/profile`, {
        headers: { 'x-session-id': sessionId }
    });
    
    if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('👤 User profile weight settings:', {
            weight_unit: profile.weight_unit,
            height_cm: profile.height_cm,
            current_weight_kg: profile.current_weight_kg
        });
    }
    
    // Get current weight data to see what's in database
    const weightResponse = await fetch(`${SITE_URL}/api/weight`, {
        headers: { 'x-session-id': sessionId }
    });
    
    if (weightResponse.ok) {
        const data = await weightResponse.json();
        console.log('📊 Current weight data:', data.user_info);
        
        if (data.weight_logs && data.weight_logs.length > 0) {
            console.log('📝 Latest weight entries:');
            data.weight_logs.slice(0, 3).forEach((entry, i) => {
                console.log(`  ${i+1}. Weight: ${entry.weight_lbs} lbs / ${entry.weight_kg} kg, BMI: ${entry.bmi}`);
            });
        }
    }
    
    // Test with explicit unit specification
    console.log('\n🧪 Testing weight entry with explicit debugging...');
    const today = new Date().toISOString().split('T')[0];
    
    const testWeight = {
        weight: 150, // Test with 150 lbs
        logged_date: today,
        notes: 'Debug test - should be 150 lbs = ~68 kg'
    };
    
    console.log('📤 Sending weight data:', testWeight);
    
    const createResponse = await fetch(`${SITE_URL}/api/weight`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': sessionId 
        },
        body: JSON.stringify(testWeight)
    });
    
    if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('✅ Weight entry created:', result);
        
        // Check what was actually stored
        const verifyResponse = await fetch(`${SITE_URL}/api/weight`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            const latest = verifyData.weight_logs[0];
            console.log('📥 What was stored:', {
                weight_lbs: latest.weight_lbs,
                weight_kg: latest.weight_kg,
                bmi: latest.bmi,
                expected_kg: 150 * 0.453592 // Should be ~68 kg
            });
            
            const isCorrect = Math.abs(latest.weight_kg - (150 * 0.453592)) < 1;
            console.log(`✅ Conversion ${isCorrect ? 'CORRECT' : 'WRONG'}`);
        }
    } else {
        console.log('❌ Failed to create weight entry:', await createResponse.text());
    }
}

debugWeight().catch(console.error);