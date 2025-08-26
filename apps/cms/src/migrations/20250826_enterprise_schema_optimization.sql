-- Enterprise Schema Optimization Migration
-- This migration implements the semantic field analysis recommendations
-- Moving shared fields to base table and removing duplications

-- ============================================================================
-- PHASE 1: ADD SHARED FIELDS TO USERS TABLE
-- ============================================================================

-- Add bio field to users table (currently only in instructors)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add additional shared fields for complete user profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Add JSONB fields for flexible attributes
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ============================================================================
-- PHASE 2: MIGRATE EXISTING DATA
-- ============================================================================

-- Migrate bio data from instructors to users
UPDATE users 
SET bio = i.bio 
FROM instructors i 
WHERE users.id = i.user_id 
  AND i.bio IS NOT NULL 
  AND i.bio != '';

-- Migrate any role-specific is_active overrides to users table
-- Priority: users.is_active should be the master, but handle conflicts
UPDATE users 
SET is_active = false 
WHERE id IN (
    SELECT user_id FROM admins WHERE is_active = false
    UNION
    SELECT user_id FROM instructors WHERE is_active = false  
    UNION
    SELECT user_id FROM trainees WHERE is_active = false
) AND users.is_active = true;

-- ============================================================================
-- PHASE 3: REMOVE DUPLICATED FIELDS FROM ROLE TABLES
-- ============================================================================

-- Remove is_active from all role tables (now managed in users table)
ALTER TABLE admins DROP COLUMN IF EXISTS is_active;
ALTER TABLE instructors DROP COLUMN IF EXISTS is_active;
ALTER TABLE trainees DROP COLUMN IF EXISTS is_active;

-- Remove bio from instructors (now in users table)
ALTER TABLE instructors DROP COLUMN IF EXISTS bio;

-- ============================================================================
-- PHASE 4: ADD ROLE-SPECIFIC OPTIMIZED FIELDS
-- ============================================================================

-- Enhance admins table with proper enterprise fields
ALTER TABLE admins ADD COLUMN IF NOT EXISTS admin_level TEXT 
    CHECK (admin_level IN ('system', 'department', 'content')) DEFAULT 'content';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS system_permissions JSONB DEFAULT '{}';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS department_access TEXT[] DEFAULT '{}';

-- Enhance instructors table with teaching-specific permissions
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS teaching_permissions JSONB DEFAULT '{}';

-- Enhance trainees table with learning-specific fields
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS current_level TEXT 
    CHECK (current_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS graduation_target_date DATE;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS learning_path TEXT;

-- ============================================================================
-- PHASE 5: CREATE ASSOCIATION TABLES FOR COMPLEX RELATIONSHIPS
-- ============================================================================

-- User certifications table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_authority TEXT,
    issue_date DATE,
    expiry_date DATE,
    verification_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User relationships table (polymorphic relationships)
CREATE TABLE IF NOT EXISTS user_relationships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    related_entity_type TEXT NOT NULL, -- 'course', 'department', 'project'
    related_entity_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL,   -- 'enrolled', 'teaching', 'managing'
    relationship_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User events table for audit trail
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'USER_CREATED', 'ROLE_CHANGED', 'PROFILE_UPDATED'
    event_data JSONB NOT NULL DEFAULT '{}',
    triggered_by INTEGER REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- PHASE 6: CREATE STRATEGIC INDEXES
-- ============================================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users(role, created_at);

-- Role table indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_level ON admins(admin_level);
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_instructors_specialization ON instructors(specialization);
CREATE INDEX IF NOT EXISTS idx_trainees_user_id ON trainees(user_id);
CREATE INDEX IF NOT EXISTS idx_trainees_level ON trainees(current_level);

-- Association table indexes
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_active ON user_certifications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_relationships_user_id ON user_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_polymorphic ON user_relationships(user_id, related_entity_type, relationship_type);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_type_timestamp ON user_events(event_type, timestamp);

-- JSONB indexes for flexible queries
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_admins_permissions ON admins USING GIN (system_permissions);
CREATE INDEX IF NOT EXISTS idx_instructors_permissions ON instructors USING GIN (teaching_permissions);

-- ============================================================================
-- PHASE 7: UPDATE TRIGGERS FOR NEW SCHEMA
-- ============================================================================

-- Update the role creation trigger to work with new schema
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
            
        WHEN 'trainee' THEN
            INSERT INTO trainees (user_id, enrollment_date, current_level, created_at, updated_at) 
            VALUES (NEW.id, CURRENT_DATE, 'beginner', NOW(), NOW());
    END CASE;
    
    -- Log the user creation event
    INSERT INTO user_events (user_id, event_type, event_data, triggered_by, timestamp)
    VALUES (NEW.id, 'USER_CREATED', json_build_object('role', NEW.role, 'email', NEW.email), NEW.id, NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update role change trigger
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
                INSERT INTO trainees (user_id, enrollment_date, current_level, created_at, updated_at) 
                VALUES (NEW.id, CURRENT_DATE, 'beginner', NOW(), NOW());
        END CASE;
        
        -- Log the role change event
        INSERT INTO user_events (user_id, event_type, event_data, triggered_by, timestamp)
        VALUES (NEW.id, 'ROLE_CHANGED', json_build_object('old_role', OLD.role, 'new_role', NEW.role), NEW.id, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
