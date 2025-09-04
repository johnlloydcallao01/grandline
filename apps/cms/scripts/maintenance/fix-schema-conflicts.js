import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

async function fixSchemaConflicts() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URI 
  });

  try {
    console.log('🔧 Fixing schema conflicts...\n');
    
    // List of enterprise tables that conflict with PayloadCMS
    const conflictingTables = [
      'course_content_base',
      'course_content_metadata', 
      'course_content_categories',
      'course_content_hierarchy',
      'course_assignments',
      'course_certificates',
      'course_lessons',
      'course_modules',
      'course_progress',
      'course_quiz_questions',
      'course_quizzes',
      'course_submissions'
    ];

    console.log('📋 Tables to be removed (enterprise schema conflicts):');
    conflictingTables.forEach(table => console.log(`- ${table}`));

    console.log('\n⚠️  This will remove the enterprise LMS schema and keep only PayloadCMS tables.');
    console.log('PayloadCMS will handle all course management through its collections.\n');

    // Drop tables in correct order (handle foreign key dependencies)
    console.log('🗑️  Removing conflicting tables...\n');

    for (const table of conflictingTables) {
      try {
        // First check if table exists
        const checkResult = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
          )
        `, [table]);

        if (checkResult.rows[0].exists) {
          // Drop the table with CASCADE to handle foreign keys
          await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`✅ Removed: ${table}`);
        } else {
          console.log(`⏭️  Skipped: ${table} (doesn't exist)`);
        }
      } catch (error) {
        console.log(`❌ Error removing ${table}: ${error.message}`);
      }
    }

    // Verify remaining tables
    console.log('\n📊 Verifying remaining LMS tables...');
    const remainingResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('courses', 'course_categories', 'course_enrollments')
      ORDER BY table_name
    `);

    console.log('✅ PayloadCMS LMS tables remaining:');
    remainingResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    console.log('\n🎉 Schema conflict resolution complete!');
    console.log('PayloadCMS should now work without introspection errors.');

  } catch (error) {
    console.error('❌ Fix error:', error.message);
  } finally {
    await pool.end();
  }
}

fixSchemaConflicts();
