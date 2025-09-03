import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkExistingTables() {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'course_%'
      ORDER BY table_name
    `);
    
    console.log('🔍 CHECKING EXISTING LMS TABLES...\n');
    console.log(`Found ${tables.rows.length} existing LMS tables:`);
    
    if (tables.rows.length === 0) {
      console.log('  ✅ No existing LMS tables - ready for fresh implementation');
    } else {
      console.log('  ⚠️  Existing LMS tables found:');
      tables.rows.forEach(row => console.log(`     - ${row.table_name}`));
      
      console.log('\n🚨 CLEANUP REQUIRED');
      console.log('These tables need to be dropped before re-implementation.');
      console.log('Run the cleanup script or drop them manually.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingTables();
