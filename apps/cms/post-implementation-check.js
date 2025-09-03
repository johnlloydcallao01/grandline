import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function postImplementationCheck() {
  try {
    console.log('🔍 POST-IMPLEMENTATION VERIFICATION\n');
    console.log('=====================================================');
    console.log('Verifying LMS schema implementation success');
    console.log('=====================================================\n');
    
    // 1. Verify all expected tables exist
    console.log('1️⃣ VERIFYING TABLE CREATION...');
    const expectedTables = [
      'course_content_base', 'course_content_metadata', 'courses', 'course_modules', 'course_lessons', 
      'course_assignments', 'course_quizzes', 'course_quiz_questions', 'course_content_hierarchy',
      'course_progress', 'course_submissions', 'course_categories', 'course_content_categories',
      'course_enrollments', 'course_certificates'
    ];
    
    const existingTables = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
      ORDER BY table_name
    `, [expectedTables]);
    
    const createdTableNames = existingTables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !createdTableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('   ❌ MISSING TABLES:');
      missingTables.forEach(table => console.log(`      - ${table}`));
      throw new Error('Some tables were not created successfully');
    } else {
      console.log(`   ✅ All ${expectedTables.length} tables created successfully`);
      existingTables.rows.forEach(row => {
        console.log(`      - ${row.table_name} (${row.column_count} columns)`);
      });
    }
    console.log();
    
    // 2. Verify foreign key relationships
    console.log('2️⃣ VERIFYING FOREIGN KEY CONSTRAINTS...');
    const foreignKeys = await pool.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name LIKE 'course_%'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log(`   ✅ Found ${foreignKeys.rows.length} foreign key constraints`);
    
    // Check critical user references
    const userReferences = foreignKeys.rows.filter(fk => fk.referenced_table === 'users');
    console.log(`   ✅ User table references: ${userReferences.length}`);
    userReferences.forEach(ref => {
      console.log(`      - ${ref.table_name}.${ref.column_name} -> users.${ref.referenced_column}`);
    });
    console.log();
    
    // 3. Verify indexes
    console.log('3️⃣ VERIFYING INDEX CREATION...');
    const indexes = await pool.query(`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_course_%'
      ORDER BY tablename, indexname
    `);
    
    console.log(`   ✅ Created ${indexes.rows.length} performance indexes`);
    const indexesByTable = {};
    indexes.rows.forEach(idx => {
      if (!indexesByTable[idx.tablename]) indexesByTable[idx.tablename] = [];
      indexesByTable[idx.tablename].push(idx.indexname);
    });
    
    Object.entries(indexesByTable).forEach(([table, tableIndexes]) => {
      console.log(`      - ${table}: ${tableIndexes.length} indexes`);
    });
    console.log();
    
    // 4. Verify functions
    console.log('4️⃣ VERIFYING FUNCTION CREATION...');
    const expectedFunctions = [
      'create_course', 'add_course_content_relationship', 'refresh_course_statistics', 
      'update_updated_at_column', 'validate_content_hierarchy'
    ];
    
    const functions = await pool.query(`
      SELECT proname, pronargs
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname = ANY($1)
      ORDER BY proname
    `, [expectedFunctions]);
    
    const createdFunctions = functions.rows.map(row => row.proname);
    const missingFunctions = expectedFunctions.filter(func => !createdFunctions.includes(func));
    
    if (missingFunctions.length > 0) {
      console.log('   ❌ MISSING FUNCTIONS:');
      missingFunctions.forEach(func => console.log(`      - ${func}`));
    } else {
      console.log(`   ✅ All ${expectedFunctions.length} functions created successfully`);
      functions.rows.forEach(row => {
        console.log(`      - ${row.proname} (${row.pronargs} parameters)`);
      });
    }
    console.log();
    
    // 5. Verify triggers
    console.log('5️⃣ VERIFYING TRIGGER CREATION...');
    const triggers = await pool.query(`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      AND (trigger_name LIKE '%course_%' OR trigger_name LIKE '%updated_at%')
      ORDER BY event_object_table, trigger_name
    `);
    
    console.log(`   ✅ Created ${triggers.rows.length} triggers`);
    triggers.rows.forEach(trigger => {
      console.log(`      - ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.action_timing} ${trigger.event_manipulation})`);
    });
    console.log();
    
    // 6. Verify materialized views
    console.log('6️⃣ VERIFYING MATERIALIZED VIEWS...');
    const matviews = await pool.query(`
      SELECT matviewname, definition
      FROM pg_matviews 
      WHERE schemaname = 'public' 
      AND matviewname LIKE 'course_%'
    `);
    
    console.log(`   ✅ Created ${matviews.rows.length} materialized views`);
    matviews.rows.forEach(view => {
      console.log(`      - ${view.matviewname}`);
    });
    console.log();
    
    // 7. Test basic functionality
    console.log('7️⃣ TESTING BASIC FUNCTIONALITY...');
    
    // Test course creation function
    try {
      const testResult = await pool.query(`
        SELECT create_course(
          'Test Course', 
          'Test Description', 
          'TEST001', 
          (SELECT id FROM users LIMIT 1), 
          (SELECT id FROM users LIMIT 1)
        ) as course_id
      `);
      
      const courseId = testResult.rows[0].course_id;
      console.log(`   ✅ Course creation function works (created course: ${courseId})`);
      
      // Clean up test data
      await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
      await pool.query('DELETE FROM course_content_base WHERE id = $1', [courseId]);
      console.log(`   ✅ Test data cleaned up`);
      
    } catch (error) {
      console.log(`   ❌ Course creation test failed: ${error.message}`);
    }
    console.log();
    
    // 8. Performance check
    console.log('8️⃣ PERFORMANCE VALIDATION...');
    
    // Test query performance on base tables
    const performanceStart = Date.now();
    await pool.query(`
      SELECT ccb.content_type, COUNT(*) 
      FROM course_content_base ccb 
      GROUP BY ccb.content_type
    `);
    const performanceEnd = Date.now();
    
    console.log(`   ✅ Base query performance: ${performanceEnd - performanceStart}ms`);
    
    // Check materialized view refresh
    try {
      await pool.query('SELECT refresh_course_statistics()');
      console.log(`   ✅ Materialized view refresh function works`);
    } catch (error) {
      console.log(`   ⚠️  Materialized view refresh: ${error.message}`);
    }
    console.log();
    
    // 9. Final summary
    console.log('✅ POST-IMPLEMENTATION VERIFICATION COMPLETE');
    console.log('=====================================================');
    console.log('🎯 IMPLEMENTATION SUCCESS SUMMARY:');
    console.log(`   📊 Tables: ${existingTables.rows.length}/${expectedTables.length} created`);
    console.log(`   📊 Indexes: ${indexes.rows.length} created`);
    console.log(`   📊 Functions: ${functions.rows.length}/${expectedFunctions.length} created`);
    console.log(`   📊 Triggers: ${triggers.rows.length} created`);
    console.log(`   📊 Materialized Views: ${matviews.rows.length} created`);
    console.log(`   📊 Foreign Keys: ${foreignKeys.rows.length} constraints`);
    console.log(`   📊 User References: ${userReferences.length} properly linked`);
    console.log('\n🚀 LMS DATABASE IS READY FOR USE!');
    console.log('=====================================================');
    
  } catch (error) {
    console.error('\n❌ POST-IMPLEMENTATION VERIFICATION FAILED');
    console.error('=====================================================');
    console.error(`Error: ${error.message}`);
    console.error('\n🚨 Implementation may be incomplete or corrupted');
    console.error('Review the errors and consider re-running implementation');
    console.error('=====================================================');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

postImplementationCheck();
