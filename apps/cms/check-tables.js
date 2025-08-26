import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkTables() {
  try {
    console.log('🔍 Checking current database tables...\n');
    
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Current Tables:');
    for (const table of tables.rows) {
      console.log('  -', table.table_name);
    }
    
    // Check users table structure
    console.log('\n🔍 Checking users table structure...');
    const userColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n👤 Users Table Structure:');
    for (const col of userColumns.rows) {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    }
    
    // Check role tables
    const roleTables = ['admins', 'instructors', 'trainees'];
    for (const roleTable of roleTables) {
      try {
        const roleColumns = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [roleTable]);
        
        if (roleColumns.rows.length > 0) {
          console.log(`\n🎭 ${roleTable.charAt(0).toUpperCase() + roleTable.slice(1)} Table Structure:`);
          for (const col of roleColumns.rows) {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
          }
        }
      } catch (err) {
        console.log(`\n⚠️  ${roleTable} table not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkTables();
