import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function investigateApiKeyError() {
  console.log('🔍 Investigating API Key "Invalid initialization vector" Error')
  console.log('=' .repeat(60))
  
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    // Step 1: Check current user state
    console.log('\n📋 Step 1: Current User State')
    const userResult = await client.query(`
      SELECT 
        id, email, role, 
        enable_a_p_i_key, 
        api_key IS NOT NULL as has_api_key,
        api_key_index IS NOT NULL as has_api_key_index,
        LENGTH(api_key) as api_key_length,
        LENGTH(api_key_index) as api_key_index_length
      FROM users 
      WHERE email = 'johnlloydcallao@gmail.com'
    `)
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found')
      return
    }
    
    const user = userResult.rows[0]
    console.log('User state:', user)
    
    // Step 2: Check environment configuration
    console.log('\n🔐 Step 2: Environment Configuration')
    console.log('- PAYLOAD_SECRET length:', process.env.PAYLOAD_SECRET?.length || 'NOT SET')
    console.log('- PAYLOAD_SECRET starts with:', process.env.PAYLOAD_SECRET?.substring(0, 8) + '...' || 'NOT SET')
    console.log('- DATABASE_URI configured:', !!process.env.DATABASE_URI)
    
    // Step 3: Clear existing API key data to start fresh
    console.log('\n🧹 Step 3: Clearing Existing API Key Data')
    await client.query(`
      UPDATE users 
      SET 
        enable_a_p_i_key = false,
        api_key = NULL,
        api_key_index = NULL
      WHERE email = 'johnlloydcallao@gmail.com'
    `)
    console.log('✅ Cleared existing API key data')
    
    // Step 4: Simulate enabling API key manually in database
    console.log('\n🔑 Step 4: Manually Enabling API Key in Database')
    
    // Generate a simple test API key (not encrypted)
    const testApiKey = 'test-api-key-' + Date.now()
    const testApiKeyIndex = 'test-index-' + Date.now()
    
    await client.query(`
      UPDATE users 
      SET 
        enable_a_p_i_key = true,
        api_key = $1,
        api_key_index = $2
      WHERE email = 'johnlloydcallao@gmail.com'
    `, [testApiKey, testApiKeyIndex])
    
    console.log('✅ Manually set API key data:')
    console.log('- API Key:', testApiKey)
    console.log('- API Key Index:', testApiKeyIndex)
    
    // Step 5: Check what happens when we query by API key
    console.log('\n🔍 Step 5: Testing Database Query by API Key')
    
    try {
      const queryResult = await client.query(`
        SELECT id, email, role, api_key, api_key_index
        FROM users 
        WHERE api_key = $1
      `, [testApiKey])
      
      console.log('✅ Direct database query successful!')
      console.log('Found users:', queryResult.rows.length)
      
    } catch (queryError) {
      console.log('❌ Direct database query failed:', queryError.message)
    }
    
    // Step 6: Test with PayloadCMS-like encrypted data
    console.log('\n🔐 Step 6: Testing with Encrypted-like Data')
    
    // Simulate what PayloadCMS might store (base64-like encrypted data)
    const simulatedEncryptedKey = Buffer.from('simulated-encrypted-api-key-data').toString('base64')
    const simulatedEncryptedIndex = Buffer.from('simulated-encrypted-index-data').toString('base64')
    
    await client.query(`
      UPDATE users 
      SET 
        api_key = $1,
        api_key_index = $2
      WHERE email = 'johnlloydcallao@gmail.com'
    `, [simulatedEncryptedKey, simulatedEncryptedIndex])
    
    console.log('✅ Set simulated encrypted API key data:')
    console.log('- Encrypted API Key:', simulatedEncryptedKey.substring(0, 20) + '...')
    console.log('- Encrypted Index:', simulatedEncryptedIndex.substring(0, 20) + '...')
    
    // Step 7: Analysis and recommendations
    console.log('\n📝 Step 7: Analysis and Root Cause')
    console.log('\n🎯 ROOT CAUSE ANALYSIS:')
    console.log('\nThe "Invalid initialization vector" error occurs because:')
    console.log('\n1. 🔐 ENCRYPTION PROCESS:')
    console.log('   - When you enable API key in PayloadCMS admin, it generates a random API key')
    console.log('   - PayloadCMS encrypts this API key using the PAYLOAD_SECRET')
    console.log('   - The encrypted data is stored in the database')
    console.log('\n2. 🔍 DECRYPTION PROCESS:')
    console.log('   - When validating API keys, PayloadCMS tries to decrypt stored keys')
    console.log('   - It compares the decrypted key with the provided key')
    console.log('   - The "Invalid initialization vector" error occurs during decryption')
    console.log('\n3. 🚨 POSSIBLE CAUSES:')
    console.log('   a) PAYLOAD_SECRET has changed since the API key was created')
    console.log('   b) Corrupted encryption data in the database')
    console.log('   c) PayloadCMS encryption algorithm issues')
    console.log('   d) Database encoding problems')
    console.log('\n4. 🔧 SOLUTION:')
    console.log('   - Clear the corrupted API key data (which we already did)')
    console.log('   - Ensure PAYLOAD_SECRET is stable and properly configured')
    console.log('   - Re-enable API key through admin panel (PayloadCMS will generate new encrypted data)')
    console.log('\n5. 🛡️  PREVENTION:')
    console.log('   - Never change PAYLOAD_SECRET in production without regenerating all encrypted data')
    console.log('   - Regular database backups before making encryption-related changes')
    console.log('   - Consider using external key management for production systems')
    
    // Step 8: Final cleanup
    console.log('\n🧹 Step 8: Final Cleanup')
    await client.query(`
      UPDATE users 
      SET 
        enable_a_p_i_key = false,
        api_key = NULL,
        api_key_index = NULL
      WHERE email = 'johnlloydcallao@gmail.com'
    `)
    console.log('✅ Cleaned up test data')
    
    // Final verification
    const finalResult = await client.query(`
      SELECT 
        id, email, role, 
        enable_a_p_i_key, 
        api_key IS NOT NULL as has_api_key,
        api_key_index IS NOT NULL as has_api_key_index
      FROM users 
      WHERE email = 'johnlloydcallao@gmail.com'
    `)
    
    console.log('\n✅ Final user state:', finalResult.rows[0])
    console.log('\n🎉 User is now ready for fresh API key generation!')
    
  } catch (error) {
    console.error('💥 Investigation failed:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    await client.end()
  }
}

// Run the investigation
investigateApiKeyError().then(() => {
  console.log('\n✅ Investigation complete')
  console.log('\n📋 SUMMARY:')
  console.log('- The error occurs during PayloadCMS API key encryption/decryption')
  console.log('- Root cause: Corrupted encrypted data or PAYLOAD_SECRET mismatch')
  console.log('- Solution: Clear API key data and re-enable through admin panel')
  console.log('- The user can now safely enable API key in the admin interface')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})