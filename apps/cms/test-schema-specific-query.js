import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function testSchemaSpecificQuery() {
  try {
    console.log('🔍 TESTING SCHEMA-SPECIFIC QUERIES...\n');
    
    // Test querying public.users specifically
    console.log('📊 QUERYING public.users SPECIFICALLY:');
    try {
      const publicUsersData = await pool.query(`
        SELECT id, email, first_name, last_name, role
        FROM public.users 
        LIMIT 3
      `);
      
      console.log('  ✅ public.users query successful:');
      publicUsersData.rows.forEach((user, index) => {
        console.log(`    User ${index + 1}: ${user.email} (${user.first_name} ${user.last_name}, ${user.role})`);
      });
    } catch (error) {
      console.log(`  ❌ public.users query failed: ${error.message}`);
    }
    
    // Test querying just "users" (without schema)
    console.log('\n📊 QUERYING users (without schema prefix):');
    try {
      const usersData = await pool.query(`
        SELECT id, email, first_name, last_name, role
        FROM users 
        LIMIT 3
      `);
      
      console.log('  ✅ users query successful:');
      usersData.rows.forEach((user, index) => {
        console.log(`    User ${index + 1}: ${user.email} (${user.first_name} ${user.last_name}, ${user.role})`);
      });
    } catch (error) {
      console.log(`  ❌ users query failed: ${error.message}`);
    }
    
    // Check the search_path
    const searchPath = await pool.query('SHOW search_path');
    console.log(`\n🔍 Current search_path: ${searchPath.rows[0].search_path}`);
    
    // Check if there are any views named "users"
    const userViews = await pool.query(`
      SELECT schemaname, viewname, definition
      FROM pg_views 
      WHERE viewname = 'users'
    `);
    
    console.log('\n👁️ VIEWS NAMED "users":');
    if (userViews.rows.length > 0) {
      userViews.rows.forEach(view => {
        console.log(`  - ${view.schemaname}.${view.viewname}`);
        console.log(`    Definition: ${view.definition.substring(0, 200)}...`);
      });
    } else {
      console.log('  No views named "users" found');
    }
    
    // Check if there are multiple tables named "users" in different schemas
    const userTables = await pool.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables 
      WHERE table_name = 'users'
      ORDER BY table_schema
    `);
    
    console.log('\n📋 ALL TABLES/VIEWS NAMED "users":');
    userTables.rows.forEach(table => {
      console.log(`  - ${table.table_schema}.${table.table_name} (${table.table_type})`);
    });
    
    // Test PayloadCMS configuration - check what schema it's using
    console.log('\n🔧 TESTING PAYLOADCMS SCHEMA USAGE:');
    
    // Check if PayloadCMS is configured to use a specific schema
    const payloadTables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name IN ('payload_migrations', 'payload_preferences')
      ORDER BY table_schema, table_name
    `);
    
    console.log('  PayloadCMS tables found in:');
    payloadTables.rows.forEach(table => {
      console.log(`    - ${table.table_schema}.${table.table_name}`);
    });
    
    console.log('\n💡 CONCLUSION:');
    console.log('  If public.users is clean but "users" shows mixed columns,');
    console.log('  then PayloadCMS might be configured to use a different schema');
    console.log('  or there might be a view/alias causing the confusion.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testSchemaSpecificQuery();
