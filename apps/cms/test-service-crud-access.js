// Configuration
const API_BASE_URL = 'https://cms.grandlinemaritime.com/api';
const SERVICE_API_KEY = '13486c38-c99b-489a-bac0-8977d6c2d710';

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      headers: {
        'Authorization': `users API-Key ${SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      status: 'ERROR',
      message: error.message,
      data: null
    };
  }
}

async function testServiceCRUDAccess() {
  console.log('=== Testing Service Account CRUD Access After Redeployment ===\n');
  
  // Test 1: READ - Get all courses
  console.log('1. Testing READ access (GET /api/courses)');
  const readResult = await makeRequest('GET', '/courses');
  console.log(`   Status: ${readResult.status}`);
  console.log(`   Success: ${readResult.success}`);
  if (readResult.success) {
    console.log(`   Courses found: ${readResult.data.docs?.length || 0}`);
  } else {
    console.log(`   Error: ${readResult.message}`);
    console.log(`   Response:`, JSON.stringify(readResult.data, null, 2));
  }
  console.log('');
  
  // Get instructors to use in course creation
  console.log('1.5. Getting instructors for course creation');
  const instructorsResult = await makeRequest('GET', '/instructors');
  console.log(`   Status: ${instructorsResult.status}`);
  console.log(`   Success: ${instructorsResult.success}`);
  
  let instructorId = null;
  if (instructorsResult.success && instructorsResult.data.docs?.length > 0) {
    instructorId = instructorsResult.data.docs[0].id;
    console.log(`   Using instructor ID: ${instructorId}`);
  } else {
    console.log(`   No instructors found or error occurred`);
    console.log(`   Response:`, JSON.stringify(instructorsResult.data, null, 2));
  }
  console.log('');
  
  // Test 2: CREATE - Create a new test course
  console.log('2. Testing CREATE access (POST /api/courses)');
  
  if (!instructorId) {
    console.log('   Skipping CREATE test - no instructor available');
    console.log('   Note: instructor field is required for course creation');
    console.log('');
    console.log('3. Skipping UPDATE test - course creation failed');
    console.log('4. Skipping DELETE test - course creation failed');
    console.log('\n=== Service Account CRUD Test Complete ===');
    return;
  }
  
  const testCourse = {
    title: 'Test Course - Service API After Redeploy',
    courseCode: `TEST-REDEPLOY-${Date.now()}`,
    excerpt: 'This is a test course created via service API key after redeployment',
    instructor: instructorId,
    price: 99.99,
    difficultyLevel: 'beginner',
    language: 'en',
    passingGrade: 70,
    status: 'draft'
  };
  
  const createResult = await makeRequest('POST', '/courses', testCourse);
  console.log(`   Status: ${createResult.status}`);
  console.log(`   Success: ${createResult.success}`);
  
  let createdCourseId = null;
  if (createResult.success) {
    createdCourseId = createResult.data.doc?.id;
    console.log(`   ✅ Created course ID: ${createdCourseId}`);
    console.log(`   ✅ Created course title: ${createResult.data.doc?.title}`);
  } else {
    console.log(`   ❌ Error: ${createResult.message || 'Unknown error'}`);
    console.log(`   Response:`, JSON.stringify(createResult.data, null, 2));
  }
  console.log('');
  
  // Test 3: UPDATE - Update the created course (if creation was successful)
  if (createdCourseId) {
    console.log('3. Testing UPDATE access (PATCH /api/courses/:id)');
    const updateData = {
      title: 'Updated Test Course - Service API After Redeploy',
      excerpt: 'This course has been updated via service API key after redeployment',
      price: 149.99
    };
    
    const updateResult = await makeRequest('PATCH', `/courses/${createdCourseId}`, updateData);
    console.log(`   Status: ${updateResult.status}`);
    console.log(`   Success: ${updateResult.success}`);
    
    if (updateResult.success) {
      console.log(`   ✅ Updated course title: ${updateResult.data.doc?.title}`);
      console.log(`   ✅ Updated price: $${updateResult.data.doc?.price}`);
    } else {
      console.log(`   ❌ Error: ${updateResult.message || 'Unknown error'}`);
      console.log(`   Response:`, JSON.stringify(updateResult.data, null, 2));
    }
    console.log('');
    
    // Test 4: DELETE - Delete the created course
    console.log('4. Testing DELETE access (DELETE /api/courses/:id)');
    const deleteResult = await makeRequest('DELETE', `/courses/${createdCourseId}`);
    console.log(`   Status: ${deleteResult.status}`);
    console.log(`   Success: ${deleteResult.success}`);
    
    if (deleteResult.success) {
      console.log(`   ✅ Successfully deleted course: ${createdCourseId}`);
    } else {
      console.log(`   ❌ Error: ${deleteResult.message || 'Unknown error'}`);
      console.log(`   Response:`, JSON.stringify(deleteResult.data, null, 2));
    }
  } else {
    console.log('3. Skipping UPDATE test - course creation failed');
    console.log('4. Skipping DELETE test - course creation failed');
  }
  
  console.log('\n=== Service Account CRUD Test Complete ===');
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`READ: ${readResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CREATE: ${createResult?.success ? '✅ PASS' : '❌ FAIL'}`);
  if (createdCourseId) {
    console.log(`UPDATE: ${updateResult?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`DELETE: ${deleteResult?.success ? '✅ PASS' : '❌ FAIL'}`);
  } else {
    console.log('UPDATE: ⏭️ SKIPPED');
    console.log('DELETE: ⏭️ SKIPPED');
  }
}

// Run the test
testServiceCRUDAccess().catch(console.error);