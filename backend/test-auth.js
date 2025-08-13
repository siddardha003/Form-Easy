// Simple test script to verify authentication endpoints
// Run with: node test-auth.js

const API_BASE = 'http://localhost:5000/api';

async function testEndpoint(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
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

async function runTests() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  // Test health check
  await testEndpoint('GET', '/health');

  // Test registration with invalid data
  await testEndpoint('POST', '/auth/register', {
    email: 'invalid-email',
    password: '123',
    firstName: '',
    lastName: 'Doe'
  });

  // Test registration with valid data
  const registerResult = await testEndpoint('POST', '/auth/register', {
    email: 'test@example.com',
    password: 'Test123456',
    firstName: 'John',
    lastName: 'Doe'
  });

  // Test login with invalid credentials
  await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'wrongpassword'
  });

  // Test login with valid credentials
  const loginResult = await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'Test123456'
  });

  // Test protected route without token
  await testEndpoint('GET', '/auth/me');

  // Test protected route with token
  if (loginResult && loginResult.data && loginResult.data.token) {
    const token = loginResult.data.token;
    
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      console.log(`\nGET /auth/me (with token)`);
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error testing /auth/me with token:', error.message);
    }
  }

  console.log('\n✅ Authentication tests completed!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ with built-in fetch support');
  console.log('Alternatively, install node-fetch: npm install node-fetch');
  process.exit(1);
}

runTests().catch(console.error);