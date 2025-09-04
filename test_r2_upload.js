#!/usr/bin/env node

/**
 * Test R2 Storage Upload and Retrieval
 * Tests the complete media upload and retrieval workflow
 */

const BASE_URL = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';
const ADMIN_EMAIL = 'iamhollywoodpro@protonmail.com';
const ADMIN_PASSWORD = 'password@1981';

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.text();
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch {
            parsedData = data;
        }
        
        console.log(`🌐 ${options.method || 'GET'} ${url}`);
        console.log(`📊 Status: ${response.status}`);
        if (parsedData && typeof parsedData === 'object') {
            console.log(`📊 Data keys: ${Object.keys(parsedData).join(', ')}`);
        }
        
        return { response, data: parsedData };
        
    } catch (error) {
        console.error(`❌ Request failed: ${error.message}`);
        return { response: null, data: null, error };
    }
}

async function createTestImage() {
    // Create a simple test image buffer (1x1 PNG)
    const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk header
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // Width: 1, Height: 1
        0x01, 0x00, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9, // Bit depth: 1, Color type: 0, etc.
        0x24, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, // Compressed image data
        0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, // End of IDAT
        0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82  // IEND chunk
    ]);
    
    return new File([pngBuffer], 'test-image.png', { type: 'image/png' });
}

async function testR2UploadWorkflow() {
    console.log('🚀 Testing R2 Storage Upload and Retrieval Workflow...');
    console.log('==================================================');
    
    // Step 1: Admin Login
    console.log('🔐 Step 1: Admin Authentication...');
    const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        })
    });
    
    if (!loginResult.response || loginResult.response.status !== 200) {
        console.log('❌ Admin login failed');
        return;
    }
    
    const { sessionId, user } = loginResult.data;
    console.log('✅ Admin login successful');
    console.log(`👤 User ID: ${user.id}, Role: ${user.role}`);
    
    // Step 2: Test Media Upload
    console.log('\n📷 Step 2: Testing Media Upload...');
    
    const formData = new FormData();
    const testFile = await createTestImage();
    formData.append('file', testFile);
    formData.append('description', 'Test R2 upload image');
    formData.append('media_type', 'progress');
    
    const uploadResult = await makeRequest(`${BASE_URL}/api/media`, {
        method: 'POST',
        headers: {
            'x-session-id': sessionId
        },
        body: formData
    });
    
    if (!uploadResult.response || uploadResult.response.status !== 201) {
        console.log('❌ Media upload failed');
        console.log('📋 Upload error:', uploadResult.data);
        return;
    }
    
    const { mediaId } = uploadResult.data;
    console.log('✅ Media upload successful');
    console.log(`📂 Media ID: ${mediaId}`);
    
    // Step 3: Test File Retrieval
    console.log('\n📥 Step 3: Testing File Retrieval...');
    
    const retrievalResult = await makeRequest(`${BASE_URL}/api/media/file/${mediaId}`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    
    if (retrievalResult.response && retrievalResult.response.status === 200) {
        console.log('✅ File retrieval successful');
        console.log(`📊 Content-Type: ${retrievalResult.response.headers.get('content-type')}`);
    } else {
        console.log('❌ File retrieval failed');
        console.log(`📊 Status: ${retrievalResult.response?.status}`);
    }
    
    // Step 4: Test Admin Media Management
    console.log('\n👑 Step 4: Testing Admin Media Management...');
    
    const adminMediaResult = await makeRequest(`${BASE_URL}/api/admin/media`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    
    if (adminMediaResult.response && adminMediaResult.response.status === 200) {
        console.log('✅ Admin media list successful');
        console.log(`📊 Total media files: ${adminMediaResult.data.media?.length || 0}`);
        
        // Test admin file download
        if (adminMediaResult.data.media && adminMediaResult.data.media.length > 0) {
            const firstMedia = adminMediaResult.data.media[0];
            console.log(`📥 Testing admin download for: ${firstMedia.filename}`);
            
            const downloadResult = await makeRequest(`${BASE_URL}/api/admin/media/${firstMedia.id}/download`, {
                headers: {
                    'x-session-id': sessionId
                }
            });
            
            if (downloadResult.response && downloadResult.response.status === 200) {
                console.log('✅ Admin download successful');
            } else {
                console.log('❌ Admin download failed');
            }
        }
    } else {
        console.log('❌ Admin media list failed');
    }
    
    console.log('\n==================================================');
    console.log('🎯 R2 STORAGE TEST SUMMARY');
    console.log('==================================================');
}

// Run the test
testR2UploadWorkflow().catch(console.error);