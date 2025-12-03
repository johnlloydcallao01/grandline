import pg from 'pg'
import dotenv from 'dotenv'
import crypto from 'crypto'

// Load environment variables
dotenv.config()

console.log('🔍 ADMIN vs SERVICE API KEY INVESTIGATION');
console.log('=' .repeat(60));

// Check environment variables first
console.log('🔍 Checking environment variables...');
console.log('DATABASE_URI:', process.env.DATABASE_URI ? '[PRESENT]' : '[MISSING]');
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? `[PRESENT - ${process.env.PAYLOAD_SECRET.length} chars]` : '[MISSING]');

if (!process.env.DATABASE_URI) {
  console.log('❌ DATABASE_URI not found. Please check your .env file.');
  process.exit(1);
}

// Database connection
const client = new pg.Client({
  connectionString: process.env.DATABASE_URI
});

async function investigateRoleDifferences() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Step 1: Find existing admin and service users
    console.log('\n📊 STEP 1: Analyzing existing users by role');
    
    const adminUsers = await client.query(`
       SELECT id, email, role, "enable_a_p_i_key", "api_key", "api_key_index", "is_active"
       FROM users 
       WHERE role = 'admin' 
       ORDER BY "updated_at" DESC
       LIMIT 5
     `);
     
     const serviceUsers = await client.query(`
       SELECT id, email, role, "enable_a_p_i_key", "api_key", "api_key_index", "is_active"
       FROM users 
      WHERE role = 'service' 
       ORDER BY "updated_at" DESC 
       LIMIT 5
    `);
    
    console.log(`\n👑 ADMIN USERS (${adminUsers.rows.length} found):`);
    adminUsers.rows.forEach(user => {
      console.log(`   ID: ${user.id}, Email: ${user.email}`);
      console.log(`   API Key Enabled: ${user.enable_a_p_i_key}`);
      console.log(`   API Key: ${user.api_key ? '[PRESENT]' : '[NULL]'}`);
      console.log(`   API Key Index: ${user.api_key_index ? '[PRESENT]' : '[NULL]'}`);
      console.log(`   Active: ${user.is_active}`);
      console.log('   ---');
    });
    
    console.log(`\n🔧 SERVICE USERS (${serviceUsers.rows.length} found):`);
    serviceUsers.rows.forEach(user => {
      console.log(`   ID: ${user.id}, Email: ${user.email}`);
      console.log(`   API Key Enabled: ${user.enableAPIKey}`);
      console.log(`   API Key: ${user.apiKey ? '[PRESENT]' : '[NULL]'}`);
      console.log(`   API Key Index: ${user.apiKeyIndex ? '[PRESENT]' : '[NULL]'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log('   ---');
    });

    // Step 2: Test encryption/decryption with current PAYLOAD_SECRET
    console.log('\n🔐 STEP 2: Testing encryption/decryption process');
    
    const payloadSecret = process.env.PAYLOAD_SECRET;
    if (!payloadSecret) {
      console.log('❌ PAYLOAD_SECRET not found in environment!');
      return;
    }
    
    console.log(`✅ PAYLOAD_SECRET found (length: ${payloadSecret.length})`);
    
    // Test encryption process (similar to what PayloadCMS does)
    const testApiKey = crypto.randomUUID();
    console.log(`\n🧪 Testing with sample API key: ${testApiKey}`);
    
    try {
      // Modern encryption/decryption using createCipheriv/createDecipheriv
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(payloadSecret, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(testApiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Store IV with encrypted data (format: iv:encryptedData)
      const encryptedWithIv = iv.toString('hex') + ':' + encrypted;
      
      console.log(`✅ Encryption successful: ${encryptedWithIv.substring(0, 20)}...`);
      
      // Test decryption
      const parts = encryptedWithIv.split(':');
      const storedIv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];
      
      const decipher = crypto.createDecipheriv(algorithm, key, storedIv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      console.log(`✅ Decryption successful: ${decrypted === testApiKey ? 'MATCH' : 'MISMATCH'}`);
      
    } catch (error) {
      console.log(`❌ Encryption/Decryption failed: ${error.message}`);
    }

    // Step 3: Check for corrupted API key data
    console.log('\n🔍 STEP 3: Checking for corrupted API key data');
    
    const corruptedData = await client.query(`
      SELECT id, email, role, "enable_a_p_i_key", "api_key", "api_key_index"
      FROM users 
      WHERE "enable_a_p_i_key" = true 
        AND ("api_key" IS NULL OR "api_key_index" IS NULL)
    `);
    
    if (corruptedData.rows.length > 0) {
      console.log(`⚠️  Found ${corruptedData.rows.length} users with corrupted API key data:`);
      corruptedData.rows.forEach(user => {
        console.log(`   ${user.role.toUpperCase()}: ${user.email} (ID: ${user.id})`);
        console.log(`   - enableAPIKey: ${user.enable_a_p_i_key}`);
        console.log(`   - apiKey: ${user.api_key ? 'PRESENT' : 'NULL'}`);
        console.log(`   - apiKeyIndex: ${user.api_key_index ? 'PRESENT' : 'NULL'}`);
      });
    } else {
      console.log('✅ No corrupted API key data found');
    }

    // Step 4: Role-specific analysis
    console.log('\n📈 STEP 4: Role-specific API key statistics');
    
    const roleStats = await client.query(`
      SELECT 
        role,
        COUNT(*) as total_users,
        COUNT(CASE WHEN "enable_a_p_i_key" = true THEN 1 END) as api_enabled_users,
        COUNT(CASE WHEN "enable_a_p_i_key" = true AND "api_key" IS NOT NULL THEN 1 END) as valid_api_keys,
        COUNT(CASE WHEN "enable_a_p_i_key" = true AND "api_key" IS NULL THEN 1 END) as corrupted_api_keys
      FROM users 
      GROUP BY role
      ORDER BY role
    `);
    
    console.log('\n📊 ROLE STATISTICS:');
    roleStats.rows.forEach(stat => {
      console.log(`\n${stat.role.toUpperCase()}:`);
      console.log(`   Total Users: ${stat.total_users}`);
      console.log(`   API Enabled: ${stat.api_enabled_users}`);
      console.log(`   Valid API Keys: ${stat.valid_api_keys}`);
      console.log(`   Corrupted API Keys: ${stat.corrupted_api_keys}`);
      
      if (parseInt(stat.corrupted_api_keys) > 0) {
        console.log(`   ⚠️  CORRUPTION RATE: ${((parseInt(stat.corrupted_api_keys) / parseInt(stat.api_enabled_users)) * 100).toFixed(1)}%`);
      }
    });

    // Step 5: Test specific admin user that's failing
    console.log('\n🎯 STEP 5: Testing specific admin user scenarios');
    
    const problematicAdmin = await client.query(`
       SELECT id, email, role, "enable_a_p_i_key", "api_key", "api_key_index", "created_at", "updated_at"
       FROM users 
       WHERE role = 'admin' AND email LIKE '%johnlloydcallao%'
       ORDER BY "updated_at" DESC
       LIMIT 3
     `);
     
     if (problematicAdmin.rows.length > 0) {
      const admin = problematicAdmin.rows[0];
      console.log(`\n🔍 ANALYZING ADMIN: ${admin.email}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   API Key Enabled: ${admin.enable_a_p_i_key}`);
      console.log(`   API Key Present: ${admin.api_key ? 'YES' : 'NO'}`);
      console.log(`   API Key Index Present: ${admin.api_key_index ? 'YES' : 'NO'}`);
      console.log(`   Created: ${admin.created_at}`);
       console.log(`   Updated: ${admin.updated_at}`);
      
      if (admin.api_key) {
        console.log('\n🧪 Testing decryption of existing API key...');
        try {
          const algorithm = 'aes-256-cbc';
          
          // Try modern decryption first (with IV)
          if (admin.api_key.includes(':')) {
            const parts = admin.api_key.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];
            const key = crypto.scryptSync(payloadSecret, 'salt', 32);
            
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            decipher.update(encrypted, 'hex', 'utf8');
            decipher.final('utf8');
          console.log('✅ Decryption successful - API key is valid (modern format)');
          } else {
            // Fallback to deprecated method for old data
            const decipher = crypto.createDecipher(algorithm, payloadSecret);
            decipher.update(admin.api_key, 'hex', 'utf8');
            decipher.final('utf8');
            console.log('✅ Decryption successful - API key is valid (legacy format)');
          }
        } catch (error) {
          console.log(`❌ Decryption failed: ${error.message}`);
          console.log('🔧 This explains the "Invalid initialization vector" error!');
        }
      }
    }

    // Step 6: Recommendations
    console.log('\n💡 STEP 6: Analysis and Recommendations');
    console.log('=' .repeat(60));
    
    console.log('\n🔍 ROOT CAUSE ANALYSIS:');
    console.log('1. The "Invalid initialization vector" error occurs during API key decryption');
    console.log('2. This suggests the API key was encrypted with a different PAYLOAD_SECRET');
    console.log('3. Or the encryption data is corrupted in the database');
    console.log('4. Service users work because they have clean/valid encrypted data');
    
    console.log('\n🛠️  IMMEDIATE SOLUTIONS:');
    console.log('1. Clear corrupted API key data for admin users');
    console.log('2. Ensure PAYLOAD_SECRET is consistent across all environments');
    console.log('3. Re-enable API keys through the admin panel (fresh encryption)');
    
    console.log('\n🔧 PREVENTION MEASURES:');
    console.log('1. Never change PAYLOAD_SECRET after API keys are generated');
    console.log('2. Implement proper backup/restore procedures for encrypted data');
    console.log('3. Add validation checks before API key operations');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

/**
 * Modern decryption function to replace deprecated crypto.createDecipher
 */
 

// Run the investigation
investigateRoleDifferences().catch(console.error);
