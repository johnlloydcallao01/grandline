import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Fix the database triggers to match actual table structures
  await db.execute(sql`
    -- Drop existing triggers and functions
    DROP TRIGGER IF EXISTS user_role_trigger ON users;
    DROP TRIGGER IF EXISTS user_role_change_trigger ON users;
    DROP FUNCTION IF EXISTS create_role_record();
    DROP FUNCTION IF EXISTS handle_role_change();

    -- Create corrected function to create role-specific records
    CREATE OR REPLACE FUNCTION create_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at) 
                VALUES (NEW.id, 'super_admin', NOW(), NOW());
                
            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at) 
                VALUES (NEW.id, 'General', NOW(), NOW());
                
            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, srn, created_at, updated_at) 
                VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), NOW(), NOW());
        END CASE;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger that fires after user insertion
    CREATE TRIGGER user_role_trigger
        AFTER INSERT ON users
        FOR EACH ROW
        EXECUTE FUNCTION create_role_record();

    -- Create corrected function to handle role changes
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
                    INSERT INTO admins (user_id, admin_level, created_at, updated_at) 
                    VALUES (NEW.id, 'super_admin', NOW(), NOW());
                WHEN 'instructor' THEN
                    INSERT INTO instructors (user_id, specialization, created_at, updated_at) 
                    VALUES (NEW.id, 'General', NOW(), NOW());
                WHEN 'trainee' THEN
                    INSERT INTO trainees (user_id, srn, created_at, updated_at) 
                    VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), NOW(), NOW());
            END CASE;
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for role changes
    CREATE TRIGGER user_role_change_trigger
        AFTER UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION handle_role_change();
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Restore original (broken) triggers if needed for rollback
  await db.execute(sql`
    -- Drop corrected triggers and functions
    DROP TRIGGER IF EXISTS user_role_trigger ON users;
    DROP TRIGGER IF EXISTS user_role_change_trigger ON users;
    DROP FUNCTION IF EXISTS create_role_record();
    DROP FUNCTION IF EXISTS handle_role_change();
  `)
}
