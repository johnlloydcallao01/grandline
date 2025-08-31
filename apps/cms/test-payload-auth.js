import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function testPayloadAuth() {
  try {
    console.log('🔍 TESTING PAYLOADCMS AUTHENTICATION ISSUE...\n');
    
    // 1. Check if user has all required PayloadCMS auth fields
    console.log('1️⃣ CHECKING PAYLOADCMS AUTH FIELDS FOR USER ID 1:');
    const authFields = await pool.query(`
      SELECT 
        id, 
        email, 
        hash, 
        salt,
        login_attempts,
        lock_until,
        reset_password_token,
        reset_password_expiration,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        updated_at
      FROM public.users 
      WHERE id = 1
    `);
    
    if (authFields.rows.length > 0) {
      const user = authFields.rows[0];
      console.log('  ✅ User found:');
      console.log(`    - ID: ${user.id}`);
      console.log(`    - Email: ${user.email}`);
      console.log(`    - Has hash: ${user.hash ? 'Yes' : 'No'}`);
      console.log(`    - Has salt: ${user.salt ? 'Yes' : 'No'}`);
      console.log(`    - Login attempts: ${user.login_attempts || 0}`);
      console.log(`    - Lock until: ${user.lock_until || 'Not locked'}`);
      console.log(`    - Reset token: ${user.reset_password_token ? 'Yes' : 'No'}`);
      console.log(`    - First name: ${user.first_name}`);
      console.log(`    - Last name: ${user.last_name}`);
      console.log(`    - Role: ${user.role}`);
      console.log(`    - Is active: ${user.is_active}`);
      
      // Check for potential issues
      console.log('\n  🔍 POTENTIAL ISSUES:');
      if (!user.hash) {
        console.log('    ❌ CRITICAL: No password hash - user cannot authenticate');
      }
      if (!user.salt) {
        console.log('    ❌ CRITICAL: No password salt - user cannot authenticate');
      }
      if (!user.is_active) {
        console.log('    ❌ CRITICAL: User is not active');
      }
      if (user.lock_until && new Date(user.lock_until) > new Date()) {
        console.log('    ❌ CRITICAL: User account is locked');
      }
      if (!user.email) {
        console.log('    ❌ CRITICAL: No email address');
      }
      
      if (user.hash && user.salt && user.is_active && user.email) {
        console.log('    ✅ All critical auth fields present');
      }
      
    } else {
      console.log('  ❌ User ID 1 not found');
    }
    
    // 2. Check if there are any duplicate users with same email
    console.log('\n2️⃣ CHECKING FOR DUPLICATE USERS:');
    const duplicates = await pool.query(`
      SELECT id, email, first_name, last_name, role, is_active
      FROM public.users 
      WHERE email = 'johnlloydcallao@gmail.com'
      ORDER BY id
    `);
    
    console.log(`  Found ${duplicates.rows.length} users with email johnlloydcallao@gmail.com:`);
    duplicates.rows.forEach(user => {
      console.log(`    - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Role: ${user.role}, Active: ${user.is_active}`);
    });
    
    // 3. Check PayloadCMS specific tables
    console.log('\n3️⃣ CHECKING PAYLOADCMS TABLES:');
    
    // Check if there are any PayloadCMS specific tables that might affect auth
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%payload%'
      ORDER BY table_name
    `);
    
    console.log('  PayloadCMS tables:');
    tables.rows.forEach(table => {
      console.log(`    - ${table.table_name}`);
    });
    
    // 4. Test JWT token decoding
    console.log('\n4️⃣ JWT TOKEN ANALYSIS:');
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY29sbGVjdGlvbiI6InVzZXJzIiwiZW1haWwiOiJqb2hubGxveWRjYWxsYW9AZ21haWwuY29tIiwic2lkIjoiZTc1OGUzY2MtMjc3ZC00NDIyLTg4MzEtOTZiNjI4MjZiZjQ2IiwiaWF0IjoxNzU2NjE4NTMzLCJleHAiOjE3NTY2MjU3MzN9.Ee1OwDQsPHee1emA8YEJ-ic2GZND60QhR6ReOlcqrZ4';
    
    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      console.log('  JWT Payload:');
      console.log(`    - ID: ${payload.id}`);
      console.log(`    - Collection: ${payload.collection}`);
      console.log(`    - Email: ${payload.email}`);
      console.log(`    - Session ID: ${payload.sid}`);
      console.log(`    - Issued at: ${new Date(payload.iat * 1000)}`);
      console.log(`    - Expires at: ${new Date(payload.exp * 1000)}`);
      console.log(`    - Is expired: ${new Date() > new Date(payload.exp * 1000)}`);
      
      // Check if JWT data matches database
      if (payload.id === 1 && payload.email === 'johnlloydcallao@gmail.com') {
        console.log('  ✅ JWT data matches database user');
      } else {
        console.log('  ❌ JWT data does not match database user');
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to decode JWT: ${error.message}`);
    }
    
    console.log('\n💡 DIAGNOSIS:');
    console.log('  The issue is likely one of:');
    console.log('  1. PayloadCMS auth configuration mismatch');
    console.log('  2. Missing required auth fields in database');
    console.log('  3. JWT token validation failing on PayloadCMS side');
    console.log('  4. PayloadCMS looking for user in wrong table/schema');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testPayloadAuth();
