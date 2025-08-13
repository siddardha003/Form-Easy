// Test script for response collection endpoints
// Run with: node test-responses.js

const API_BASE = 'http://localhost:5000/api';

let authToken = '';
let formId = '';

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

async function runResponseTests() {
  console.log('🧪 Testing Response Collection Endpoints...\n');

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

  // Create a test form first
  console.log('\n2. Creating a test form...');
  const sampleForm = {
    title: 'Response Test Form',
    description: 'A form for testing response collection',
    questions: [
      {
        type: 'categorize',
        title: 'Categorize Programming Languages',
        description: 'Drag each language to the correct category',
        required: true,
        config: {
          categories: [
            { id: 'frontend', label: 'Frontend', color: '#3B82F6' },
            { id: 'backend', label: 'Backend', color: '#10B981' }
          ],
          items: [
            { id: 'javascript', text: 'JavaScript', correctCategory: 'frontend' },
            { id: 'python', text: 'Python', correctCategory: 'backend' },
            { id: 'react', text: 'React', correctCategory: 'frontend' }
          ]
        },
        scoring: {
          enabled: true,
          points: 10
        }
      },
      {
        type: 'cloze',
        title: 'Complete the Code',
        description: 'Fill in the missing parts',
        required: true,
        config: {
          text: 'function {{functionName}}() { return {{returnValue}}; }',
          blanks: [
            { id: 'blank1', position: 0, correctAnswers: ['hello', 'greet'], caseSensitive: false },
            { id: 'blank2', position: 1, correctAnswers: ['Hello World', 'hello world'], caseSensitive: false }
          ]
        },
        scoring: {
          enabled: true,
          points: 5
        }
      }
    ],
    settings: {
      isPublished: true,
      allowAnonymous: true,
      collectEmail: false,
      allowMultipleSubmissions: true
    }
  };

  const createResult = await testEndpoint('POST', '/forms', sampleForm, authToken);
  
  if (createResult && createResult.data && createResult.data.form) {
    formId = createResult.data.form._id;
    console.log('✅ Form created successfully');
  } else {
    console.log('❌ Failed to create form');
    return;
  }

  // Test submitting a response
  console.log('\n3. Submitting a form response...');
  const sampleResponse = {
    formId: formId,
    answers: [
      {
        questionId: createResult.data.form.questions[0].id,
        questionType: 'categorize',
        answer: {
          'javascript': 'frontend',
          'python': 'backend',
          'react': 'frontend'
        },
        timeSpent: 45
      },
      {
        questionId: createResult.data.form.questions[1].id,
        questionType: 'cloze',
        answer: ['hello', 'Hello World'],
        timeSpent: 30
      }
    ],
    respondentEmail: 'respondent@example.com',
    respondentName: 'John Respondent',
    startedAt: new Date(Date.now() - 75000).toISOString(), // Started 75 seconds ago
    totalTimeSpent: 75
  };

  const submitResult = await testEndpoint('POST', '/responses', sampleResponse);
  let responseId = null;
  
  if (submitResult && submitResult.data && submitResult.data.responseId) {
    responseId = submitResult.data.responseId;
    console.log('✅ Response submitted successfully');
  }

  // Test submitting another response
  console.log('\n4. Submitting another response...');
  const anotherResponse = {
    formId: formId,
    answers: [
      {
        questionId: createResult.data.form.questions[0].id,
        questionType: 'categorize',
        answer: {
          'javascript': 'backend', // Wrong answer
          'python': 'backend',
          'react': 'backend' // Wrong answer
        },
        timeSpent: 60
      },
      {
        questionId: createResult.data.form.questions[1].id,
        questionType: 'cloze',
        answer: ['test', 'wrong'], // Wrong answers
        timeSpent: 40
      }
    ],
    respondentEmail: 'another@example.com',
    startedAt: new Date(Date.now() - 100000).toISOString(),
    totalTimeSpent: 100
  };

  await testEndpoint('POST', '/responses', anotherResponse);

  // Test getting form responses
  console.log('\n5. Getting form responses...');
  await testEndpoint('GET', `/forms/${formId}/responses`, null, authToken);

  // Test getting single response
  if (responseId) {
    console.log('\n6. Getting single response...');
    await testEndpoint('GET', `/responses/${responseId}`, null, authToken);
  }

  // Test validation errors
  console.log('\n7. Testing validation errors...');
  
  // Missing required answer
  await testEndpoint('POST', '/responses', {
    formId: formId,
    answers: [
      {
        questionId: createResult.data.form.questions[0].id,
        questionType: 'categorize',
        answer: {
          'javascript': 'frontend'
          // Missing other required items
        }
      }
      // Missing second required question
    ]
  });

  // Invalid answer format
  await testEndpoint('POST', '/responses', {
    formId: formId,
    answers: [
      {
        questionId: createResult.data.form.questions[0].id,
        questionType: 'categorize',
        answer: 'invalid-format' // Should be object
      }
    ]
  });

  // Test accessing responses without permission
  console.log('\n8. Testing unauthorized access...');
  await testEndpoint('GET', `/forms/${formId}/responses`); // No token

  console.log('\n✅ Response collection tests completed!');
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ with built-in fetch support');
  process.exit(1);
}

runResponseTests().catch(console.error);