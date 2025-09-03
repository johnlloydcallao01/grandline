import { Pool } from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function implementLMSSchema() {
  const client = await pool.connect();

  try {
    console.log('🚀 STARTING LMS SCHEMA IMPLEMENTATION\n');
    console.log('=====================================================');
    console.log('Enterprise-Grade LMS Database Implementation');
    console.log('Architecture: Three-Layer Design Pattern');
    console.log('Compatibility: INTEGER user IDs for CMS integration');
    console.log('=====================================================\n');

    // Begin transaction for atomic implementation
    await client.query('BEGIN');
    console.log('📦 Transaction started - ensuring atomic implementation\n');

    // Read and execute the SQL file directly
    const sqlScript = readFileSync('./implement-lms-schema.sql', 'utf8');

    console.log('📋 Executing complete SQL script...\n');

    // Execute the entire script at once
    await client.query(sqlScript);

    console.log('✅ All SQL statements executed successfully\n');

    // Commit the transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully\n');
    
    // Verify implementation
    console.log('🔍 VERIFYING IMPLEMENTATION...\n');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'course_%'
      ORDER BY table_name
    `);
    
    console.log(`📊 LMS Tables Created: ${tables.rows.length}`);
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_course_%'
      ORDER BY indexname
    `);
    
    console.log(`\n📊 LMS Indexes Created: ${indexes.rows.length}`);
    indexes.rows.forEach(row => console.log(`   - ${row.indexname}`));
    
    // Check functions
    const functions = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname IN ('create_course', 'add_course_content_relationship', 'refresh_course_statistics', 'update_updated_at_column', 'validate_content_hierarchy')
      ORDER BY proname
    `);
    
    console.log(`\n📊 LMS Functions Created: ${functions.rows.length}`);
    functions.rows.forEach(row => console.log(`   - ${row.proname}`));
    
    // Check materialized views
    const matviews = await client.query(`
      SELECT matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'public' 
      AND matviewname LIKE 'course_%'
    `);
    
    console.log(`\n📊 Materialized Views Created: ${matviews.rows.length}`);
    matviews.rows.forEach(row => console.log(`   - ${row.matviewname}`));
    
    console.log('\n🎉 LMS SCHEMA IMPLEMENTATION COMPLETE!');
    console.log('=====================================================');
    console.log(`✅ Successfully executed complete SQL script`);
    console.log(`✅ Created ${tables.rows.length} tables`);
    console.log(`✅ Created ${indexes.rows.length} indexes`);
    console.log(`✅ Created ${functions.rows.length} functions`);
    console.log(`✅ Created ${matviews.rows.length} materialized views`);
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Run post-implementation verification');
    console.log('2. Create sample course data for testing');
    console.log('3. Update application code to use new schema');
    console.log('4. Set up regular materialized view refresh schedule');
    console.log('=====================================================');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n💥 IMPLEMENTATION FAILED - TRANSACTION ROLLED BACK');
    console.error('=====================================================');
    console.error(`Error: ${error.message}`);
    console.error('\n🚨 Database state has been restored to pre-implementation');
    console.error('Fix the error and run the implementation again.');
    console.error('=====================================================');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run with error handling
implementLMSSchema().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
