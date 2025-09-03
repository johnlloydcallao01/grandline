import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function analyzeMediaSchema() {
  try {
    console.log('🔍 ANALYZING MEDIA TABLE STRUCTURE...\n');
    
    // Get media table structure
    const mediaColumns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'media' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    if (mediaColumns.rows.length === 0) {
      console.log('❌ Media table not found');
      return;
    }
    
    console.log('📋 MEDIA TABLE STRUCTURE:');
    mediaColumns.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
    });
    
    // Check for Cloudinary-specific fields
    const cloudinaryFields = mediaColumns.rows.filter(col => 
      col.column_name.includes('cloudinary') || 
      col.column_name.includes('public_id') ||
      col.column_name.includes('secure_url') ||
      col.column_name.includes('resource_type') ||
      col.column_name.includes('transformation') ||
      col.column_name.includes('format') ||
      col.column_name.includes('width') ||
      col.column_name.includes('height')
    );
    
    console.log('\n🔍 CLOUDINARY INTEGRATION CHECK:');
    if (cloudinaryFields.length > 0) {
      console.log('✅ Cloudinary integration detected:');
      cloudinaryFields.forEach(field => {
        console.log(`  - ${field.column_name}: ${field.data_type}`);
      });
    } else {
      console.log('⚠️  No obvious Cloudinary fields detected');
    }
    
    // Check for URL fields that might contain Cloudinary URLs
    const urlFields = mediaColumns.rows.filter(col => 
      col.column_name.includes('url') || 
      col.column_name.includes('src') ||
      col.column_name.includes('path')
    );
    
    console.log('\n🔗 URL/PATH FIELDS:');
    if (urlFields.length > 0) {
      urlFields.forEach(field => {
        console.log(`  - ${field.column_name}: ${field.data_type}`);
      });
    } else {
      console.log('  No URL fields found');
    }
    
    // Sample some media records to see structure
    const sampleMedia = await pool.query('SELECT * FROM media LIMIT 3');
    
    console.log('\n📊 SAMPLE MEDIA RECORDS:');
    if (sampleMedia.rows.length > 0) {
      sampleMedia.rows.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 50 
            ? value.substring(0, 50) + '...' 
            : value;
          console.log(`  ${key}: ${displayValue}`);
        });
      });
      
      // Check if any URLs contain cloudinary.com
      const hasCloudinaryUrls = sampleMedia.rows.some(record => 
        Object.values(record).some(value => 
          typeof value === 'string' && value.includes('cloudinary.com')
        )
      );
      
      console.log('\n🌤️  CLOUDINARY URL DETECTION:');
      if (hasCloudinaryUrls) {
        console.log('✅ Cloudinary URLs detected in media records');
      } else {
        console.log('❌ No Cloudinary URLs found in sample records');
      }
      
    } else {
      console.log('  No media records found');
    }
    
    // Check foreign key relationships
    const mediaForeignKeys = await pool.query(`
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
        AND (tc.table_name = 'media' OR ccu.table_name = 'media')
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log('\n🔗 MEDIA TABLE RELATIONSHIPS:');
    if (mediaForeignKeys.rows.length > 0) {
      mediaForeignKeys.rows.forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name} -> ${fk.referenced_table}.${fk.referenced_column}`);
      });
    } else {
      console.log('  No foreign key relationships found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMediaSchema();
