import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkUserId1() {
  try {
    console.log('🔍 CHECKING USER ID 1 (from JWT token)...\n');
    
    // Check user with ID 1 (from the JWT token)
    const user = await pool.query(`
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        middle_name, 
        role,
        is_active,
        created_at,
        updated_at
      FROM public.users 
      WHERE id = 1
    `);
    
    if (user.rows.length > 0) {
      const userData = user.rows[0];
      console.log('📊 USER ID 1 DATA:');
      console.log(`  - ID: ${userData.id}`);
      console.log(`  - Email: ${userData.email}`);
      console.log(`  - First Name: ${userData.first_name}`);
      console.log(`  - Last Name: ${userData.last_name}`);
      console.log(`  - Middle Name: ${userData.middle_name}`);
      console.log(`  - Role: ${userData.role}`);
      console.log(`  - Is Active: ${userData.is_active}`);
      console.log(`  - Created: ${userData.created_at}`);
      console.log(`  - Updated: ${userData.updated_at}`);
      
      console.log('\n🎯 EXPECTED PAYLOADCMS RESPONSE:');
      console.log('  {');
      console.log(`    "user": {`);
      console.log(`      "id": ${userData.id},`);
      console.log(`      "email": "${userData.email}",`);
      console.log(`      "firstName": "${userData.first_name}",`);
      console.log(`      "lastName": "${userData.last_name}",`);
      console.log(`      "middleName": "${userData.middle_name}",`);
      console.log(`      "role": "${userData.role}",`);
      console.log(`      "isActive": ${userData.is_active}`);
      console.log(`    }`);
      console.log('  }');
      
    } else {
      console.log('❌ NO USER FOUND WITH ID 1');
    }
    
    // Also check if there are any users with the email from JWT
    const emailUser = await pool.query(`
      SELECT id, email, first_name, last_name, role
      FROM public.users 
      WHERE email = 'johnlloydcallao@gmail.com'
    `);
    
    console.log('\n📧 USER WITH EMAIL johnlloydcallao@gmail.com:');
    if (emailUser.rows.length > 0) {
      emailUser.rows.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Role: ${user.role}`);
      });
    } else {
      console.log('  ❌ No user found with that email');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserId1();
