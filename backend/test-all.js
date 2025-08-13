// Comprehensive test script for all backend endpoints
// Run with: node test-all.js

const API_BASE = 'http://localhost:5000/api';

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
    
    console.log(`${method} ${endpoint} - Status: ${response.status}`);
    if (!response.ok) {
      console.log('Error:', result.error?.message || 'Unknown error');
    }
    
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🧪 Running Comprehensive Backend Tests...\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  let authToken = '';
  let formId = '';

  // Helper function to track test results
  const test = async (name, testFn) => {
    testsTotal++;
    console.log(`\n${testsTotal}. ${name}`);
    try {
      const result = await testFn();
      if (result.success) {
        testsPassed++;
        console.log('✅ PASSED');
        return result;
      } else {
        console.log('❌ FAILED:', result.error || result.data?.error?.message);
        return result;
      }
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 1. Health Check
  await test('Health Check', async () => {
    return await testEndpoint('GET', '/health');
  });

  // 2. User Registration
  const registerResult = await test('User Registration', async () => {
    return await testEndpoint('POST', '/auth/register', {
      email: 'testuser@example.com',
      password: 'Test123456',
      firstName: 'Test',
      lastName: 'User'
    });
  });

  // 3. User Login
  const loginResult = await test('User Login', async () => {
    return await testEndpoint('POST', '/auth/login', {
      email: 'testuser@example.com',
      password: 'Test123456'
    });
  });

  if (loginResult.success && loginResult.data.data?.token) {
    authToken = loginResult.data.data.token;
  }

  // 4. Get Current User
  await test('Get Current User', async () => {
    return await testEndpoint('GET', '/auth/me', null, authToken);
  });

  // 5. Create Form
  const createFormResult = await test('Create Form', async () => {
    return await testEndpoint('POST', '/forms', {
      title: 'Test Form',
      description: 'A comprehensive test form',
      questions: [
        {
          type: 'categorize',
          title: 'Categorize Animals',
          required: true,
          config: {
            categories: [
              { id: 'mammals', label: 'Mammals' },
              { id: 'birds', label: 'Birds' }
            ],
            items: [
              { id: 'dog', text: 'Dog', correctCategory: 'mammals' },
              { id: 'eagle', text: 'Eagle', correctCategory: 'birds' }
            ]
          }
        },
        {
          type: 'cloze',
          title: 'Fill in the blanks',
          required: true,
          config: {
            text: 'The {{capital}} of France is {{city}}.',
            blanks: [
              { id: 'blank1', position: 0, correctAnswers: ['capital'] },
              { id: 'blank2', position: 1, correctAnswers: ['Paris'] }
            ]
          }
        }
      ]
    }, authToken);
  });

  if (createFormResult.success && createFormResult.data.data?.form?._id) {
    formId = createFormResult.data.data.form._id;
  }

  // 6. Get All Forms
  await test('Get All Forms', async () => {
    return await testEndpoint('GET', '/forms', null, authToken);
  });

  // 7. Get Single Form
  await test('Get Single Form', async () => {
    return await testEndpoint('GET', `/forms/${formId}`, null, authToken);
  });

  // 8. Update Form
  await test('Update Form', async () => {
    return await testEndpoint('PUT', `/forms/${formId}`, {
      title: 'Updated Test Form'
    }, authToken);
  });

  // 9. Publish Form
  await test('Publish Form', async () => {
    return await testEndpoint('POST', `/forms/${formId}/publish`, {
      isPublished: true
    }, authToken);
  });

  // 10. Access Published Form Publicly
  await test('Access Published Form Publicly', async () => {
    return await testEndpoint('GET', `/public/forms/${formId}`);
  });

  // 11. Submit Form Response
  const submitResponseResult = await test('Submit Form Response', async () => {
    const form = createFormResult.data.data.form;
    return await testEndpoint('POST', '/responses', {
      formId: formId,
      answers: [
        {
          questionId: form.questions[0].id,
          questionType: 'categorize',
          answer: {
            'dog': 'mammals',
            'eagle': 'birds'
          },
          timeSpent: 30
        },
        {
          questionId: form.questions[1].id,
          questionType: 'cloze',
          answer: ['capital', 'Paris'],
          timeSpent: 20
        }
      ],
      respondentEmail: 'respondent@example.com',
      totalTimeSpent: 50
    });
  });

  // 12. Get Form Responses
  await test('Get Form Responses', async () => {
    return await testEndpoint('GET', `/forms/${formId}/responses`, null, authToken);
  });

  // 13. Duplicate Form
  await test('Duplicate Form', async () => {
    return await testEndpoint('POST', `/forms/${formId}/duplicate`, null, authToken);
  });

  // 14. Test Invalid Operations
  await test('Test Unauthorized Access', async () => {
    const result = await testEndpoint('GET', '/forms');
    return { success: !result.success }; // Should fail without token
  });

  await test('Test Invalid Form Creation', async () => {
    const result = await testEndpoint('POST', '/forms', {
      title: '', // Invalid: empty title
      questions: []
    }, authToken);
    return { success: !result.success }; // Should fail validation
  });

  await test('Test Invalid Response Submission', async () => {
    const result = await testEndpoint('POST', '/responses', {
      formId: 'invalid-id',
      answers: []
    });
    return { success: !result.success }; // Should fail validation
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testsTotal}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsTotal - testsPassed}`);
  console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n📝 Backend Features Tested:');
  console.log('✅ User Authentication (Register, Login, JWT)');
  console.log('✅ Form Management (CRUD operations)');
  console.log('✅ Form Publishing and Public Access');
  console.log('✅ Response Collection and Validation');
  console.log('✅ Question Types (Categorize, Cloze)');
  console.log('✅ Error Handling and Validation');
  console.log('✅ Authorization and Security');
  
  console.log('\n🚀 Ready to start frontend development!');
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ with built-in fetch support');
  process.exit(1);
}

runAllTests().catch(console.error);