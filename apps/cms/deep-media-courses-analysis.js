import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function deepAnalysis() {
  try {
    console.log('🔍 SUPER DEEP ANALYSIS: MEDIA & COURSES STRUCTURES');
    console.log('=====================================================\n');
    
    // 1. ANALYZE MEDIA TABLE STRUCTURE
    console.log('📊 1. MEDIA TABLE COMPLETE ANALYSIS');
    console.log('─'.repeat(50));
    
    const mediaStructure = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'media' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Media Table Schema:');
    mediaStructure.rows.forEach(col => {
      const type = col.data_type;
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const precision = col.numeric_precision ? `(${col.numeric_precision}${col.numeric_scale ? ','+col.numeric_scale : ''})` : '';
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name}: ${type}${length}${precision} ${nullable}${defaultVal}`);
    });
    
    // Check media constraints
    const mediaConstraints = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'media' AND tc.table_schema = 'public'
      ORDER BY tc.constraint_type, tc.constraint_name
    `);
    
    console.log('\nMedia Table Constraints:');
    mediaConstraints.rows.forEach(constraint => {
      if (constraint.constraint_type === 'FOREIGN KEY') {
        console.log(`  FK: ${constraint.column_name} -> ${constraint.referenced_table}.${constraint.referenced_column}`);
      } else {
        console.log(`  ${constraint.constraint_type}: ${constraint.constraint_name}`);
      }
    });
    
    // Sample media data
    const mediaSample = await pool.query('SELECT * FROM media LIMIT 2');
    console.log('\nSample Media Records:');
    if (mediaSample.rows.length > 0) {
      mediaSample.rows.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 60 
            ? value.substring(0, 60) + '...' 
            : value;
          console.log(`  ${key}: ${displayValue}`);
        });
      });
    } else {
      console.log('  No media records found');
    }
    
    // 2. ANALYZE COURSES TABLE STRUCTURE
    console.log('\n\n📊 2. COURSES TABLE COMPLETE ANALYSIS');
    console.log('─'.repeat(50));
    
    const coursesStructure = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    if (coursesStructure.rows.length > 0) {
      console.log('Courses Table Schema:');
      coursesStructure.rows.forEach(col => {
        const type = col.data_type;
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  ${col.column_name}: ${type}${length} ${nullable}${defaultVal}`);
      });
      
      // Check courses constraints
      const coursesConstraints = await pool.query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'courses' AND tc.table_schema = 'public'
        ORDER BY tc.constraint_type, tc.constraint_name
      `);
      
      console.log('\nCourses Table Constraints:');
      coursesConstraints.rows.forEach(constraint => {
        if (constraint.constraint_type === 'FOREIGN KEY') {
          console.log(`  FK: ${constraint.column_name} -> ${constraint.referenced_table}.${constraint.referenced_column}`);
        } else {
          console.log(`  ${constraint.constraint_type}: ${constraint.constraint_name}`);
        }
      });
      
      // Sample courses data
      const coursesSample = await pool.query('SELECT * FROM courses LIMIT 2');
      console.log('\nSample Courses Records:');
      if (coursesSample.rows.length > 0) {
        coursesSample.rows.forEach((record, index) => {
          console.log(`\nRecord ${index + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            const displayValue = typeof value === 'string' && value.length > 60 
              ? value.substring(0, 60) + '...' 
              : value;
            console.log(`  ${key}: ${displayValue}`);
          });
        });
      } else {
        console.log('  No courses records found');
      }
      
    } else {
      console.log('❌ Courses table does not exist yet');
    }
    
    // 3. CHECK EXISTING RELATIONSHIPS
    console.log('\n\n📊 3. EXISTING RELATIONSHIPS ANALYSIS');
    console.log('─'.repeat(50));
    
    // Check if media is already referenced by courses
    const mediaReferences = await pool.query(`
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
        AND (ccu.table_name = 'media' OR tc.table_name LIKE 'course%')
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log('Media-Related Foreign Keys:');
    if (mediaReferences.rows.length > 0) {
      mediaReferences.rows.forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name} -> ${fk.referenced_table}.${fk.referenced_column}`);
      });
    } else {
      console.log('  No media foreign key relationships found');
    }
    
    // 4. CHECK CURRENT MEDIA USAGE PATTERNS
    console.log('\n\n📊 4. MEDIA USAGE PATTERNS ANALYSIS');
    console.log('─'.repeat(50));
    
    // Check how media is currently used
    const mediaUsage = await pool.query(`
      SELECT 
        'posts' as table_name,
        COUNT(*) as media_references
      FROM posts 
      WHERE featured_image_id IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'payload_locked_documents_rels' as table_name,
        COUNT(*) as media_references
      FROM payload_locked_documents_rels 
      WHERE media_id IS NOT NULL
    `);
    
    console.log('Current Media Usage:');
    mediaUsage.rows.forEach(usage => {
      console.log(`  ${usage.table_name}: ${usage.media_references} references`);
    });
    
    console.log('\n\n✅ DEEP ANALYSIS COMPLETE');
    console.log('=====================================================');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
  } finally {
    await pool.end();
  }
}

deepAnalysis();
