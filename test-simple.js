// Simple test to check if the endpoint is accessible
async function testEndpoint() {
  try {
    console.log('🔍 Testing endpoint accessibility...');
    
    // Test with minimal required data
    const minimalData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPass123',
      srn: 'SRN-TEST',
      emergencyFirstName: 'Emergency',
      emergencyMiddleName: 'Middle',
      emergencyLastName: 'Contact',
      emergencyContactNumber: '+63 912 345 6789',
      emergencyRelationship: 'parent',
      emergencyCompleteAddress: '123 Test Street'
    };

    const response = await fetch('https://grandline-cms.vercel.app/api/trainee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData)
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('Response:', responseText);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEndpoint();
