-- Enterprise Database Triggers for Automatic Role Record Creation
-- This ensures data consistency at the database level

-- Function to create role-specific records
CREATE OR REPLACE FUNCTION create_role_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Create corresponding record based on user role
    CASE NEW.role
        WHEN 'admin' THEN
            INSERT INTO admins (user_id, is_active, created_at, updated_at) 
            VALUES (NEW.id, true, NOW(), NOW());
            
        WHEN 'instructor' THEN
            INSERT INTO instructors (user_id, specialization, is_active, created_at, updated_at) 
            VALUES (NEW.id, 'General', true, NOW(), NOW());
            
        WHEN 'trainee' THEN
            INSERT INTO trainees (user_id, is_active, created_at, updated_at) 
            VALUES (NEW.id, true, NOW(), NOW());
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after user insertion
DROP TRIGGER IF EXISTS user_role_trigger ON users;
CREATE TRIGGER user_role_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_role_record();

-- Function to handle role changes (update operations)
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
                INSERT INTO admins (user_id, is_active, created_at, updated_at) 
                VALUES (NEW.id, true, NOW(), NOW());
            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, is_active, created_at, updated_at) 
                VALUES (NEW.id, 'General', true, NOW(), NOW());
            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, is_active, created_at, updated_at) 
                VALUES (NEW.id, true, NOW(), NOW());
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS user_role_change_trigger ON users;
CREATE TRIGGER user_role_change_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_role_change();

-- Function to clean up role records when user is deleted
CREATE OR REPLACE FUNCTION cleanup_role_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove role-specific record
    CASE OLD.role
        WHEN 'admin' THEN
            DELETE FROM admins WHERE user_id = OLD.id;
        WHEN 'instructor' THEN
            DELETE FROM instructors WHERE user_id = OLD.id;
        WHEN 'trainee' THEN
            DELETE FROM trainees WHERE user_id = OLD.id;
    END CASE;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user deletion cleanup
DROP TRIGGER IF EXISTS user_cleanup_trigger ON users;
CREATE TRIGGER user_cleanup_trigger
    BEFORE DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_role_record();
