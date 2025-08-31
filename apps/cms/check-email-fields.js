import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkEmailFields() {
  try {
    console.log('🔍 DETAILED EMAIL FIELD ANALYSIS...\n');
    
    // Get all email-related columns
    const emailColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name LIKE '%email%'
      ORDER BY ordinal_position
    `);
    
    console.log('📧 EMAIL-RELATED COLUMNS IN USERS TABLE:');
    emailColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? '(default: ' + col.column_default + ')' : ''}`);
    });
    
    // Check if there are any users and sample their email data
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 TOTAL USERS: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count > 0) {
      const sampleUsers = await pool.query(`
        SELECT id, email, first_name, last_name, role
        FROM users
        LIMIT 3
      `);

      console.log('\n📋 SAMPLE USER EMAIL DATA:');
      sampleUsers.rows.forEach((user, index) => {
        console.log(`  User ${index + 1}:`);
        console.log(`    - ID: ${user.id}`);
        console.log(`    - Email: ${user.email || 'NULL'}`);
        console.log(`    - Name: ${user.first_name} ${user.last_name}`);
        console.log(`    - Role: ${user.role}`);
      });
    }
    
    // Check instructors table for contact_email
    const instructorEmails = await pool.query(`
      SELECT i.contact_email, u.email as user_email, u.first_name, u.last_name
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      LIMIT 3
    `);
    
    if (instructorEmails.rows.length > 0) {
      console.log('\n👨‍🏫 INSTRUCTOR EMAIL DATA:');
      instructorEmails.rows.forEach((instructor, index) => {
        console.log(`  Instructor ${index + 1}:`);
        console.log(`    - User Email: ${instructor.user_email || 'NULL'}`);
        console.log(`    - Contact Email: ${instructor.contact_email || 'NULL'}`);
        console.log(`    - Name: ${instructor.first_name} ${instructor.last_name}`);
      });
    } else {
      console.log('\n👨‍🏫 INSTRUCTOR EMAIL DATA: No instructors found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEmailFields();
