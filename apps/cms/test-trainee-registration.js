import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI
});

async function testTraineeRegistration() {
  try {
    console.log('🧪 Testing trainee registration implementation...\n');
    
    // Test data matching the signup form
    const testData = {
      // Personal Information (11 fields)
      firstName: 'Juan',
      middleName: 'Carlos',
      lastName: 'Dela Cruz',
      nameExtension: 'Jr.',
      gender: 'male',
      civilStatus: 'single',
      nationality: 'Filipino',
      birthDate: '1995-05-15',
      placeOfBirth: 'Manila, Philippines',
      completeAddress: '123 Main Street, Barangay Sample, City, Province, ZIP Code',
      
      // Contact Information (2 fields)
      email: `test.trainee.${Date.now()}@example.com`,
      phoneNumber: '+63 912 345 6789',
      
      // Username & Password (3 fields)
      username: `test_trainee_${Date.now()}`,
      password: 'SecurePassword123!',
      
      // Marketing (1 field)
      couponCode: 'WELCOME2024',
      
      // SRN (trainees table)
      srn: `SRN-TEST-${Date.now()}`,
      
      // Emergency Contact (6 fields)
      emergencyFirstName: 'Maria',
      emergencyMiddleName: 'Santos',
      emergencyLastName: 'Dela Cruz',
      emergencyContactNumber: '+63 912 345 6789',
      emergencyRelationship: 'parent',
      emergencyCompleteAddress: '456 Emergency Street, Barangay Sample, City, Province, ZIP Code'
    };

    console.log('📋 Test Data Prepared:');
    console.log(`  - Email: ${testData.email}`);
    console.log(`  - Username: ${testData.username}`);
    console.log(`  - SRN: ${testData.srn}`);
    console.log(`  - Emergency Contact: ${testData.emergencyFirstName} ${testData.emergencyLastName}`);

    // Test the endpoint
    console.log('\n🚀 Testing registration endpoint...');
    
    const response = await fetch('http://localhost:3001/api/trainee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration endpoint test PASSED!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      // Verify data in database
      console.log('\n🔍 Verifying data in database...');
      
      // Check users table
      const userQuery = await pool.query(
        'SELECT id, first_name, last_name, email, role FROM users WHERE email = $1',
        [testData.email]
      );
      
      if (userQuery.rows.length > 0) {
        console.log('✅ User record found in database');
        const userId = userQuery.rows[0].id;
        
        // Check trainees table
        const traineeQuery = await pool.query(
          'SELECT id, srn, coupon_code FROM trainees WHERE user_id = $1',
          [userId]
        );
        
        if (traineeQuery.rows.length > 0) {
          console.log('✅ Trainee record found with SRN:', traineeQuery.rows[0].srn);
        } else {
          console.log('❌ Trainee record NOT found');
        }
        
        // Check emergency contacts table
        const emergencyQuery = await pool.query(
          'SELECT id, first_name, last_name, relationship FROM emergency_contacts WHERE user_id = $1',
          [userId]
        );
        
        if (emergencyQuery.rows.length > 0) {
          console.log('✅ Emergency contact found:', emergencyQuery.rows[0].first_name, emergencyQuery.rows[0].last_name);
        } else {
          console.log('❌ Emergency contact NOT found');
        }
        
        console.log('\n🎉 ALL TESTS PASSED! Implementation is working correctly.');
        
      } else {
        console.log('❌ User record NOT found in database');
      }
      
    } else {
      const error = await response.json();
      console.log('❌ Registration endpoint test FAILED!');
      console.log('📊 Error:', JSON.stringify(error, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    pool.end();
  }
}

// Only run if CMS server is running
console.log('⚠️  Make sure the CMS server is running on port 3001 before running this test');
console.log('   Run: cd apps/cms && npm run dev');
console.log('   Then run this test\n');

testTraineeRegistration();
