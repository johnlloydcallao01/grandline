import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function finalSchemaCheck() {
  try {
    console.log('🔍 FINAL DEFINITIVE SCHEMA CHECK...\n');
    
    // Check public.users columns using pg_catalog (more direct than information_schema)
    const publicUsersCatalog = await pool.query(`
      SELECT 
        a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        a.attnotnull as not_null,
        a.attnum as position
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public' 
        AND c.relname = 'users'
        AND a.attnum > 0 
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `);
    
    console.log('📋 public.users COLUMNS (via pg_catalog):');
    publicUsersCatalog.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type} ${col.not_null ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check auth.users columns
    const authUsersCatalog = await pool.query(`
      SELECT 
        a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        a.attnotnull as not_null,
        a.attnum as position
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'auth' 
        AND c.relname = 'users'
        AND a.attnum > 0 
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `);
    
    console.log('\n📋 auth.users COLUMNS (via pg_catalog):');
    authUsersCatalog.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type} ${col.not_null ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Now check what information_schema.columns shows for "users" without schema
    const infoSchemaUsers = await pool.query(`
      SELECT 
        table_schema,
        column_name, 
        data_type, 
        is_nullable,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY table_schema, ordinal_position
    `);
    
    console.log('\n📋 information_schema.columns for "users":');
    let currentSchema = '';
    infoSchemaUsers.rows.forEach((col, index) => {
      if (col.table_schema !== currentSchema) {
        currentSchema = col.table_schema;
        console.log(`\n  ${col.table_schema}.users:`);
      }
      console.log(`    ${col.ordinal_position}. ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Test which table our previous queries were actually hitting
    console.log('\n🎯 TESTING WHICH TABLE IS BEING QUERIED:');
    
    // Add a test column to public.users to see if it shows up
    try {
      await pool.query('ALTER TABLE public.users ADD COLUMN test_column_temp TEXT DEFAULT \'test\'');
      console.log('  ✅ Added test column to public.users');
      
      // Query "users" to see if test column appears
      const testQuery = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'test_column_temp'
      `);
      
      if (testQuery.rows.length > 0) {
        console.log('  ✅ Test column found in "users" query - confirms we\'re hitting public.users');
      } else {
        console.log('  ❌ Test column NOT found in "users" query - something else is happening');
      }
      
      // Clean up test column
      await pool.query('ALTER TABLE public.users DROP COLUMN test_column_temp');
      console.log('  ✅ Removed test column');
      
    } catch (error) {
      console.log(`  ❌ Test column operation failed: ${error.message}`);
    }
    
    console.log('\n💡 FINAL ANALYSIS:');
    console.log('  Based on this analysis, we can determine:');
    console.log('  1. Whether public.users is truly clean');
    console.log('  2. Whether our migration actually worked');
    console.log('  3. Why previous scripts showed mixed results');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

finalSchemaCheck();
