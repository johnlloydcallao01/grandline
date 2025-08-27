-- Fix Database Trigger for Trainee Registration
-- This resolves the conflict where the trigger creates trainee records without SRN

-- Updated function to skip trainee auto-creation
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
            
        -- SKIP TRAINEE - Let registration endpoint handle it with SRN
        WHEN 'trainee' THEN
            NULL; -- Do nothing, endpoint will create trainee record with SRN
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger remains the same, only the function behavior changed
-- No need to recreate the trigger since we're just updating the function
