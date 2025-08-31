import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function identifySupabaseColumns() {
  try {
    console.log('🔍 IDENTIFYING SUPABASE AUTH COLUMNS TO REMOVE...\n');
    
    // Get all columns in users table
    const allColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default, ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 ALL COLUMNS IN USERS TABLE:');
    allColumns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Identify Supabase Auth columns (these are typically from auth.users schema)
    const supabaseAuthColumns = [
      'instance_id',
      'aud', 
      'encrypted_password',
      'email_confirmed_at',
      'invited_at',
      'confirmation_token',
      'confirmation_sent_at',
      'recovery_token',
      'recovery_sent_at',
      'email_change_token_new',
      'email_change',
      'email_change_sent_at',
      'last_sign_in_at',
      'raw_app_meta_data',
      'raw_user_meta_data',
      'is_super_admin',
      'phone_confirmed_at',
      'phone_change',
      'phone_change_token',
      'phone_change_sent_at',
      'confirmed_at',
      'email_change_token_current',
      'email_change_confirm_status',
      'banned_until',
      'reauthentication_token',
      'reauthentication_sent_at',
      'is_sso_user',
      'deleted_at',
      'is_anonymous'
    ];
    
    // Check which Supabase columns exist
    const existingSupabaseColumns = [];
    const payloadColumns = [];
    
    allColumns.rows.forEach(col => {
      if (supabaseAuthColumns.includes(col.column_name)) {
        existingSupabaseColumns.push(col);
      } else {
        payloadColumns.push(col);
      }
    });
    
    console.log('\n🚨 SUPABASE AUTH COLUMNS TO REMOVE:');
    existingSupabaseColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n✅ PAYLOADCMS COLUMNS TO KEEP:');
    payloadColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check for duplicate email columns specifically
    const emailColumns = allColumns.rows.filter(col => col.column_name === 'email');
    console.log(`\n📧 EMAIL COLUMN ANALYSIS:`);
    console.log(`  Found ${emailColumns.length} email columns:`);
    emailColumns.forEach((col, index) => {
      console.log(`    ${index + 1}. email: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} (position: ${col.ordinal_position})`);
    });
    
    if (emailColumns.length > 1) {
      console.log('\n⚠️  RECOMMENDATION:');
      console.log('  - Keep the PayloadCMS email column (NOT NULL)');
      console.log('  - Remove the Supabase Auth email column (NULL)');
    }
    
    // Generate removal script
    console.log('\n📝 GENERATED REMOVAL SCRIPT:');
    console.log('-- SQL commands to remove Supabase Auth columns:');
    
    existingSupabaseColumns.forEach(col => {
      console.log(`ALTER TABLE users DROP COLUMN IF EXISTS "${col.column_name}";`);
    });
    
    // Special handling for duplicate email column
    if (emailColumns.length > 1) {
      console.log('\n-- Note: For duplicate email columns, you may need to:');
      console.log('-- 1. First migrate data from nullable email to NOT NULL email if needed');
      console.log('-- 2. Then drop the nullable email column');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

identifySupabaseColumns();
