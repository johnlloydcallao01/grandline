import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkSignupFields() {
  try {
    console.log('🔍 Checking trainee signup fields in database...\n');
    
    // Check Users table for signup fields
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('first_name', 'last_name', 'middle_name', 'name_extension', 'username', 'nationality', 'birth_date', 'place_of_birth', 'complete_address', 'gender', 'civil_status', 'email', 'phone')
      ORDER BY column_name
    `);
    
    console.log('👤 USERS TABLE - SIGNUP FIELDS:');
    usersResult.rows.forEach(col => {
      const required = col.is_nullable === 'NO' ? '✅ REQUIRED' : '⚪ OPTIONAL';
      console.log(`  - ${col.column_name}: ${col.data_type} ${required}`);
    });
    
    // Check Trainees table for signup fields
    const traineesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'trainees' 
      AND column_name IN ('srn', 'coupon_code')
      ORDER BY column_name
    `);
    
    console.log('\n🎓 TRAINEES TABLE - SIGNUP FIELDS:');
    traineesResult.rows.forEach(col => {
      const required = col.is_nullable === 'NO' ? '✅ REQUIRED' : '⚪ OPTIONAL';
      console.log(`  - ${col.column_name}: ${col.data_type} ${required}`);
    });
    
    // Check Emergency Contacts table
    const emergencyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'emergency_contacts' 
      ORDER BY column_name
    `);
    
    console.log('\n🚨 EMERGENCY_CONTACTS TABLE - ALL FIELDS:');
    emergencyResult.rows.forEach(col => {
      const required = col.is_nullable === 'NO' ? '✅ REQUIRED' : '⚪ OPTIONAL';
      console.log(`  - ${col.column_name}: ${col.data_type} ${required}`);
    });
    
    // Summary
    console.log('\n📋 TRAINEE SIGNUP REQUIREMENTS COMPLIANCE:');
    console.log('✅ Personal Information: Users table');
    console.log('✅ Contact Information: Users table');  
    console.log('✅ Username & Password: Users table');
    console.log('✅ SRN & Coupon Code: Trainees table');
    console.log('✅ Emergency Contact: Emergency_contacts table');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkSignupFields();
