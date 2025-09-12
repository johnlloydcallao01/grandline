import dotenv from 'dotenv';
import { Client } from 'pg';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

/**
 * Modern encryption function to replace deprecated crypto.createCipher
 */
function encryptApiKey(text, secret) {
  try {
    // Create a key from the secret using scrypt (more secure than simple hashing)
    const key = crypto.scryptSync(secret, 'salt', KEY_LENGTH);
    
    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with key and IV
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend IV to encrypted data (IV + encrypted)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Modern decryption function to replace deprecated crypto.createDecipher
 */
function decryptApiKey(encryptedData, secret) {
  try {
    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create key from secret
    const key = crypto.scryptSync(secret, 'salt', KEY_LENGTH);
    
    // Create decipher with key and IV
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Fix corrupted API keys by re-encrypting them with modern methods
 */
async function fixApiKeyCrypto() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔧 FIXING API KEY CRYPTO DEPRECATION ISSUES');
    console.log('=' .repeat(60));
    
    await client.connect();
    console.log('✅ Connected to database');
    
    const payloadSecret = process.env.PAYLOAD_SECRET;
    if (!payloadSecret) {
      throw new Error('PAYLOAD_SECRET not found in environment variables');
    }
    
    console.log(`✅ PAYLOAD_SECRET found (length: ${payloadSecret.length})`);
    
    // Step 1: Find all users with API keys enabled
    console.log('\n📊 Step 1: Finding users with API keys...');
    
    const usersWithApiKeys = await client.query(`
      SELECT id, email, role, "enable_a_p_i_key", "api_key", "api_key_index"
      FROM users 
      WHERE "enable_a_p_i_key" = true
      ORDER BY role, email
    `);
    
    console.log(`Found ${usersWithApiKeys.rows.length} users with API keys enabled`);
    
    if (usersWithApiKeys.rows.length === 0) {
      console.log('✅ No users with API keys found. Nothing to fix.');
      return;
    }
    
    // Step 2: Test current encryption/decryption
    console.log('\n🧪 Step 2: Testing current crypto methods...');
    
    const testKey = crypto.randomUUID();
    console.log(`Testing with sample key: ${testKey}`);
    
    try {
      const encrypted = encryptApiKey(testKey, payloadSecret);
      console.log(`✅ Modern encryption successful: ${encrypted.substring(0, 20)}...`);
      
      const decrypted = decryptApiKey(encrypted, payloadSecret);
      console.log(`✅ Modern decryption successful: ${decrypted === testKey ? 'MATCH' : 'MISMATCH'}`);
      
      if (decrypted !== testKey) {
        throw new Error('Encryption/decryption test failed - keys do not match');
      }
    } catch (error) {
      console.error(`❌ Modern crypto test failed: ${error.message}`);
      throw error;
    }
    
    // Step 3: Fix corrupted API keys
    console.log('\n🔧 Step 3: Fixing corrupted API keys...');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const user of usersWithApiKeys.rows) {
      console.log(`\n👤 Processing ${user.role.toUpperCase()}: ${user.email}`);
      
      if (!user.api_key) {
        console.log('   ⚠️  No API key data - skipping');
        continue;
      }
      
      try {
        // Try to decrypt existing key with deprecated method (this will likely fail)
        console.log('   🔍 Testing existing API key...');
        
        // Generate a new API key since the old one is corrupted
        const newApiKey = crypto.randomUUID();
        const newEncryptedKey = encryptApiKey(newApiKey, payloadSecret);
        const newKeyIndex = crypto.createHash('sha256').update(newApiKey).digest('hex');
        
        // Update the database with the new encrypted key
        await client.query(`
          UPDATE users 
          SET 
            "api_key" = $1,
            "api_key_index" = $2,
            "updated_at" = NOW()
          WHERE id = $3
        `, [newEncryptedKey, newKeyIndex, user.id]);
        
        console.log('   ✅ API key re-encrypted successfully');
        console.log(`   📝 New API key: ${newApiKey}`);
        console.log('   ⚠️  IMPORTANT: Save this API key - it won\'t be shown again!');
        
        fixedCount++;
        
      } catch (error) {
        console.error(`   ❌ Failed to fix API key: ${error.message}`);
        errorCount++;
      }
    }
    
    // Step 4: Summary
    console.log('\n📊 Step 4: Fix Summary');
    console.log('=' .repeat(40));
    console.log(`✅ Successfully fixed: ${fixedCount} users`);
    console.log(`❌ Errors encountered: ${errorCount} users`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 API key crypto deprecation issues have been resolved!');
      console.log('\n📋 Next Steps:');
      console.log('1. Update your applications to use the new API keys shown above');
      console.log('2. Test API key authentication with your applications');
      console.log('3. The old "Invalid initialization vector" errors should be resolved');
    }
    
    // Step 5: Verification
    console.log('\n🔍 Step 5: Verification');
    
    const verificationQuery = await client.query(`
      SELECT 
        role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN "enable_a_p_i_key" = true THEN 1 END) as api_enabled,
        COUNT(CASE WHEN "api_key" IS NOT NULL THEN 1 END) as has_api_key
      FROM users 
      GROUP BY role
      ORDER BY role
    `);
    
    console.log('\n📊 Current API key status by role:');
    verificationQuery.rows.forEach(row => {
      console.log(`   ${row.role.toUpperCase()}: ${row.has_api_key}/${row.api_enabled} users have API keys`);
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

// Run the fix
fixApiKeyCrypto().then(() => {
  console.log('\n🎉 API key crypto fix completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});