// Test with the exact data from the form
const exactFormData = {
  agreeToTerms: true,
  birthDate: "2001-01-27",
  civilStatus: "single",
  completeAddress: "Pangi, Ipil, Zamboanga Sibugay",
  confirmPassword: "TestPassword123",
  couponCode: "7897vgjvgh",
  email: "johnlloydcallao@gmail.com",
  emergencyCompleteAddress: "Tital, Ipil, Zamboanga Sibugay",
  emergencyContactNumber: "+639468748743",
  emergencyFirstName: "Celjen",
  emergencyLastName: "Buen",
  emergencyMiddleName: "Bacornay",
  emergencyRelationship: "friend",
  firstName: "John Lloyd",
  gender: "male",
  lastName: "Callao",
  middleName: "Midol",
  nameExtension: "Jr",
  nationality: "Filipino",
  password: "TestPassword123",
  phoneNumber: "+639468748743",
  placeOfBirth: "Manila, Philippines",
  srn: "SRN-343",
  username: "asdasdasd"
};

async function testExactData() {
  try {
    console.log('🧪 Testing with exact form data...');
    
    const response = await fetch('https://grandline-cms.vercel.app/api/trainee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exactFormData)
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response:', responseText);

    if (!response.ok) {
      console.error('❌ Request failed');
    } else {
      console.log('✅ Request successful');
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testExactData();
