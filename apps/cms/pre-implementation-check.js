import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function preImplementationCheck() {
  try {
    console.log('🔍 PRE-IMPLEMENTATION VALIDATION CHECK\n');
    console.log('=====================================================');
    console.log('Validating environment before LMS schema implementation');
    console.log('=====================================================\n');
    
    // 1. Check database connection
    console.log('1️⃣ TESTING DATABASE CONNECTION...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log(`   ✅ Connected successfully`);
    console.log(`   📅 Database time: ${connectionTest.rows[0].current_time}`);
    console.log(`   🗄️  Database version: ${connectionTest.rows[0].db_version.split(' ')[0]} ${connectionTest.rows[0].db_version.split(' ')[1]}\n`);
    
    // 2. Check required extensions
    console.log('2️⃣ CHECKING REQUIRED EXTENSIONS...');
    const extensions = await pool.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
    `);
    
    const requiredExtensions = ['uuid-ossp'];
    const installedExtensions = extensions.rows.map(row => row.extname);
    
    requiredExtensions.forEach(ext => {
      if (installedExtensions.includes(ext)) {
        const version = extensions.rows.find(row => row.extname === ext).extversion;
        console.log(`   ✅ ${ext} (version ${version}) - installed`);
      } else {
        console.log(`   ⚠️  ${ext} - will be installed during implementation`);
      }
    });
    console.log();
    
    // 3. Verify users table structure
    console.log('3️⃣ VALIDATING USERS TABLE STRUCTURE...');
    const usersTable = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    if (usersTable.rows.length === 0) {
      console.log('   ❌ CRITICAL: users table not found!');
      throw new Error('Users table is required for LMS implementation');
    }
    
    const idColumn = usersTable.rows.find(col => col.column_name === 'id');
    if (!idColumn) {
      console.log('   ❌ CRITICAL: users.id column not found!');
      throw new Error('Users table must have an id column');
    }
    
    if (idColumn.data_type === 'integer') {
      console.log('   ✅ users.id is INTEGER - compatible with LMS schema');
    } else {
      console.log(`   ❌ CRITICAL: users.id is ${idColumn.data_type}, expected INTEGER`);
      throw new Error('Users table id must be INTEGER type');
    }
    
    // Check for sample users
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`   📊 Current users: ${userCount.rows[0].count}`);
    console.log();
    
    // 4. Check for table name conflicts
    console.log('4️⃣ CHECKING FOR TABLE NAME CONFLICTS...');
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const lmsTables = [
      'course_content_base', 'course_content_metadata', 'courses', 'course_modules', 'course_lessons', 
      'course_assignments', 'course_quizzes', 'course_quiz_questions', 'course_content_hierarchy',
      'course_progress', 'course_submissions', 'course_categories', 'course_content_categories',
      'course_enrollments', 'course_certificates'
    ];
    
    const existingTableNames = existingTables.rows.map(row => row.table_name);
    const conflicts = lmsTables.filter(table => existingTableNames.includes(table));
    
    if (conflicts.length > 0) {
      console.log('   ❌ TABLE NAME CONFLICTS DETECTED:');
      conflicts.forEach(table => console.log(`      - ${table} already exists`));
      console.log('\n   🚨 RECOMMENDATION: Drop conflicting tables or rename them before proceeding');
      throw new Error('Table name conflicts must be resolved before implementation');
    } else {
      console.log('   ✅ No table name conflicts detected');
      console.log(`   📊 Current tables: ${existingTableNames.length}`);
      console.log(`   📊 LMS tables to create: ${lmsTables.length}`);
    }
    console.log();
    
    // 5. Check database permissions
    console.log('5️⃣ CHECKING DATABASE PERMISSIONS...');
    try {
      // Test CREATE TABLE permission
      await pool.query('CREATE TEMP TABLE test_permissions (id INTEGER)');
      await pool.query('DROP TABLE test_permissions');
      console.log('   ✅ CREATE TABLE - granted');
      
      // Test CREATE INDEX permission
      await pool.query('CREATE TEMP TABLE test_index (id INTEGER)');
      await pool.query('CREATE INDEX test_idx ON test_index(id)');
      await pool.query('DROP TABLE test_index');
      console.log('   ✅ CREATE INDEX - granted');
      
      // Test CREATE FUNCTION permission
      await pool.query(`
        CREATE OR REPLACE FUNCTION test_function() 
        RETURNS INTEGER AS $$ BEGIN RETURN 1; END; $$ LANGUAGE plpgsql
      `);
      await pool.query('DROP FUNCTION test_function()');
      console.log('   ✅ CREATE FUNCTION - granted');
      
    } catch (error) {
      console.log(`   ❌ PERMISSION ERROR: ${error.message}`);
      throw new Error('Insufficient database permissions for implementation');
    }
    console.log();
    
    // 6. Estimate implementation time
    console.log('6️⃣ IMPLEMENTATION ESTIMATES...');
    console.log('   📊 Total objects to create: 39');
    console.log('   📊 Estimated time: 2-5 minutes');
    console.log('   📊 Tables: 15');
    console.log('   📊 Indexes: 14');
    console.log('   📊 Functions: 5');
    console.log('   📊 Triggers: 4');
    console.log('   📊 Materialized Views: 1');
    console.log();
    
    // 7. Final validation summary
    console.log('✅ PRE-IMPLEMENTATION VALIDATION COMPLETE');
    console.log('=====================================================');
    console.log('🎯 READY FOR IMPLEMENTATION');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: node implement-lms-schema.js');
    console.log('2. Verify: node post-implementation-check.js');
    console.log('3. Test: Create sample course data');
    console.log('=====================================================');
    
  } catch (error) {
    console.error('\n❌ PRE-IMPLEMENTATION CHECK FAILED');
    console.error('=====================================================');
    console.error(`Error: ${error.message}`);
    console.error('\n🚨 DO NOT PROCEED WITH IMPLEMENTATION');
    console.error('Fix the above issues before running the implementation script.');
    console.error('=====================================================');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

preImplementationCheck();
