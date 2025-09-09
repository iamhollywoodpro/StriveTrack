// Debug achievement rendering specifically
const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';

async function debugAchievementRendering() {
    console.log('🔍 Debugging achievement rendering issues...\n');
    
    // Login first
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: 'test@example.com', 
            password: 'password123' 
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.sessionId) {
        console.log('❌ Login failed');
        return;
    }
    
    console.log('✅ Login successful');
    const sessionId = loginData.sessionId;
    
    // Get achievements data
    const response = await fetch(`${BASE_URL}/api/achievements`, {
        headers: { 'x-session-id': sessionId }
    });
    const data = await response.json();
    
    console.log('📊 Achievement Data Analysis:');
    console.log('- Total achievements:', data.achievements?.length || 0);
    
    if (data.achievements && data.achievements.length > 0) {
        const first = data.achievements[0];
        console.log('\n🔍 First Achievement Structure:');
        console.log('- name:', first.name);
        console.log('- description:', first.description);
        console.log('- icon:', first.icon);
        console.log('- difficulty:', first.difficulty);
        console.log('- is_completed:', first.is_completed);
        console.log('- is_unlockable:', first.is_unlockable);
        console.log('- points:', first.points);
        console.log('- progress_percentage:', first.progress_percentage);
        
        console.log('\n🧪 Testing createAchievementElement logic:');
        
        // Test if difficulty exists and is valid
        if (!first.difficulty) {
            console.log('❌ ISSUE: difficulty property is missing or undefined!');
        } else {
            console.log('✅ difficulty property exists:', first.difficulty);
        }
        
        // Test icon generation
        const hasEmojiInName = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(first.name);
        console.log('✅ Name has emoji:', hasEmojiInName, '- Will use default ⭐ icon');
        
        // Test potential JavaScript errors in template
        try {
            const difficultyColors = {
                'easy': '#10b981',
                'medium': '#f59e0b', 
                'hard': '#ef4444',
                'legendary': '#8b5cf6'
            };
            
            const testHTML = `
                <div class="achievement-icon">⭐</div>
                <div class="achievement-title">${first.name}</div>
                <div class="achievement-description">${first.description}</div>
                <div class="achievement-footer">
                    <div class="flex justify-between items-center text-xs">
                        <div class="flex items-center space-x-2">
                            ${first.points > 0 ? `<span>🏆 ${first.points} pts</span>` : ''}
                            <span class="px-2 py-1 rounded" style="background-color: ${difficultyColors[first.difficulty] || '#666'}; color: white; font-size: 10px;">
                                ${(first.difficulty || 'unknown').toUpperCase()}
                            </span>
                        </div>
                        ${first.is_completed ? '<span style="color: #10b981;">✅</span>' : ''}
                        ${first.is_unlockable ? '<span style="color: #f59e0b;">⭐</span>' : ''}
                        ${!first.is_completed && !first.is_unlockable ? '<span style="color: rgba(255,255,255,0.4);">🔒</span>' : ''}
                    </div>
                </div>
            `;
            
            console.log('✅ Template generation successful');
            console.log('📏 Template length:', testHTML.length);
            
        } catch (error) {
            console.log('❌ Template generation failed:', error.message);
        }
        
        console.log('\n🔍 Potential Issues to Check:');
        console.log('1. Check if achievements-container element exists in DOM');
        console.log('2. Check if CSS classes .achievement-card, .achievement-grid exist');
        console.log('3. Check if JavaScript errors are thrown during rendering');
        console.log('4. Check if displayAchievements function is actually being called');
        
        // Test the CSS classes
        console.log('\n🎨 CSS Classes that should exist:');
        console.log('- .achievement-grid (for grid layout)');
        console.log('- .achievement-card (for individual cards)');
        console.log('- .achievement-card.locked (for locked achievements)');
        console.log('- .achievement-pulse (for unlockable achievements)');
    }
}

debugAchievementRendering().catch(console.error);