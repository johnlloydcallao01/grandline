import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkDatabaseType() {
  try {
    console.log('🔍 CHECKING DATABASE TYPE AND SCHEMA...\n');
    
    // Check if this is a Supabase database
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('auth', 'public', 'supabase_functions', 'storage')
      ORDER BY schema_name
    `);
    
    console.log('📋 AVAILABLE SCHEMAS:');
    schemas.rows.forEach(schema => {
      console.log(`  - ${schema.schema_name}`);
    });
    
    const hasAuthSchema = schemas.rows.some(s => s.schema_name === 'auth');
    const hasSupabaseFunctions = schemas.rows.some(s => s.schema_name === 'supabase_functions');
    
    if (hasAuthSchema || hasSupabaseFunctions) {
      console.log('\n🎯 DETECTED: This is a Supabase database');
      
      // Check if there's an auth.users table
      const authUsers = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'auth' AND table_name = 'users'
        )
      `);
      
      if (authUsers.rows[0].exists) {
        console.log('  ✅ Found auth.users table');
        
        // Check auth.users structure
        const authColumns = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'auth' AND table_name = 'users'
          ORDER BY ordinal_position
        `);
        
        console.log('\n📊 AUTH.USERS TABLE COLUMNS:');
        authColumns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      }
      
      // Check public.users table
      const publicUsers = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'users'
        )
      `);
      
      if (publicUsers.rows[0].exists) {
        console.log('\n  ✅ Found public.users table');
        
        // Check if there are any views or triggers linking them
        const views = await pool.query(`
          SELECT table_name, view_definition
          FROM information_schema.views 
          WHERE table_schema = 'public' AND table_name = 'users'
        `);
        
        if (views.rows.length > 0) {
          console.log('\n🔗 FOUND VIEW: public.users is a view, not a table!');
          console.log('  This explains why columns cannot be dropped directly');
          console.log('  View definition:', views.rows[0].view_definition.substring(0, 200) + '...');
        }
      }
      
    } else {
      console.log('\n🎯 DETECTED: This is a regular PostgreSQL database');
    }
    
    // Check what we're actually working with
    const tableType = await pool.query(`
      SELECT table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    console.log(`\n📊 PUBLIC.USERS TABLE TYPE: ${tableType.rows[0]?.table_type || 'NOT FOUND'}`);
    
    if (tableType.rows[0]?.table_type === 'VIEW') {
      console.log('\n⚠️  CRITICAL FINDING:');
      console.log('  The "users" table is actually a VIEW that combines auth.users + public profile data');
      console.log('  This is why our migration to drop columns failed');
      console.log('  We need a different approach to clean up the schema');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseType();
