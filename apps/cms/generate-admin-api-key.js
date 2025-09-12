/**
 * Generate API Key Programmatically for Admin User
 * 
 * This script generates a properly encrypted API key for the admin user
 * johnlloydcallao@gmail.com, bypassing any potential PayloadCMS admin UI issues.
 * 
 * Based on our previous successful fix for the UUID API key bug.
 */

import { Client } from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// PayloadCMS encryption configuration
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Generate encrypted API key in PayloadCMS format
 * Format: "iv:encrypted_data"
 */
function generateEncryptedAPIKey() {
  try {
    // Generate a random 32-character API key
    const apiKey = crypto.randomBytes(16).toString('hex');
    
    // Create initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create key from PAYLOAD_SECRET (32 bytes for AES-256)
    const key = crypto.createHash('sha256').update(PAYLOAD_SECRET).digest();
    
    // Create cipher with IV
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the API key
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return in PayloadCMS format: "iv:encrypted_data"
    const payloadFormat = `${iv.toString('hex')}:${encrypted}`;
    
    return {
      plainKey: apiKey,
      encryptedKey: payloadFormat,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('❌ Error generating encrypted API key:', error.message);
    throw error;
  }
}

/**
 * Verify the admin user exists and get their details
 */
async function verifyAdminUser(client, email, password) {
  try {
    console.log(`🔍 Looking for admin user: ${email}`);
    
    const result = await client.query(
      'SELECT id, email, role, "enable_a_p_i_key", "api_key" FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`❌ User ${email} not found in database`);
    }
    
    const user = result.rows[0];
    console.log(`✅ Found user: ${user.email}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - API Key Enabled: ${user.enable_a_p_i_key}`);
    console.log(`   - Current API Key: ${user.api_key ? 'EXISTS' : 'NONE'}`);
    
    if (user.role !== 'admin') {
      throw new Error(`❌ User ${email} is not an admin (role: ${user.role})`);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error verifying admin user:', error.message);
    throw error;
  }
}

/**
 * Generate and set API key for admin user
 */
async function generateAdminAPIKey(client, userId, email) {
  try {
    console.log(`\n🔑 Generating encrypted API key for admin user...`);
    
    // Generate encrypted API key
    const keyData = generateEncryptedAPIKey();
    
    console.log(`✅ Generated encrypted API key:`);
    console.log(`   - Plain Key: ${keyData.plainKey}`);
    console.log(`   - Encrypted Format: ${keyData.encryptedKey}`);
    console.log(`   - IV: ${keyData.iv}`);
    
    // Update user with new API key
    const updateResult = await client.query(
      `UPDATE users 
       SET "enable_a_p_i_key" = true, 
           "api_key" = $1, 
           "updated_at" = NOW()
       WHERE id = $2`,
      [keyData.encryptedKey, userId]
    );
    
    if (updateResult.rowCount === 0) {
      throw new Error('❌ Failed to update user with API key');
    }
    
    console.log(`✅ Successfully set encrypted API key for ${email}`);
    
    return keyData;
  } catch (error) {
    console.error('❌ Error generating admin API key:', error.message);
    throw error;
  }
}

/**
 * Verify the generated API key works
 */
async function verifyAPIKey(client, userId) {
  try {
    console.log(`\n🔍 Verifying API key was set correctly...`);
    
    const result = await client.query(
      'SELECT email, "enable_a_p_i_key", "api_key" FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('❌ User not found during verification');
    }
    
    const user = result.rows[0];
    console.log(`✅ Verification results:`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - API Key Enabled: ${user.enable_a_p_i_key}`);
    console.log(`   - API Key Format: ${user.api_key ? user.api_key.substring(0, 20) + '...' : 'NONE'}`);
    
    // Check if it's in the correct PayloadCMS format (iv:encrypted_data)
    if (user.api_key && user.api_key.includes(':')) {
      console.log(`✅ API key is in correct PayloadCMS format (iv:encrypted_data)`);
      return true;
    } else {
      console.log(`❌ API key is NOT in correct PayloadCMS format`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying API key:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });
  
  try {
    console.log('🚀 Starting Admin API Key Generation Process');
    console.log('=' .repeat(60));
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');
    
    // Target admin user
    const adminEmail = 'johnlloydcallao@gmail.com';
    const adminPassword = '@Iamachessgrandmaster23'; // Note: Password not needed for API key generation
    
    console.log(`\n👤 Target Admin User: ${adminEmail}`);
    
    // Step 1: Verify admin user exists
    const adminUser = await verifyAdminUser(client, adminEmail, adminPassword);
    
    // Step 2: Generate and set API key
    const keyData = await generateAdminAPIKey(client, adminUser.id, adminUser.email);
    
    // Step 3: Verify the API key was set correctly
    const isValid = await verifyAPIKey(client, adminUser.id);
    
    if (isValid) {
      console.log('\n🎉 SUCCESS! Admin API Key Generated Successfully');
      console.log('=' .repeat(60));
      console.log(`✅ Admin user: ${adminUser.email}`);
      console.log(`✅ API Key Enabled: true`);
      console.log(`✅ Encrypted API Key: ${keyData.encryptedKey}`);
      console.log(`✅ Plain API Key: ${keyData.plainKey}`);
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. ✅ API key has been generated and stored in database');
      console.log('2. 🔄 Try logging into PayloadCMS admin panel');
      console.log('3. 🔑 The API key should now work for API authentication');
      console.log('4. 📝 Update your applications with the new API key if needed');
      
      console.log('\n🔗 API Key for Applications:');
      console.log(`PAYLOAD_API_KEY=${keyData.plainKey}`);
      
    } else {
      console.log('\n❌ FAILED! API Key generation completed but verification failed');
    }
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if the admin user exists in the database');
    console.error('2. Verify DATABASE_URI is correct');
    console.error('3. Ensure PAYLOAD_SECRET is set in environment');
    console.error('4. Check database connection and permissions');
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n📡 Database connection closed');
  }
}

// Run the script
main().catch(console.error);

export { generateEncryptedAPIKey, verifyAdminUser, generateAdminAPIKey };