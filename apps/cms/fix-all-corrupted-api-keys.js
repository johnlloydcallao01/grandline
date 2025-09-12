import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixAllCorruptedApiKeys() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔧 FIXING ALL CORRUPTED API KEYS IN DATABASE');
    console.log('=' .repeat(60));
    console.log('Issue: PayloadCMS login fails due to corrupted API keys');
    console.log('Error: Invalid initialization vector during decryption');
    console.log('');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Step 1: Find ALL users with API keys (both enabled and disabled)
    console.log('\n📊 Step 1: Analyzing ALL users with API key data...');
    
    const allUsersWithApiKeys = await client.query(`
      SELECT id, email, role, enable_a_p_i_key, api_key, api_key_index
      FROM users 
      WHERE api_key IS NOT NULL
      ORDER BY role, email
    `);
    
    console.log(`Found ${allUsersWithApiKeys.rows.length} users with API key data:`);
    
    // Categorize users
    const problematicUsers = [];
    const properUsers = [];
    
    allUsersWithApiKeys.rows.forEach(user => {
      const isUuid = user.api_key && 
                    user.api_key.length === 36 && 
                    user.api_key.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      if (isUuid) {
        problematicUsers.push(user);
        console.log(`  ❌ PROBLEMATIC: ${user.role.toUpperCase()} - ${user.email}`);
        console.log(`     UUID Key: ${user.api_key}`);
        console.log(`     Enabled: ${user.enable_a_p_i_key}`);
      } else {
        properUsers.push(user);
        console.log(`  ✅ PROPER: ${user.role.toUpperCase()} - ${user.email}`);
        console.log(`     Encrypted Key: ${user.api_key.substring(0, 20)}...`);
        console.log(`     Enabled: ${user.enable_a_p_i_key}`);
      }
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`  - Problematic (UUID) keys: ${problematicUsers.length}`);
    console.log(`  - Properly encrypted keys: ${properUsers.length}`);
    
    if (problematicUsers.length === 0) {
      console.log('\n✅ No problematic UUID API keys found!');
      console.log('The "Invalid initialization vector" error may be caused by something else.');
      return;
    }
    
    // Step 2: Clear ALL problematic API key data
    console.log('\n🧹 Step 2: Clearing ALL problematic API key data...');
    
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
      
      console.log(`  ✅ Cleared corrupted API key for ${user.role.toUpperCase()}: ${user.email}`);
    }
    
    // Step 3: Verification
    console.log('\n🔍 Step 3: Final verification...');
    
    const remainingProblematic = await client.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE api_key IS NOT NULL
        AND LENGTH(api_key) = 36
        AND api_key LIKE '%-%-%-%-%'
    `);
    
    const totalWithApiKeys = await client.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE api_key IS NOT NULL
    `);
    
    console.log(`Remaining problematic keys: ${remainingProblematic.rows[0].count}`);
    console.log(`Total users with API key data: ${totalWithApiKeys.rows[0].count}`);
    
    // Step 4: Test login simulation
    console.log('\n🧪 Step 4: Testing potential login scenarios...');
    
    const usersForLoginTest = await client.query(`
      SELECT id, email, role, enable_a_p_i_key, 
             CASE WHEN api_key IS NULL THEN 'NULL' ELSE 'HAS_DATA' END as api_key_status
      FROM users 
      WHERE role IN ('admin', 'service')
      ORDER BY role, email
    `);
    
    console.log('Users that could potentially cause login issues:');
    usersForLoginTest.rows.forEach(user => {
      console.log(`  - ${user.role.toUpperCase()}: ${user.email}`);
      console.log(`    API Key Enabled: ${user.enable_a_p_i_key}`);
      console.log(`    API Key Data: ${user.api_key_status}`);
    });
    
    // Step 5: Instructions
    console.log('\n📋 Step 5: Resolution Complete!');
    console.log('=' .repeat(40));
    
    if (problematicUsers.length > 0) {
      console.log('\n✅ ALL CORRUPTED API KEYS HAVE BEEN CLEARED!');
      console.log('\n🎯 The "Invalid initialization vector" error should now be resolved.');
      console.log('\n📝 What was fixed:');
      
      problematicUsers.forEach(user => {
        console.log(`   - ${user.email}: Removed corrupted UUID API key`);
      });
      
      console.log('\n🔄 Next steps:');
      console.log('1. Try logging into PayloadCMS admin panel again');
      console.log('2. The login should work without the "Invalid initialization vector" error');
      console.log('3. If you need API keys for any users, re-enable them through the admin panel');
      console.log('4. PayloadCMS will generate new, properly encrypted API keys');
    }
    
    console.log('\n🔗 Technical Details:');
    console.log('- Removed all UUID-format API keys that cause decryption errors');
    console.log('- Preserved properly encrypted API keys');
    console.log('- PayloadCMS login process will no longer encounter corrupted data');
    
  } catch (error) {
    console.error('❌ Error fixing corrupted API keys:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

fixAllCorruptedApiKeys();