/**
 * Browser console test script for trainee registration debugging
 * Copy and paste this into the browser console to test registration
 */

// Test data with unique values to avoid conflicts
const testData = {
  firstName: 'DebugUser',
  middleName: 'Test',
  lastName: 'Registration',
  nameExtension: '',
  gender: 'male',
  civilStatus: 'single',
  srn: 'SRN-DEBUG-' + Date.now(), // Unique SRN
  nationality: 'Filipino',
  birthDate: '1990-01-01',
  placeOfBirth: 'Manila, Philippines',
  completeAddress: 'Debug Address, Manila',
  email: 'debug' + Date.now() + '@example.com', // Unique email
  phoneNumber: '+639123456789',
  username: 'debuguser' + Date.now(), // Unique username
  password: 'DebugPassword123!',
  confirmPassword: 'DebugPassword123!',
  couponCode: '',
  emergencyFirstName: 'Emergency',
  emergencyMiddleName: 'Debug',
  emergencyLastName: 'Contact',
  emergencyContactNumber: '+639987654321',
  emergencyRelationship: 'parent',
  emergencyCompleteAddress: 'Emergency Debug Address, Manila',
  agreeToTerms: true
};

async function debugRegistration() {
  console.log('🐛 === DEBUGGING TRAINEE REGISTRATION ===');
  console.log('📋 Debug test data:', {
    ...testData,
    password: '[HIDDEN]',
    confirmPassword: '[HIDDEN]'
  });

  try {
    console.log('📡 Sending registration request...');

    const response = await fetch('https://cms.grandlinemaritime.com/api/trainee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Get response text first
    const responseText = await response.text();
    console.log('📄 Raw response text (first 500 chars):', responseText.substring(0, 500));
    console.log('📄 Full raw response:', responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📋 Parsed response data:', responseData);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.log('📄 Response was not valid JSON. Full text:', responseText);
      
      // Check if it's HTML (common for server errors)
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        console.log('🔍 Response appears to be HTML (likely an error page)');
        
        // Try to extract error message from HTML
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          console.log('📄 HTML Title:', titleMatch[1]);
        }
      }
      return;
    }

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('🎉 Created user:', responseData.data?.user);
      console.log('🎓 Created trainee:', responseData.data?.trainee);
      console.log('🚨 Created emergency contact:', responseData.data?.emergencyContact);
    } else {
      console.log('❌ Registration failed');
      console.log('📋 Error details:', responseData);
      
      if (responseData.type) {
        console.log('🔍 Error type:', responseData.type);
      }
      if (responseData.field) {
        console.log('🔍 Problem field:', responseData.field);
      }
      if (responseData.details) {
        console.log('🔍 Error details:', responseData.details);
      }
    }

  } catch (error) {
    console.error('💥 Network or other error:', error);
    console.error('💥 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the debug test
console.log('🐛 Starting registration debug test...');
debugRegistration();
