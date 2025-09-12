import fetch from 'node-fetch';

/**
 * Test API Key Authentication
 * This script tests both admin and service API keys to see what user data is returned
 */

const API_BASE = 'https://cms.grandlinemaritime.com/api';

// API Keys to test
const ADMIN_API_KEY = '5c4a6003319c5c34cbe294bbf80ca501';
const SERVICE_API_KEY = '13486c38-c99b-489a-bac0-8977d6c2d710';

async function testAPIKeyAuth(apiKey, keyType) {
  console.log(`\n🔍 Testing ${keyType} API Key: ${apiKey}`);
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Get current user info
    console.log('\n📊 Test 1: Getting current user info...');
    const userResponse = await fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User authentication successful!');
      console.log(`   - User ID: ${userData.user?.id}`);
      console.log(`   - Email: ${userData.user?.email}`);
      console.log(`   - Role: ${userData.user?.role}`);
      console.log(`   - API Key Enabled: ${userData.user?.enableAPIKey}`);
    } else {
      console.log(`❌ User authentication failed: ${userResponse.status} ${userResponse.statusText}`);
      const errorText = await userResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
    // Test 2: Try to access courses
    console.log('\n📚 Test 2: Accessing courses...');
    const coursesResponse = await fetch(`${API_BASE}/courses`, {
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      console.log('✅ Courses access successful!');
      console.log(`   - Total courses: ${coursesData.totalDocs}`);
      console.log(`   - Courses returned: ${coursesData.docs?.length}`);
      if (coursesData.docs?.length > 0) {
        console.log(`   - First course: ${coursesData.docs[0].title}`);
      }
    } else {
      console.log(`❌ Courses access failed: ${coursesResponse.status} ${coursesResponse.statusText}`);
      const errorText = await coursesResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
    // Test 3: Check access controls
    console.log('\n🔒 Test 3: Access control analysis...');
    if (userResponse.ok) {
      const userData = await userResponse.json();
      const userRole = userData.user?.role;
      
      console.log(`   - User role: ${userRole}`);
      console.log(`   - Expected access for courses:`);
      
      if (userRole === 'admin') {
        console.log('     ✅ Admin should have READ access to courses');
      } else if (userRole === 'service') {
        console.log('     ✅ Service should have read access to courses');
      } else {
        console.log('     ❌ Other roles should NOT have read access to courses');
      }
    }
    
  } catch (error) {
    console.error(`💥 Error testing ${keyType} API key:`, error.message);
  }
}

async function main() {
  console.log('🚀 API KEY AUTHENTICATION TEST');
  console.log('==============================');
  
  // Test admin API key
  await testAPIKeyAuth(ADMIN_API_KEY, 'ADMIN');
  
  // Test service API key
  await testAPIKeyAuth(SERVICE_API_KEY, 'SERVICE');
  
  console.log('\n📋 SUMMARY');
  console.log('===========');
  console.log('This test helps identify:');
  console.log('1. Whether API keys authenticate correctly');
  console.log('2. What user role is returned for each key');
  console.log('3. Whether access controls are working as expected');
  console.log('4. Any discrepancies between admin and service access');
}

main().catch(console.error);