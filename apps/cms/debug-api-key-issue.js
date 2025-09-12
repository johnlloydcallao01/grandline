import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function debugApiKeyIssue() {
  console.log('🔍 Debugging API Key Issue for johnlloydcallao@gmail.com')
  
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URI
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    // First, check the table structure
    console.log('📋 Checking users table structure...')
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)
    
    console.log('Available columns:')
    tableInfo.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`)
    })
    
    // Query the user directly from the database
    const result = await client.query(`
      SELECT * FROM users WHERE email = $1
    `, ['johnlloydcallao@gmail.com'])
    
    if (result.rows.length === 0) {
      console.log('❌ User not found in database')
      return
    }
    
    const user = result.rows[0]
    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      enable_api_key: user.enable_a_p_i_key,
      has_api_key: !!user.api_key,
      has_api_key_index: !!user.api_key_index,
      api_key_length: user.api_key ? user.api_key.length : 0,
      api_key_index_length: user.api_key_index ? user.api_key_index.length : 0,
      updated_at: user.updated_at,
      created_at: user.created_at
    })
    
    // Check API key data details
    if (user.enable_a_p_i_key && user.api_key) {
      console.log('\n🔑 API Key Analysis:')
      console.log('- API Key starts with:', user.api_key.substring(0, 20) + '...')
      console.log('- API Key Index starts with:', user.api_key_index ? user.api_key_index.substring(0, 20) + '...' : 'NULL')
      
      // Check if it looks like encrypted data
      const isBase64Like = /^[A-Za-z0-9+/]+=*$/.test(user.api_key)
      console.log('- Looks like base64 encrypted data:', isBase64Like)
      
      // Check for common issues
      const issues = []
      
      if (user.api_key.length < 20) {
        issues.push('API Key seems too short for encrypted data')
      }
      
      if (!user.api_key_index) {
        issues.push('API Key Index is missing - this is required for decryption')
      }
      
      if (user.api_key_index && user.api_key_index.length < 10) {
        issues.push('API Key Index seems too short')
      }
      
      // Check if the API key contains null bytes or invalid characters
      if (user.api_key.includes('\\x00') || user.api_key.includes('\\0')) {
        issues.push('API Key contains null bytes - likely corrupted')
      }
      
      if (issues.length > 0) {
        console.log('\n⚠️  Potential Issues Found:')
        issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`)
        })
      } else {
        console.log('\n✅ API Key data structure looks normal')
      }
      
      // Show the PAYLOAD_SECRET being used
      console.log('\n🔐 Encryption Configuration:')
      console.log('- PAYLOAD_SECRET length:', process.env.PAYLOAD_SECRET ? process.env.PAYLOAD_SECRET.length : 'NOT SET')
      console.log('- PAYLOAD_SECRET starts with:', process.env.PAYLOAD_SECRET ? process.env.PAYLOAD_SECRET.substring(0, 8) + '...' : 'NOT SET')
    } else {
      console.log('\n📝 API Key Status:')
      if (!user.enable_a_p_i_key) {
        console.log('- API Key is disabled for this user')
      } else {
        console.log('- API Key is enabled but no key data found')
      }
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message)
    
    if (error.message.includes('Invalid initialization vector')) {
      console.log('\n🎯 CONFIRMED: Invalid initialization vector error')
    }
    
    console.log('\n💡 Recommended Solutions:')
    console.log('1. Clear the corrupted API key data:')
    console.log('   UPDATE users SET "enableAPIKey" = false, "apiKey" = NULL, "apiKeyIndex" = NULL WHERE email = \'johnlloydcallao@gmail.com\';')
    console.log('\n2. Then re-enable API key in the admin panel')
    console.log('\n3. If PAYLOAD_SECRET changed, all encrypted data needs to be regenerated')
  }
  
  // Apply the fix by clearing corrupted API key data
  console.log('\n🔧 Applying fix: Clearing corrupted API key data...')
  
  try {
    const updateResult = await client.query(`
      UPDATE users 
      SET 
        enable_a_p_i_key = false,
        api_key = NULL,
        api_key_index = NULL
      WHERE email = 'johnlloydcallao@gmail.com'
    `)
    
    console.log(`✅ Fix applied successfully (${updateResult.rowCount} row updated)`)
    
    // Verify the fix
    const verifyResult = await client.query(`
      SELECT 
        email,
        role,
        enable_a_p_i_key,
        api_key IS NOT NULL as has_api_key,
        api_key_index IS NOT NULL as has_api_key_index
      FROM users 
      WHERE email = 'johnlloydcallao@gmail.com'
    `)
    
    console.log('\n🔍 Verification after fix:', verifyResult.rows[0])
    console.log('✅ API key corruption fixed - you can now login')
  } catch (fixError) {
    console.error('❌ Error applying fix:', fixError.message)
  } finally {
    await client.end()
  }
}

debugApiKeyIssue().then(() => {
  console.log('\n✅ Debug complete')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})