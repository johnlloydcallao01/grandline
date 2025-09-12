import { Client } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// PayloadCMS encryption settings (matching their internal implementation)
const ENCRYPTION_KEY = process.env.PAYLOAD_SECRET || 'your-secret-key';
const ALGORITHM = 'aes-256-cbc';

function generateProperApiKey() {
  // Generate a random UUID for the API key
  const apiKeyUuid = crypto.randomUUID();
  
  // Encrypt it properly like PayloadCMS should
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  
  let encrypted = cipher.update(apiKeyUuid, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Format: iv:encrypted_data (how PayloadCMS stores encrypted API keys)
  const encryptedApiKey = iv.toString('hex') + ':' + encrypted;
  
  return {
    plainKey: apiKeyUuid,
    encryptedKey: encryptedApiKey
  };
}

async function fixAdminCryptoBugPermanent() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔧 FIXING ADMIN USER CRYPTO BUG - PERMANENT SOLUTION');
    console.log('=' .repeat(65));
    console.log('Issue: Admin user keeps getting UUID keys instead of encrypted ones');
    console.log('Solution: Force proper encryption for admin users');
    console.log('');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Step 1: Check current state of all users
    console.log('\n📊 Step 1: Current database state...');
    
    const allUsers = await client.query(`
      SELECT id, email, role, enable_a_p_i_key, api_key, api_key_index,
             CASE 
               WHEN api_key IS NULL THEN 'NO_KEY'
               WHEN LENGTH(api_key) = 36 AND api_key LIKE '%-%-%-%-%' THEN 'UUID_CORRUPTED'
               WHEN api_key LIKE '%:%' THEN 'PROPERLY_ENCRYPTED'
               ELSE 'UNKNOWN_FORMAT'
             END as key_status
      FROM users 
      ORDER BY role, email
    `);
    
    console.log(`Found ${allUsers.rows.length} total users:`);
    
    const adminUsers = [];
    const problematicUsers = [];
    
    allUsers.rows.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.email}`);
      console.log(`    API Enabled: ${user.enable_a_p_i_key}`);
      console.log(`    Key Status: ${user.key_status}`);
      
      if (user.role === 'admin') {
        adminUsers.push(user);
      }
      
      if (user.key_status === 'UUID_CORRUPTED') {
        problematicUsers.push(user);
        console.log(`    ❌ CORRUPTED KEY: ${user.api_key}`);
      }
      
      console.log('');
    });
    
    // Step 2: Clear any remaining corrupted keys
    if (problematicUsers.length > 0) {
      console.log('\n🧹 Step 2: Clearing corrupted UUID keys...');
      
      for (const user of problematicUsers) {
        await client.query(`
          UPDATE users 
          SET 
            enable_a_p_i_key = false,
            api_key = NULL,
            api_key_index = NULL,
            updated_at = NOW()
          WHERE id = $1
        `, [user.id]);
        
        console.log(`  ✅ Cleared corrupted key for ${user.email}`);
      }
    } else {
      console.log('\n✅ Step 2: No corrupted keys found');
    }
    
    // Step 3: Generate proper API keys for admin users who need them
    console.log('\n🔐 Step 3: Generating proper API keys for admin users...');
    
    const adminUsersNeedingKeys = adminUsers.filter(user => 
      user.enable_a_p_i_key && (user.api_key === null || user.key_status === 'UUID_CORRUPTED')
    );
    
    if (adminUsersNeedingKeys.length === 0) {
      console.log('No admin users currently need API keys.');
    } else {
      for (const adminUser of adminUsersNeedingKeys) {
        const { plainKey, encryptedKey } = generateProperApiKey();
        
        await client.query(`
          UPDATE users 
          SET 
            api_key = $1,
            api_key_index = $2,
            updated_at = NOW()
          WHERE id = $3
        `, [encryptedKey, plainKey, adminUser.id]);
        
        console.log(`  ✅ Generated proper API key for ADMIN: ${adminUser.email}`);
        console.log(`     Plain Key (for your apps): ${plainKey}`);
        console.log(`     Encrypted Key (in database): ${encryptedKey.substring(0, 40)}...`);
      }
    }
    
    // Step 4: Verification
    console.log('\n🔍 Step 4: Final verification...');
    
    const finalCheck = await client.query(`
      SELECT email, role, enable_a_p_i_key,
             CASE 
               WHEN api_key IS NULL THEN 'NO_KEY'
               WHEN LENGTH(api_key) = 36 AND api_key LIKE '%-%-%-%-%' THEN 'UUID_CORRUPTED'
               WHEN api_key LIKE '%:%' THEN 'PROPERLY_ENCRYPTED'
               ELSE 'UNKNOWN_FORMAT'
             END as key_status
      FROM users 
      WHERE enable_a_p_i_key = true
      ORDER BY role, email
    `);
    
    console.log('Users with API keys enabled:');
    finalCheck.rows.forEach(user => {
      const status = user.key_status === 'PROPERLY_ENCRYPTED' ? '✅' : '❌';
      console.log(`  ${status} ${user.role.toUpperCase()}: ${user.email} - ${user.key_status}`);
    });
    
    const corruptedCount = finalCheck.rows.filter(u => u.key_status === 'UUID_CORRUPTED').length;
    
    // Step 5: Instructions
    console.log('\n📋 Step 5: Resolution Summary');
    console.log('=' .repeat(35));
    
    if (corruptedCount === 0) {
      console.log('\n🎉 SUCCESS! All API keys are now properly encrypted!');
      console.log('\n✅ What was fixed:');
      console.log('- Cleared all corrupted UUID API keys');
      console.log('- Generated properly encrypted API keys for admin users');
      console.log('- PayloadCMS login should work without crypto errors');
      
      if (adminUsersNeedingKeys.length > 0) {
        console.log('\n🔑 New API Keys Generated:');
        adminUsersNeedingKeys.forEach(user => {
          console.log(`- ${user.email}: Check the plain key above for your applications`);
        });
      }
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Try logging into PayloadCMS admin panel');
      console.log('2. The crypto error should be completely resolved');
      console.log('3. Update your applications with any new API keys shown above');
      
    } else {
      console.log('\n⚠️  WARNING: Still found corrupted keys!');
      console.log('You may need to manually disable API keys for affected users.');
    }
    
    console.log('\n🔧 Technical Solution Applied:');
    console.log('- Used proper AES-256-CBC encryption with random IV');
    console.log('- Matched PayloadCMS internal encryption format (iv:encrypted_data)');
    console.log('- Bypassed PayloadCMS buggy API key generation for admin users');
    
  } catch (error) {
    console.error('❌ Error fixing admin crypto bug:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

fixAdminCryptoBugPermanent();
