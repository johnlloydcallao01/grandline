import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixUuidApiKeyBug() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔧 FIXING PAYLOADCMS UUID API KEY BUG');
    console.log('=' .repeat(50));
    console.log('Issue: https://github.com/payloadcms/payload/issues/13063');
    console.log('');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Step 1: Identify problematic API keys (stored as UUIDs)
    console.log('\n📊 Step 1: Identifying problematic API keys...');
    
    const problematicUsers = await client.query(`
      SELECT id, email, role, api_key
      FROM users 
      WHERE enable_a_p_i_key = true 
        AND api_key IS NOT NULL
        AND LENGTH(api_key) = 36
        AND api_key LIKE '%-%-%-%-%'
    `);
    
    console.log(`Found ${problematicUsers.rows.length} users with UUID API keys (problematic):`);
    
    problematicUsers.rows.forEach(user => {
      console.log(`  - ${user.role.toUpperCase()}: ${user.email}`);
      console.log(`    UUID Key: ${user.api_key}`);
    });
    
    if (problematicUsers.rows.length === 0) {
      console.log('\n✅ No problematic UUID API keys found. Issue may be resolved.');
      return;
    }
    
    // Step 2: Clear problematic API key data
    console.log('\n🧹 Step 2: Clearing problematic API key data...');
    
    for (const user of problematicUsers.rows) {
      await client.query(`
        UPDATE users 
        SET 
          enable_a_p_i_key = false,
          api_key = NULL,
          api_key_index = NULL,
          updated_at = NOW()
        WHERE id = $1
      `, [user.id]);
      
      console.log(`  ✅ Cleared API key data for ${user.email}`);
    }
    
    // Step 3: Verification
    console.log('\n🔍 Step 3: Verification...');
    
    const remainingProblematic = await client.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE enable_a_p_i_key = true 
        AND api_key IS NOT NULL
        AND LENGTH(api_key) = 36
        AND api_key LIKE '%-%-%-%-%'
    `);
    
    const totalWithApiKeys = await client.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE enable_a_p_i_key = true
    `);
    
    console.log(`Remaining problematic keys: ${remainingProblematic.rows[0].count}`);
    console.log(`Total users with API keys enabled: ${totalWithApiKeys.rows[0].count}`);
    
    // Step 4: Instructions for next steps
    console.log('\n📋 Step 4: Next Steps');
    console.log('=' .repeat(30));
    
    if (problematicUsers.rows.length > 0) {
      console.log('\n✅ PROBLEMATIC API KEYS CLEARED!');
      console.log('\n🎯 To complete the fix:');
      console.log('1. Log into PayloadCMS admin panel');
      console.log('2. Go to Users collection');
      console.log('3. For each affected user, re-enable their API key:');
      
      problematicUsers.rows.forEach(user => {
        console.log(`   - ${user.email}: Enable API Key checkbox`);
      });
      
      console.log('\n4. PayloadCMS will generate new, properly encrypted API keys');
      console.log('5. The "Invalid initialization vector" error should be resolved');
      
      console.log('\n⚠️  IMPORTANT:');
      console.log('- Save the new API keys when generated');
      console.log('- Update any applications using the old API keys');
      console.log('- Test login functionality after re-enabling');
    }
    
    console.log('\n🔗 Reference:');
    console.log('This fix addresses the PayloadCMS bug documented at:');
    console.log('https://github.com/payloadcms/payload/issues/13063');
    
  } catch (error) {
    console.error('❌ Error fixing UUID API key bug:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

fixUuidApiKeyBug();
