import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Update the database trigger to handle the 'service' role
  await db.execute(sql`
    -- Drop existing trigger and function
    DROP TRIGGER IF EXISTS user_role_trigger ON users;
    DROP FUNCTION IF EXISTS create_role_record();

    -- Create updated function that handles 'service' role
    CREATE OR REPLACE FUNCTION create_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at) 
                VALUES (NEW.id, 'content', NOW(), NOW());
                
            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at) 
                VALUES (NEW.id, 'General', NOW(), NOW());
                
            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, srn, current_level, created_at, updated_at) 
                VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());
                
            WHEN 'service' THEN
                -- Service accounts don't need role-specific records
                -- They are used for API key authentication only
                NULL;
        END CASE;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger that fires after user insertion
    CREATE TRIGGER user_role_trigger
        AFTER INSERT ON users
        FOR EACH ROW
        EXECUTE FUNCTION create_role_record();
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Revert to the previous trigger that doesn't handle 'service' role
  await db.execute(sql`
    -- Drop current trigger and function
    DROP TRIGGER IF EXISTS user_role_trigger ON users;
    DROP FUNCTION IF EXISTS create_role_record();

    -- Restore previous function without 'service' role handling
    CREATE OR REPLACE FUNCTION create_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at) 
                VALUES (NEW.id, 'content', NOW(), NOW());
                
            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at) 
                VALUES (NEW.id, 'General', NOW(), NOW());
                
            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, srn, current_level, created_at, updated_at) 
                VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());
        END CASE;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger that fires after user insertion
    CREATE TRIGGER user_role_trigger
        AFTER INSERT ON users
        FOR EACH ROW
        EXECUTE FUNCTION create_role_record();
  `)
}