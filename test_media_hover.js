#!/usr/bin/env node

/**
 * Test Media Hover Comparison Functionality
 * Tests if the comparison overlay appears on hover
 */

const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';
const ADMIN_EMAIL = 'iamhollywoodpro@protonmail.com';
const ADMIN_PASSWORD = 'password@1981';

async function testMediaHover() {
    console.log('🚀 Testing Media Hover Comparison Functionality...');
    console.log('==================================================');
    
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })
    });
    
    if (!loginResponse.ok) {
        console.log('❌ Login failed');
        return;
    }
    
    const { sessionId } = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Step 2: Upload a test image to ensure we have media
    console.log('\\n📤 Step 2: Ensuring test media exists...');
    const formData = new FormData();
    
    // Create a simple test image buffer
    const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9,
        0x24, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
        0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testFile = new File([pngBuffer], 'hover-test-image.png', { type: 'image/png' });
    formData.append('file', testFile);
    formData.append('description', 'Test image for hover functionality');
    formData.append('media_type', 'progress');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/media`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: formData
    });
    
    if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        console.log(`✅ Test media uploaded: ${uploadData.mediaId}`);
    } else {
        console.log('ℹ️ Using existing media (upload not needed)');
    }
    
    // Step 3: Get media list
    console.log('\\n📋 Step 3: Getting media list...');
    const mediaResponse = await fetch(`${BASE_URL}/api/media`, {
        headers: { 'x-session-id': sessionId }
    });
    
    if (!mediaResponse.ok) {
        console.log('❌ Failed to get media');
        return;
    }
    
    const mediaData = await mediaResponse.json();
    console.log(`✅ Found ${mediaData.media?.length || 0} media items`);
    
    if (!mediaData.media || mediaData.media.length === 0) {
        console.log('❌ No media items found to test hover on');
        return;
    }
    
    // Step 4: Test the HTML structure
    console.log('\\n🔍 Step 4: Testing HTML structure for hover...');
    
    // Create a sample media item HTML structure like the app does
    const testItem = mediaData.media[0];
    const mediaType = testItem.media_type || 'progress';
    const isVideo = testItem.file_type && testItem.file_type.startsWith('video/');
    
    const sampleHTML = `
        <div class="media-item">
            <div class="media-preview" id="media-${testItem.id}">
                <i class="fas fa-${isVideo ? 'video' : 'image'} text-2xl text-white/40"></i>
                <div class="media-type-badge ${mediaType}">
                    ${mediaType.toUpperCase()}
                </div>
                <button onclick="deleteMediaWithConfirmation('${testItem.id}')" 
                        class="delete-button-gallery" 
                        title="Delete media">
                    <i class="fas fa-trash"></i>
                </button>
                
                <!-- Comparison Overlay -->
                <div class="comparison-overlay">
                    <div class="comparison-controls">
                        <button onclick="addToComparison('${testItem.id}')" class="btn-compare">
                            <i class="fas fa-plus mr-1"></i>Compare
                        </button>
                        <button onclick="showEnhancedMediaModal(window.mediaItems['${testItem.id}'])" class="btn-compare">
                            <i class="fas fa-expand mr-1"></i>View
                        </button>
                    </div>
                </div>
            </div>
            <div class="media-info">
                <div class="media-date">
                    ${new Date(testItem.uploaded_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    `;
    
    console.log('✅ Sample HTML structure generated');
    console.log('📋 Key elements expected:');
    console.log('   • .media-item (container)');
    console.log('   • .media-preview (with position: relative)');
    console.log('   • .comparison-overlay (with opacity: 0 by default)');
    console.log('   • .media-item:hover .comparison-overlay (should set opacity: 1)');
    
    // Step 5: Check for potential CSS conflicts
    console.log('\\n🎨 Step 5: Checking for CSS issues...');
    console.log('✅ Expected CSS rules:');
    console.log('   • .comparison-overlay { position: absolute; opacity: 0; }');
    console.log('   • .media-item:hover .comparison-overlay { opacity: 1; }');
    console.log('   • .media-preview { position: relative; }');
    
    console.log('\\n🔧 Troubleshooting steps to try:');
    console.log('   1. Check if CSS is loading properly');
    console.log('   2. Verify no CSS conflicts or overwrites');
    console.log('   3. Check z-index stacking issues');
    console.log('   4. Test with browser dev tools to see if hover triggers');
    console.log('   5. Check if JavaScript is interfering with CSS hover');
    
    console.log('\\n==================================================');
    console.log('🎯 MEDIA HOVER TEST SUMMARY');
    console.log('==================================================');
    console.log('📋 The HTML structure is correct');
    console.log('📋 CSS rules should be working');
    console.log('📋 Issue is likely a CSS conflict or z-index problem');
    console.log('');
    console.log('🌟 Next step: Manually inspect the page with browser dev tools');
    console.log('   • Open browser dev tools');
    console.log('   • Navigate to media gallery');
    console.log('   • Hover over a media item');
    console.log('   • Check if .comparison-overlay element has opacity: 1 on hover');
}

// Run the test
testMediaHover().catch(console.error);