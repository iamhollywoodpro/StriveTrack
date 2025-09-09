// Frontend debugging script to check actual UI behavior
const puppeteer = require('puppeteer');

async function debugFrontend() {
    console.log('🔍 Starting deep frontend debugging...\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', (msg) => {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', (error) => {
        console.log(`[BROWSER ERROR] ${error.message}`);
    });
    
    try {
        console.log('1. Loading application...');
        await page.goto('https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev', { 
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        console.log('2. Logging in...');
        await page.type('#email', 'test@example.com');
        await page.type('#password', 'password123');
        await page.click('button[type="submit"]');
        
        // Wait for login to complete
        await page.waitForSelector('#dashboard', { timeout: 10000 });
        console.log('✅ Login successful');
        
        console.log('3. Navigating to achievements section...');
        await page.click('[data-section="achievements"]');
        
        // Wait a moment for the section to load
        await page.waitForTimeout(3000);
        
        console.log('4. Checking achievements container...');
        const achievementsContainer = await page.$('#achievements-container');
        
        if (achievementsContainer) {
            const innerHTML = await page.evaluate(() => {
                const container = document.getElementById('achievements-container');
                return container ? container.innerHTML : 'CONTAINER NOT FOUND';
            });
            
            console.log('📄 Achievements container HTML length:', innerHTML.length);
            console.log('📄 First 500 chars:', innerHTML.substring(0, 500));
            
            if (innerHTML.length < 50) {
                console.log('❌ Container is nearly empty!');
                
                // Check if loadAchievements was called
                const loadAchievementsCalled = await page.evaluate(() => {
                    return window.loadAchievementsCalled || false;
                });
                
                console.log('🔧 loadAchievements called:', loadAchievementsCalled);
                
                // Check if displayAchievements was called
                const displayAchievementsCalled = await page.evaluate(() => {
                    return window.displayAchievementsCalled || false;
                });
                
                console.log('🔧 displayAchievements called:', displayAchievementsCalled);
                
                // Check for JavaScript errors
                const errors = await page.evaluate(() => {
                    return window.jsErrors || [];
                });
                
                console.log('🐛 JavaScript errors:', errors);
            }
        } else {
            console.log('❌ achievements-container element not found!');
        }
        
        console.log('5. Checking console for API calls...');
        // The console logs should show if API calls are being made
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Check if puppeteer is available
try {
    debugFrontend().catch(console.error);
} catch (error) {
    console.log('❌ Puppeteer not available. Let me check the frontend code directly...');
    
    // Alternative: Check the code for issues
    console.log('\n🔍 Code Analysis:');
    console.log('1. Check if createAchievementElement function exists and works');
    console.log('2. Check if displayAchievements function is being called');
    console.log('3. Check if there are CSS issues hiding the achievements');
    console.log('4. Check if achievements-container has the right ID');
}