/**
 * Test script to verify PayloadCMS authentication
 * Run with: node test-payloadcms-auth.js
 */

const API_URL = 'https://grandline-cms.vercel.app/api';

async function testPayloadCMSAuth() {
  console.log('🔍 Testing PayloadCMS authentication...');
  console.log('📍 API URL:', API_URL);

  try {
    // Test login endpoint
    console.log('\n1. Testing login endpoint...');
    const loginResponse = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'johnlloydcallao@gmail.com',
        password: '@Iamachessgrandmaster23'
      }),
    });

    console.log('📊 Login Response Status:', loginResponse.status);
    console.log('📊 Login Response Headers:');
    for (const [key, value] of loginResponse.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('📊 Login Response Data:');
      console.log('   Has user:', !!loginData.user);
      console.log('   Has token:', !!loginData.token);
      console.log('   User role:', loginData.user?.role);
      console.log('   User email:', loginData.user?.email);
      
      if (loginData.token) {
        console.log('   Token preview:', loginData.token.substring(0, 50) + '...');
      }

      // Test /users/me endpoint
      console.log('\n2. Testing /users/me endpoint...');
      const meResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Me Response Status:', meResponse.status);
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('📊 Me Response Data:');
        console.log('   Has user:', !!meData.user);
        console.log('   User role:', meData.user?.role);
        console.log('   User email:', meData.user?.email);
      } else {
        console.log('❌ /users/me failed');
      }

    } else {
      const errorData = await loginResponse.json().catch(() => ({}));
      console.log('❌ Login failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPayloadCMSAuth();
