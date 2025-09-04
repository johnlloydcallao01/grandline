import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function verifyCleanup() {
  try {
    console.log('🔍 VERIFYING SUPABASE AUTH COLUMN REMOVAL...\n');
    
    // Get current users table structure
    const currentColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 CURRENT USERS TABLE COLUMNS:');
    currentColumns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check specifically for Supabase Auth columns
    const supabaseColumns = [
      'instance_id', 'aud', 'encrypted_password', 'email_confirmed_at', 'invited_at',
      'confirmation_token', 'confirmation_sent_at', 'recovery_token', 'recovery_sent_at',
      'email_change_token_new', 'email_change', 'email_change_sent_at', 'last_sign_in_at',
      'raw_app_meta_data', 'raw_user_meta_data', 'is_super_admin', 'phone_confirmed_at',
      'phone_change', 'phone_change_token', 'phone_change_sent_at', 'confirmed_at',
      'email_change_token_current', 'email_change_confirm_status', 'banned_until',
      'reauthentication_token', 'reauthentication_sent_at', 'is_sso_user', 'deleted_at', 'is_anonymous'
    ];
    
    const remainingSupabaseColumns = currentColumns.rows.filter(col => 
      supabaseColumns.includes(col.column_name)
    );
    
    console.log('\n🚨 REMAINING SUPABASE AUTH COLUMNS:');
    if (remainingSupabaseColumns.length > 0) {
      remainingSupabaseColumns.forEach(col => {
        console.log(`  ❌ ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('  ✅ No Supabase Auth columns found - cleanup successful!');
    }
    
    // Check email columns specifically
    const emailColumns = currentColumns.rows.filter(col => col.column_name === 'email');
    console.log(`\n📧 EMAIL COLUMNS:`)
    console.log(`  Found ${emailColumns.length} email column(s):`);
    emailColumns.forEach((col, index) => {
      console.log(`    ${index + 1}. email: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} (position: ${col.ordinal_position})`);
    });
    
    // Test email data access
    console.log('\n📊 TESTING EMAIL DATA ACCESS:');
    try {
      const emailTest = await pool.query(`
        SELECT id, email, first_name, last_name, role
        FROM users 
        LIMIT 3
      `);
      
      console.log('  ✅ Email data accessible:');
      emailTest.rows.forEach((user, index) => {
        console.log(`    User ${index + 1}: ${user.email} (${user.first_name} ${user.last_name}, ${user.role})`);
      });
    } catch (error) {
      console.log(`  ❌ Email data access error: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 CLEANUP SUMMARY:');
    if (remainingSupabaseColumns.length === 0) {
      console.log('  ✅ SUCCESS: All Supabase Auth columns have been removed');
      if (emailColumns.length === 1) {
        console.log('  ✅ SUCCESS: Email column duplication resolved');
      } else {
        console.log(`  ⚠️  WARNING: Still have ${emailColumns.length} email columns`);
      }
    } else {
      console.log(`  ❌ INCOMPLETE: ${remainingSupabaseColumns.length} Supabase Auth columns still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyCleanup();
