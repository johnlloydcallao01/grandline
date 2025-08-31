import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkEmailData() {
  try {
    console.log('🔍 CHECKING EMAIL DATA IN BOTH COLUMNS...\n');
    
    // Get column positions to identify which email column is which
    const emailColumns = await pool.query(`
      SELECT column_name, ordinal_position, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'email'
      ORDER BY ordinal_position
    `);
    
    console.log('📧 EMAIL COLUMNS FOUND:');
    emailColumns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. Position ${col.ordinal_position}: email (${col.data_type}, ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'})`);
    });
    
    // Since we can't directly query duplicate column names, let's check the table structure
    // and see what data exists
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count > 0) {
      // Get sample data - this will show us which email column has data
      const sampleData = await pool.query(`
        SELECT id, first_name, last_name, role
        FROM users 
        LIMIT 3
      `);
      
      console.log('\n📋 SAMPLE USER DATA:');
      sampleData.rows.forEach((user, index) => {
        console.log(`  User ${index + 1}: ${user.first_name} ${user.last_name} (${user.role})`);
      });
      
      // Check if we can access email data
      try {
        const emailData = await pool.query(`
          SELECT id, email, first_name, last_name
          FROM users 
          LIMIT 3
        `);
        
        console.log('\n📧 EMAIL DATA (from accessible email column):');
        emailData.rows.forEach((user, index) => {
          console.log(`  User ${index + 1}: ${user.email} (${user.first_name} ${user.last_name})`);
        });
      } catch (error) {
        console.log('\n❌ Could not access email column directly due to ambiguity');
        console.log('This confirms we have duplicate email columns');
      }
    }
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('  1. The PayloadCMS email column (NOT NULL) should contain the actual email data');
    console.log('  2. The Supabase Auth email column (NULL) should be removed');
    console.log('  3. After removing Supabase columns, the email ambiguity will be resolved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEmailData();
