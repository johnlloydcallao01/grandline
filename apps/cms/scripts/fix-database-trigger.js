#!/usr/bin/env node

/**
 * Fix Database Trigger Schema Mismatch
 * 
 * This script fixes the database trigger that was trying to insert into
 * non-existent columns (is_active) in the admins table.
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function fixDatabaseTrigger() {
  try {
    console.log('🔧 Fixing database trigger schema mismatch...')
    
    // Updated trigger function with correct schema
    const fixTriggerSQL = `
-- Fix Database Trigger for Correct Schema
CREATE OR REPLACE FUNCTION create_role_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Create corresponding record based on user role
    CASE NEW.role
        WHEN 'admin' THEN
            INSERT INTO admins (user_id, admin_level, system_permissions, created_at, updated_at) 
            VALUES (NEW.id, 'content', '{"user_management": false, "content_management": true}', NOW(), NOW());
            
        WHEN 'instructor' THEN
            INSERT INTO instructors (user_id, specialization, teaching_permissions, created_at, updated_at) 
            VALUES (NEW.id, 'General', '{"course_creation": true, "student_management": true}', NOW(), NOW());
            
        -- SKIP TRAINEE - Let registration endpoint handle it with SRN
        WHEN 'trainee' THEN
            NULL; -- Do nothing, endpoint will create trainee record with SRN
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix role change trigger function as well
CREATE OR REPLACE FUNCTION handle_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if role has changed
    IF OLD.role != NEW.role THEN
        -- Remove old role record
        CASE OLD.role
            WHEN 'admin' THEN
                DELETE FROM admins WHERE user_id = OLD.id;
            WHEN 'instructor' THEN
                DELETE FROM instructors WHERE user_id = OLD.id;
            WHEN 'trainee' THEN
                DELETE FROM trainees WHERE user_id = OLD.id;
        END CASE;
        
        -- Create new role record
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, system_permissions, created_at, updated_at) 
                VALUES (NEW.id, 'content', '{"user_management": false, "content_management": true}', NOW(), NOW());
            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, teaching_permissions, created_at, updated_at) 
                VALUES (NEW.id, 'General', '{"course_creation": true, "student_management": true}', NOW(), NOW());
            WHEN 'trainee' THEN
                -- Skip trainee auto-creation
                NULL;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`

    // Execute the fix
    await pool.query(fixTriggerSQL)
    
    console.log('✅ Database trigger functions updated successfully!')
    
    // Verify the functions exist
    const result = await pool.query(`
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_name IN ('create_role_record', 'handle_role_change')
      AND routine_schema = 'public'
    `)
    
    console.log('📋 Updated functions:')
    result.rows.forEach(row => {
      console.log(`  - ${row.routine_name} (${row.routine_type})`)
    })
    
    // Test the admins table schema
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'admins'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Admins table schema:')
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing database trigger:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the fix
fixDatabaseTrigger()
