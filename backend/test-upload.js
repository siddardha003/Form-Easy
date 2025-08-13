// Test script for file upload endpoints
// Run with: node test-upload.js

import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

let authToken = '';

async function testEndpoint(method, endpoint, data = null, token = null, isFormData = false) {
  try {
    const options = {
      method,
      headers: {}
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      if (isFormData) {
        options.body = data; // FormData sets its own content-type
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
  }
}

// Create a test image file
function createTestImage() {
  const testImagePath = 'test-image.png';
  
  // Create a simple 1x1 PNG image (base64 encoded)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

async function runUploadTests() {
  console.log('🧪 Testing File Upload Endpoints...\n');

  // First, login to get token
  console.log('1. Logging in to get auth token...');
  const loginResult = await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'Test123456'
  });

  if (!loginResult || !loginResult.data || !loginResult.data.token) {
    console.log('❌ Login failed. Please run test-auth.js first to create a user.');
    return;
  }

  authToken = loginResult.data.token;
  console.log('✅ Login successful, got token');

  // Create test image
  console.log('\n2. Creating test image file...');
  const testImagePath = createTestImage();
  console.log('✅ Test image created');

  // Test image upload
  console.log('\n3. Testing image upload...');
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Read the test image file
    const imageBuffer = fs.readFileSync(testImagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
    formData.append('image', imageBlob, 'test-image.png');
    formData.append('usageType', 'question-image');

    const uploadResult = await testEndpoint('POST', '/upload/image', formData, authToken, true);
    
    let uploadedFileId = null;
    if (uploadResult && uploadResult.data && uploadResult.data.file) {
      uploadedFileId = uploadResult.data.file.id;
      console.log('✅ Image uploaded successfully');
    }

    // Test getting user files
    console.log('\n4. Getting user files...');
    await testEndpoint('GET', '/upload/files', null, authToken);

    // Test getting files by usage type
    console.log('\n5. Getting files by usage type...');
    await testEndpoint('GET', '/upload/files?usageType=question-image', null, authToken);

    // Test serving file
    if (uploadedFileId) {
      console.log('\n6. Testing file serving...');
      
      try {
        const response = await fetch(`${API_BASE}/upload/serve/${uploadedFileId}`);
        console.log(`\nGET /upload/serve/${uploadedFileId}`);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Content-Length: ${response.headers.get('content-length')}`);
        
        if (response.ok) {
          console.log('✅ File served successfully');
        }
      } catch (error) {
        console.error('Error serving file:', error.message);
      }

      // Test marking file as used
      console.log('\n7. Marking file as used...');
      await testEndpoint('POST', `/upload/files/${uploadedFileId}/mark-used`, {
        entityId: '507f1f77bcf86cd799439011' // Dummy ObjectId
      }, authToken);

      // Test deleting file (should fail because it's marked as used)
      console.log('\n8. Trying to delete used file (should fail)...');
      await testEndpoint('DELETE', `/upload/files/${uploadedFileId}`, null, authToken);
    }

    // Test upload without file
    console.log('\n9. Testing upload without file (should fail)...');
    const emptyFormData = new FormData();
    emptyFormData.append('usageType', 'question-image');
    await testEndpoint('POST', '/upload/image', emptyFormData, authToken, true);

    // Test upload with invalid usage type
    console.log('\n10. Testing upload with invalid usage type...');
    const invalidFormData = new FormData();
    const imageBuffer2 = fs.readFileSync(testImagePath);
    const imageBlob2 = new Blob([imageBuffer2], { type: 'image/png' });
    invalidFormData.append('image', imageBlob2, 'test-image.png');
    invalidFormData.append('usageType', 'invalid-type');
    await testEndpoint('POST', '/upload/image', invalidFormData, authToken, true);

  } catch (error) {
    console.error('Upload test error:', error);
  }

  // Clean up test file
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 Test image file cleaned up');
  }

  console.log('\n✅ File upload tests completed!');
}

// Check if fetch and FormData are available
if (typeof fetch === 'undefined' || typeof FormData === 'undefined') {
  console.log('❌ This test requires Node.js 18+ with built-in fetch and FormData support');
  process.exit(1);
}

runUploadTests().catch(console.error);