import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkApiKeyState() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 CHECKING CURRENT API KEY STATE');
    console.log('=' .repeat(50));
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check current API key data
    const result = await client.query(`
      SELECT id, email, role, enable_a_p_i_key, api_key, api_key_index
      FROM users 
      WHERE enable_a_p_i_key = true 
      ORDER BY role, email
    `);
    
    console.log(`\nFound ${result.rows.length} users with API keys enabled:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.role.toUpperCase()}: ${row.email}`);
      console.log(`   API Key: ${row.api_key ? row.api_key.substring(0, 50) + '...' : 'NULL'}`);
      console.log(`   Key Index: ${row.api_key_index ? row.api_key_index.substring(0, 20) + '...' : 'NULL'}`);
      
      // Check if API key looks like a UUID (problematic)
      const isUUID = row.api_key && row.api_key.includes('-') && row.api_key.length === 36;
      const isEncrypted = row.api_key && row.api_key.includes(':') && row.api_key.length > 50;
      
      if (isUUID) {
        console.log('   ❌ STATUS: PROBLEMATIC - API key is stored as plain UUID');
        console.log('   🔧 ISSUE: This will cause "Invalid initialization vector" error');
      } else if (isEncrypted) {
        console.log('   ✅ STATUS: GOOD - API key appears to be properly encrypted');
      } else {
        console.log('   ⚠️  STATUS: UNKNOWN - API key format is unclear');
      }
      
      console.log('');
    });
    
    // Summary
    const problematicKeys = result.rows.filter(row => 
      row.api_key && row.api_key.includes('-') && row.api_key.length === 36
    );
    
    console.log('📊 SUMMARY:');
    console.log(`Total users with API keys: ${result.rows.length}`);
    console.log(`Problematic (UUID) keys: ${problematicKeys.length}`);
    console.log(`Properly encrypted keys: ${result.rows.length - problematicKeys.length}`);
    
    if (problematicKeys.length > 0) {
      console.log('\n🚨 ROOT CAUSE IDENTIFIED:');
      console.log('The "Invalid initialization vector" error is caused by API keys');
      console.log('being stored as plain UUIDs instead of encrypted values.');
      console.log('\nThis is a known PayloadCMS bug: https://github.com/payloadcms/payload/issues/13063');
      
      console.log('\n🛠️  SOLUTION NEEDED:');
      console.log('1. Clear the problematic API key data');
      console.log('2. Disable and re-enable API keys through admin panel');
      console.log('3. Or apply the temporary patch mentioned in the GitHub issue');
    } else {
      console.log('\n✅ All API keys appear to be properly encrypted.');
      console.log('The issue might be elsewhere or already resolved.');
    }
    
  } catch (error) {
    console.error('❌ Error checking API key state:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

checkApiKeyState();
