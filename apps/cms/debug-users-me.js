import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function debugUsersMeEndpoint() {
  try {
    console.log('🔍 DEEP ANALYSIS: /users/me ENDPOINT ISSUE\n');
    
    // 1. Decode and analyze the JWT token
    console.log('1️⃣ JWT TOKEN ANALYSIS:');
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY29sbGVjdGlvbiI6InVzZXJzIiwiZW1haWwiOiJqb2hubGxveWRjYWxsYW9AZ21haWwuY29tIiwic2lkIjoiZTc1OGUzY2MtMjc3ZC00NDIyLTg4MzEtOTZiNjI4MjZiZjQ2IiwiaWF0IjoxNzU2NjE4NTMzLCJleHAiOjE3NTY2MjU3MzN9.Ee1OwDQsPHee1emA8YEJ-ic2GZND60QhR6ReOlcqrZ4';
    
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      console.log('  JWT Payload:');
      console.log(`    - User ID: ${payload.id}`);
      console.log(`    - Collection: ${payload.collection}`);
      console.log(`    - Email: ${payload.email}`);
      console.log(`    - Session ID: ${payload.sid}`);
      console.log(`    - Issued: ${new Date(payload.iat * 1000)}`);
      console.log(`    - Expires: ${new Date(payload.exp * 1000)}`);
      console.log(`    - Is Expired: ${new Date() > new Date(payload.exp * 1000)}`);
      
      // 2. Check if JWT can be verified with current secret
      console.log('\n2️⃣ JWT VERIFICATION TEST:');
      const secret = process.env.PAYLOAD_SECRET;
      console.log(`  PayloadCMS Secret exists: ${!!secret}`);
      console.log(`  Secret length: ${secret ? secret.length : 0} characters`);
      
      if (secret) {
        console.log('  ✅ PAYLOAD_SECRET is configured');
        console.log('  Note: JWT verification requires jsonwebtoken library');
      } else {
        console.log('  ❌ No PAYLOAD_SECRET found in environment');
        console.log('  🚨 THIS IS LIKELY THE ROOT CAUSE!');
      }
      
      // 3. Check database user record
      console.log('\n3️⃣ DATABASE USER VERIFICATION:');
      const userQuery = await pool.query(`
        SELECT 
          id, email, first_name, last_name, role, is_active,
          hash IS NOT NULL as has_password,
          salt IS NOT NULL as has_salt,
          login_attempts,
          lock_until,
          created_at,
          updated_at
        FROM public.users 
        WHERE id = $1 AND email = $2
      `, [payload.id, payload.email]);
      
      if (userQuery.rows.length > 0) {
        const user = userQuery.rows[0];
        console.log('  ✅ User found in database:');
        console.log(`    - ID: ${user.id}`);
        console.log(`    - Email: ${user.email}`);
        console.log(`    - Name: ${user.first_name} ${user.last_name}`);
        console.log(`    - Role: ${user.role}`);
        console.log(`    - Active: ${user.is_active}`);
        console.log(`    - Has Password: ${user.has_password}`);
        console.log(`    - Has Salt: ${user.has_salt}`);
        console.log(`    - Login Attempts: ${user.login_attempts || 0}`);
        console.log(`    - Locked Until: ${user.lock_until || 'Not locked'}`);
        
        // Check for account issues
        if (!user.is_active) {
          console.log('  ❌ ISSUE: User account is not active');
        }
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
          console.log('  ❌ ISSUE: User account is locked');
        }
        if (!user.has_password || !user.has_salt) {
          console.log('  ❌ ISSUE: User missing password/salt');
        }
        
      } else {
        console.log('  ❌ User NOT found in database with JWT credentials');
      }
      
      // 4. Check PayloadCMS specific tables
      console.log('\n4️⃣ PAYLOADCMS SESSIONS CHECK:');
      
      // Check if there are any session-related tables
      const sessionTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE '%session%' OR table_name LIKE '%token%' OR table_name LIKE '%auth%')
        ORDER BY table_name
      `);
      
      console.log('  Session/Auth related tables:');
      if (sessionTables.rows.length > 0) {
        sessionTables.rows.forEach(table => {
          console.log(`    - ${table.table_name}`);
        });
        
        // Check if there's a sessions table with our session ID
        try {
          const sessionCheck = await pool.query(`
            SELECT * FROM information_schema.columns 
            WHERE table_name = 'sessions' OR table_name = 'user_sessions'
            ORDER BY table_name, ordinal_position
          `);
          
          if (sessionCheck.rows.length > 0) {
            console.log('  Session table structure found');
          }
        } catch (e) {
          console.log('  No standard session tables found');
        }
      } else {
        console.log('    - No session/auth tables found');
      }
      
      // 5. Test PayloadCMS API directly
      console.log('\n5️⃣ PAYLOADCMS API TEST:');
      console.log('  Testing both endpoints with same JWT token...');
      
      const apiUrl = 'https://grandline-cms.vercel.app/api';
      const headers = {
        'Cookie': `payload-token=${jwtToken}`,
        'Content-Type': 'application/json'
      };
      
      // Test /users endpoint
      try {
        const usersResponse = await fetch(`${apiUrl}/users`, { headers });
        console.log(`  /users endpoint: ${usersResponse.status}`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log(`    - Returns: ${usersData.docs ? usersData.docs.length : 0} users`);
        }
      } catch (e) {
        console.log(`  /users endpoint: ERROR - ${e.message}`);
      }
      
      // Test /users/me endpoint
      try {
        const meResponse = await fetch(`${apiUrl}/users/me`, { headers });
        console.log(`  /users/me endpoint: ${meResponse.status}`);
        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log(`    - Returns: ${JSON.stringify(meData)}`);
        }
      } catch (e) {
        console.log(`  /users/me endpoint: ERROR - ${e.message}`);
      }
      
      // 6. Diagnosis
      console.log('\n🎯 DIAGNOSIS:');
      console.log('Based on the analysis:');
      
      if (secret) {
        console.log('✅ PAYLOAD_SECRET is configured');
        console.log('❓ Issue might be in PayloadCMS user lookup logic or JWT validation');
        console.log('💡 Recommendation: Try re-login to get fresh token');
      } else {
        console.log('❌ No PAYLOAD_SECRET configured');
        console.log('💡 Recommendation: Set PAYLOAD_SECRET environment variable');
        console.log('🚨 This is likely why /users/me returns user: null');
      }
      
    } catch (error) {
      console.log(`❌ Failed to decode JWT: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugUsersMeEndpoint();
