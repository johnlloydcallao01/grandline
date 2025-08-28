/**
 * Debug script to test trainee registration locally
 * This helps identify the exact error without relying on server logs
 */

const testData = {
  firstName: 'Juan',
  middleName: 'Ponze',
  lastName: 'Enrile',
  nameExtension: 'Jr',
  gender: 'male',
  civilStatus: 'single',
  srn: 'SRN-343',
  nationality: 'Filipino',
  birthDate: '2000-12-28',
  placeOfBirth: 'Manila, Philippines',
  completeAddress: 'Manila, Philippines',
  email: 'carlos@gmail.com',
  phoneNumber: '+639092809767',
  username: 'juancarlos',
  password: '@Iamachessgrandmaster23',
  confirmPassword: '@Iamachessgrandmaster23',
  couponCode: '334ssdfsdf',
  emergencyFirstName: 'Johny',
  emergencyMiddleName: 'Buli',
  emergencyLastName: 'Dana',
  emergencyContactNumber: '+639468748743',
  emergencyRelationship: 'relative',
  emergencyCompleteAddress: 'Pangi, Zamboanga',
  agreeToTerms: true
};

async function testRegistration() {
  console.log('🧪 === TESTING TRAINEE REGISTRATION ===');
  console.log('📋 Test data:', {
    ...testData,
    password: '[HIDDEN]',
    confirmPassword: '[HIDDEN]'
  });

  try {
    const response = await fetch('https://grandline-cms.vercel.app/api/trainee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('📋 Parsed response:', responseJson);
      
      if (response.ok) {
        console.log('✅ Registration successful!');
      } else {
        console.log('❌ Registration failed with structured error:', responseJson);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError.message);
      console.log('📄 Response was:', responseText);
    }

  } catch (error) {
    console.error('💥 Network error:', error);
  }
}

// Run the test
testRegistration();
