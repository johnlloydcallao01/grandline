// Test script to verify trainee registration endpoint
const testData = {
  // Personal Information
  firstName: 'Juan',
  middleName: 'Carlos',
  lastName: 'Dela Cruz',
  nameExtension: 'Jr.',
  gender: 'male',
  civilStatus: 'single',
  srn: 'SRN-TEST123',
  nationality: 'Filipino',
  birthDate: '1995-05-15',
  placeOfBirth: 'Manila, Philippines',
  completeAddress: '123 Main Street, Barangay Sample, Manila, Metro Manila, 1000',

  // Contact Information
  email: 'juan.delacruz.test@example.com',
  phoneNumber: '+63 912 345 6789',

  // Username & Password
  username: 'juan_delacruz_test',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!',

  // Marketing
  couponCode: 'WELCOME2024',

  // Emergency Contact
  emergencyFirstName: 'Maria',
  emergencyMiddleName: 'Santos',
  emergencyLastName: 'Dela Cruz',
  emergencyContactNumber: '+63 917 123 4567',
  emergencyRelationship: 'parent',
  emergencyCompleteAddress: '456 Emergency Street, Barangay Sample, Manila, Metro Manila, 1000',

  // Terms
  agreeToTerms: true
};

async function testRegistration() {
  try {
    console.log('🚀 Testing trainee registration endpoint...');
    console.log('📋 Test data:', {
      ...testData,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });

    const response = await fetch('https://grandline-cms.vercel.app/api/trainee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration successful!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.json();
      console.error('❌ Registration failed:');
      console.error('📊 Error:', JSON.stringify(error, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRegistration();
