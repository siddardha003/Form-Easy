// Test script for form management endpoints
// Run with: node test-forms.js

const API_BASE = 'http://localhost:5000/api';

let authToken = '';

async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

async function runFormTests() {
  console.log('🧪 Testing Form Management Endpoints...\n');

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

  // Test creating a form
  console.log('\n2. Creating a new form...');
  const sampleForm = {
    title: 'Sample Quiz Form',
    description: 'A test form with different question types',
    questions: [
      {
        type: 'categorize',
        title: 'Categorize these animals',
        description: 'Drag each animal to the correct category',
        required: true,
        config: {
          categories: [
            { id: 'mammals', label: 'Mammals', color: '#3B82F6' },
            { id: 'birds', label: 'Birds', color: '#10B981' }
          ],
          items: [
            { id: 'dog', text: 'Dog', correctCategory: 'mammals' },
            { id: 'eagle', text: 'Eagle', correctCategory: 'birds' },
            { id: 'cat', text: 'Cat', correctCategory: 'mammals' }
          ]
        }
      },
      {
        type: 'cloze',
        title: 'Complete the sentence',
        description: 'Fill in the blanks',
        required: true,
        config: {
          text: 'The {{capital}} of France is {{city}}.',
          blanks: [
            { id: 'blank1', position: 0, correctAnswers: ['capital'], caseSensitive: false },
            { id: 'blank2', position: 1, correctAnswers: ['Paris'], caseSensitive: false }
          ]
        }
      }
    ],
    settings: {
      allowAnonymous: true,
      collectEmail: false,
      showProgressBar: true
    }
  };

  const createResult = await testEndpoint('POST', '/forms', sampleForm, authToken);
  let formId = null;
  
  if (createResult && createResult.data && createResult.data.form) {
    formId = createResult.data.form._id;
    console.log('✅ Form created successfully');
  }

  // Test getting all forms
  console.log('\n3. Getting all forms...');
  await testEndpoint('GET', '/forms', null, authToken);

  // Test getting single form
  if (formId) {
    console.log('\n4. Getting single form...');
    await testEndpoint('GET', `/forms/${formId}`, null, authToken);

    // Test updating form
    console.log('\n5. Updating form...');
    await testEndpoint('PUT', `/forms/${formId}`, {
      title: 'Updated Sample Quiz Form',
      description: 'Updated description'
    }, authToken);

    // Test publishing form
    console.log('\n6. Publishing form...');
    await testEndpoint('POST', `/forms/${formId}/publish`, {
      isPublished: true
    }, authToken);

    // Test accessing published form publicly
    console.log('\n7. Accessing published form publicly...');
    await testEndpoint('GET', `/public/forms/${formId}`);

    // Test duplicating form
    console.log('\n8. Duplicating form...');
    await testEndpoint('POST', `/forms/${formId}/duplicate`, null, authToken);

    // Test unpublishing form
    console.log('\n9. Unpublishing form...');
    await testEndpoint('POST', `/forms/${formId}/publish`, {
      isPublished: false
    }, authToken);
  }

  // Test form validation errors
  console.log('\n10. Testing validation errors...');
  await testEndpoint('POST', '/forms', {
    title: '', // Invalid: empty title
    questions: [
      {
        type: 'invalid-type', // Invalid question type
        title: 'Test Question',
        config: {}
      }
    ]
  }, authToken);

  console.log('\n✅ Form management tests completed!');
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ with built-in fetch support');
  process.exit(1);
}

runFormTests().catch(console.error);