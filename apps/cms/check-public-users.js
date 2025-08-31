import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function checkPublicUsers() {
  try {
    console.log('🔍 CHECKING PUBLIC.USERS TABLE SPECIFICALLY...\n');
    
    // Check public.users table structure specifically
    const publicColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default, ordinal_position
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 PUBLIC.USERS TABLE COLUMNS:');
    publicColumns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if there are any foreign keys or constraints linking to auth.users
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public' AND tc.table_name = 'users'
    `);
    
    console.log('\n🔗 CONSTRAINTS ON PUBLIC.USERS:');
    if (constraints.rows.length > 0) {
      constraints.rows.forEach(constraint => {
        console.log(`  - ${constraint.constraint_type}: ${constraint.constraint_name}`);
        if (constraint.foreign_table_name) {
          console.log(`    Links ${constraint.column_name} -> ${constraint.foreign_table_schema}.${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        }
      });
    } else {
      console.log('  No constraints found');
    }
    
    // Check if there are triggers that might be causing the issue
    const triggers = await pool.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_schema = 'public' AND event_object_table = 'users'
    `);
    
    console.log('\n🔧 TRIGGERS ON PUBLIC.USERS:');
    if (triggers.rows.length > 0) {
      triggers.rows.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name} (${trigger.event_manipulation})`);
        console.log(`    Action: ${trigger.action_statement.substring(0, 100)}...`);
      });
    } else {
      console.log('  No triggers found');
    }
    
    // Try to understand the relationship between auth.users and public.users
    console.log('\n🔍 CHECKING RELATIONSHIP BETWEEN AUTH.USERS AND PUBLIC.USERS...');
    
    // Check if public.users has an id that references auth.users
    const authUserCount = await pool.query('SELECT COUNT(*) as count FROM auth.users');
    const publicUserCount = await pool.query('SELECT COUNT(*) as count FROM public.users');
    
    console.log(`  - auth.users count: ${authUserCount.rows[0].count}`);
    console.log(`  - public.users count: ${publicUserCount.rows[0].count}`);
    
    // Check if the IDs match
    if (authUserCount.rows[0].count > 0 && publicUserCount.rows[0].count > 0) {
      const idCheck = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM auth.users au WHERE au.id::text IN (SELECT id::text FROM public.users)) as matching_ids,
          (SELECT COUNT(DISTINCT id) FROM public.users) as unique_public_ids
      `);
      
      console.log(`  - Matching IDs between auth.users and public.users: ${idCheck.rows[0].matching_ids}`);
      console.log(`  - Unique IDs in public.users: ${idCheck.rows[0].unique_public_ids}`);
    }
    
    console.log('\n💡 ANALYSIS:');
    if (publicColumns.rows.some(col => col.column_name === 'instance_id')) {
      console.log('  ❌ PROBLEM: public.users contains auth.users columns');
      console.log('  🔧 SOLUTION: Need to separate PayloadCMS users from Supabase auth.users');
      console.log('  📝 RECOMMENDATION: Create a clean public.users table for PayloadCMS only');
    } else {
      console.log('  ✅ public.users appears to be clean of auth.users columns');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPublicUsers();
