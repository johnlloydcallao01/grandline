import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * SAFE MIGRATION: Fix Database Trigger Schema Mismatch
 * 
 * Problem: Database triggers are trying to insert into non-existent columns
 * Solution: Update trigger functions to match current schema
 * 
 * This migration follows the safe practices outlined in:
 * apps/cms/docs/database-schema-modifications.md
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🔧 Fixing database trigger schema mismatch...')
  
  // Update the create_role_record function to use correct schema
  await db.execute(sql`
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
  `)

  // Update the handle_role_change function to use correct schema
  await db.execute(sql`
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
  `)

  console.log('✅ Database trigger functions updated safely via PayloadCMS migration')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting trigger schema fix...')
  
  // Note: This rollback restores the old (broken) trigger functions
  // Only use this if you need to rollback for testing purposes
  
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION create_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Old version with incorrect schema (for rollback only)
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, system_permissions, created_at, updated_at) 
                VALUES (NEW.id, 'content', '{}', NOW(), NOW());
            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at) 
                VALUES (NEW.id, 'General', NOW(), NOW());
            WHEN 'trainee' THEN
                NULL;
        END CASE;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)

  console.log('⚠️ Reverted to previous trigger functions (may still have schema issues)')
}
