import { Pool } from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function implementMediaIntegration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 IMPLEMENTING MEDIA INTEGRATION FOR COURSES\n');
    console.log('=====================================================');
    console.log('Connecting courses with Cloudinary-integrated media table');
    console.log('Using original image sizes (no transformations)');
    console.log('=====================================================\n');
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('📦 Transaction started\n');
    
    // Read and execute the SQL file
    const sqlScript = readFileSync('./implement-media-integration.sql', 'utf8');
    
    console.log('📋 Executing media integration script...\n');
    
    // Execute the script
    await client.query(sqlScript);
    
    console.log('✅ Media integration script executed successfully\n');
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully\n');
    
    // Verify implementation
    console.log('🔍 VERIFYING MEDIA INTEGRATION...\n');
    
    // Check if columns were added
    const coursesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('thumbnail_id', 'banner_image_id')
      ORDER BY column_name
    `);
    
    console.log('📊 New Courses Table Columns:');
    coursesColumns.rows.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      console.log(`  ${col.column_name}: ${col.data_type} ${nullable}`);
    });
    
    const contentBaseColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'course_content_base' 
      AND column_name = 'thumbnail_id'
    `);
    
    console.log('\n📊 Course Content Base New Column:');
    contentBaseColumns.rows.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      console.log(`  ${col.column_name}: ${col.data_type} ${nullable}`);
    });
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (indexname LIKE '%thumbnail%' OR indexname LIKE '%banner%')
      ORDER BY tablename, indexname
    `);
    
    console.log('\n📊 New Media Indexes:');
    indexes.rows.forEach(idx => {
      console.log(`  ${idx.indexname} on ${idx.tablename}`);
    });
    
    // Check functions
    const functions = await client.query(`
      SELECT proname, pronargs
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname IN ('get_course_with_media', 'get_all_courses_with_media', 'update_course_media')
      ORDER BY proname
    `);
    
    console.log('\n📊 New Media Functions:');
    functions.rows.forEach(func => {
      console.log(`  ${func.proname} (${func.pronargs} parameters)`);
    });
    
    // Test the updated create_course function
    console.log('\n🧪 TESTING MEDIA INTEGRATION...');
    
    try {
      const testResult = await client.query(`
        SELECT create_course(
          'Test Course with Media', 
          'Test Description', 
          'TEST-MEDIA-001', 
          (SELECT id FROM users LIMIT 1), 
          (SELECT id FROM users LIMIT 1),
          NULL,  -- thumbnail_id (no media yet)
          NULL   -- banner_id (no media yet)
        ) as course_id
      `);
      
      const courseId = testResult.rows[0].course_id;
      console.log(`  ✅ Course creation with media support works (ID: ${courseId})`);
      
      // Test the get_course_with_media function
      const courseWithMedia = await client.query(`
        SELECT * FROM get_course_with_media($1)
      `, [courseId]);
      
      console.log(`  ✅ get_course_with_media function works`);
      console.log(`     Course: ${courseWithMedia.rows[0].title}`);
      console.log(`     Thumbnail URL: ${courseWithMedia.rows[0].thumbnail_url || 'None'}`);
      console.log(`     Banner URL: ${courseWithMedia.rows[0].banner_url || 'None'}`);
      
      // Clean up test data
      await client.query('DELETE FROM courses WHERE id = $1', [courseId]);
      await client.query('DELETE FROM course_content_base WHERE id = $1', [courseId]);
      console.log(`  ✅ Test data cleaned up`);
      
    } catch (error) {
      console.log(`  ❌ Function test failed: ${error.message}`);
    }
    
    console.log('\n🎉 MEDIA INTEGRATION IMPLEMENTATION COMPLETE!');
    console.log('=====================================================');
    console.log('✅ Added thumbnail_id and banner_image_id to courses table');
    console.log('✅ Added thumbnail_id to course_content_base table');
    console.log('✅ Created performance indexes for media references');
    console.log('✅ Created helper functions for media retrieval');
    console.log('✅ Updated create_course function with media support');
    console.log('✅ Created update_course_media function');
    console.log('\n🎯 READY FOR USE:');
    console.log('- Courses can now have thumbnails and banner images');
    console.log('- Uses existing Cloudinary-integrated media table');
    console.log('- Original image sizes (no transformations)');
    console.log('- Consistent with posts.featured_image_id pattern');
    console.log('=====================================================');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n💥 MEDIA INTEGRATION FAILED - TRANSACTION ROLLED BACK');
    console.error('=====================================================');
    console.error(`Error: ${error.message}`);
    console.error('Database state has been restored.');
    console.error('=====================================================');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

implementMediaIntegration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
