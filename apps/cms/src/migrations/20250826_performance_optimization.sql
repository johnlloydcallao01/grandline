-- Performance Optimization Migration
-- Implements materialized views, strategic indexing, and query functions

-- ============================================================================
-- MATERIALIZED VIEWS FOR FREQUENT QUERIES
-- ============================================================================

-- Complete user profiles with role data (most frequently accessed)
CREATE MATERIALIZED VIEW user_profiles AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.is_active,
    u.bio,
    u.phone,
    u.profile_image_url,
    u.emergency_contact,
    u.preferences,
    u.metadata,
    u.last_login,
    u.created_at,
    u.updated_at,
    
    -- Role-specific data as JSON
    CASE u.role
        WHEN 'admin' THEN 
            json_build_object(
                'admin_level', a.admin_level,
                'system_permissions', a.system_permissions
            )
        WHEN 'instructor' THEN
            json_build_object(
                'specialization', i.specialization,
                'years_experience', i.years_experience,
                'certifications', i.certifications,
                'office_hours', i.office_hours,
                'contact_email', i.contact_email,
                'teaching_permissions', i.teaching_permissions
            )
        WHEN 'trainee' THEN
            json_build_object(
                'enrollment_date', t.enrollment_date,
                'current_level', t.current_level,
                'graduation_target_date', t.graduation_target_date,
                'learning_path', t.learning_path
            )
    END as role_data
    
FROM users u
LEFT JOIN admins a ON u.id = a.user_id AND u.role = 'admin'
LEFT JOIN instructors i ON u.id = i.user_id AND u.role = 'instructor'  
LEFT JOIN trainees t ON u.id = t.user_id AND u.role = 'trainee'
WHERE u.is_active = true;

-- Active instructors with teaching data (for course assignment)
CREATE MATERIALIZED VIEW active_instructors AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.bio,
    u.phone,
    i.specialization,
    i.years_experience,
    i.certifications,
    i.office_hours,
    i.contact_email,
    i.teaching_permissions,
    u.created_at
FROM users u
JOIN instructors i ON u.id = i.user_id
WHERE u.role = 'instructor' AND u.is_active = true;

-- Active trainees with learning progress (for reporting)
CREATE MATERIALIZED VIEW active_trainees AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.bio,
    u.phone,
    t.enrollment_date,
    t.current_level,
    t.graduation_target_date,
    t.learning_path,
    u.created_at,
    -- Calculate days since enrollment
    EXTRACT(DAYS FROM (CURRENT_DATE - t.enrollment_date::date)) as days_enrolled
FROM users u
JOIN trainees t ON u.id = t.user_id
WHERE u.role = 'trainee' AND u.is_active = true;

-- User activity summary (for analytics)
CREATE MATERIALIZED VIEW user_activity_summary AS
SELECT 
    u.id,
    u.email,
    u.role,
    u.last_login,
    COUNT(ue.id) as total_events,
    MAX(ue.timestamp) as last_activity,
    COUNT(CASE WHEN ue.event_type = 'LOGIN_SUCCESS' THEN 1 END) as login_count,
    COUNT(CASE WHEN ue.event_type = 'PROFILE_UPDATED' THEN 1 END) as profile_updates
FROM users u
LEFT JOIN user_events ue ON u.id = ue.user_id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.role, u.last_login;

-- ============================================================================
-- STRATEGIC INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_role_active_created ON users(role, is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_users_email_active_role ON users(email, is_active, role);
CREATE INDEX IF NOT EXISTS idx_users_active_last_login ON users(is_active, last_login);

-- Role table performance indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_level ON admins(user_id, admin_level);
CREATE INDEX IF NOT EXISTS idx_instructors_user_specialization ON instructors(user_id, specialization);
CREATE INDEX IF NOT EXISTS idx_instructors_specialization_active ON instructors(specialization) 
    WHERE user_id IN (SELECT id FROM users WHERE role = 'instructor' AND is_active = true);
CREATE INDEX IF NOT EXISTS idx_trainees_user_level ON trainees(user_id, current_level);
CREATE INDEX IF NOT EXISTS idx_trainees_enrollment_level ON trainees(enrollment_date, current_level);

-- Association table performance indexes
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_active ON user_certifications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_certifications_expiry ON user_certifications(expiry_date) 
    WHERE is_active = true AND expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_relationships_user_type_active ON user_relationships(user_id, related_entity_type, is_active);
CREATE INDEX IF NOT EXISTS idx_user_relationships_entity_relationship ON user_relationships(related_entity_type, related_entity_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_user_events_user_type_timestamp ON user_events(user_id, event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp_type ON user_events(timestamp DESC, event_type);

-- JSONB indexes for flexible queries
CREATE INDEX IF NOT EXISTS idx_users_preferences_gin ON users USING GIN (preferences) WHERE preferences IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_metadata_gin ON users USING GIN (metadata) WHERE metadata IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admins_system_permissions_gin ON admins USING GIN (system_permissions) WHERE system_permissions IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instructors_teaching_permissions_gin ON instructors USING GIN (teaching_permissions) WHERE teaching_permissions IS NOT NULL;

-- Materialized view indexes
CREATE UNIQUE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_user_profiles_role_active ON user_profiles(role, is_active);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

CREATE UNIQUE INDEX idx_active_instructors_id ON active_instructors(id);
CREATE INDEX idx_active_instructors_specialization ON active_instructors(specialization);
CREATE INDEX idx_active_instructors_experience ON active_instructors(years_experience DESC);

CREATE UNIQUE INDEX idx_active_trainees_id ON active_trainees(id);
CREATE INDEX idx_active_trainees_level ON active_trainees(current_level);
CREATE INDEX idx_active_trainees_enrollment ON active_trainees(enrollment_date);
CREATE INDEX idx_active_trainees_days_enrolled ON active_trainees(days_enrolled DESC);

CREATE UNIQUE INDEX idx_user_activity_summary_id ON user_activity_summary(id);
CREATE INDEX idx_user_activity_summary_role ON user_activity_summary(role);
CREATE INDEX idx_user_activity_summary_last_activity ON user_activity_summary(last_activity DESC);

-- ============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Get complete user profile with role data (optimized single query)
CREATE OR REPLACE FUNCTION get_user_profile(user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    profile_data JSON;
BEGIN
    SELECT row_to_json(up) INTO profile_data
    FROM user_profiles up
    WHERE up.id = user_id;
    
    RETURN profile_data;
END;
$$ LANGUAGE plpgsql;

-- Get users by role with pagination and filtering
CREATE OR REPLACE FUNCTION get_users_by_role(
    role_filter TEXT,
    active_only BOOLEAN DEFAULT true,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    role_data JSON,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.first_name,
        up.last_name,
        up.role,
        up.role_data,
        up.created_at
    FROM user_profiles up
    WHERE 
        (role_filter IS NULL OR up.role = role_filter)
        AND (NOT active_only OR up.is_active = true)
    ORDER BY up.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Search users with full-text search capabilities
CREATE OR REPLACE FUNCTION search_users(
    search_term TEXT,
    role_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    id INTEGER,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.first_name,
        up.last_name,
        up.role,
        -- Simple relevance scoring
        CASE 
            WHEN up.email ILIKE '%' || search_term || '%' THEN 1.0
            WHEN up.first_name ILIKE '%' || search_term || '%' THEN 0.8
            WHEN up.last_name ILIKE '%' || search_term || '%' THEN 0.8
            WHEN up.bio ILIKE '%' || search_term || '%' THEN 0.6
            ELSE 0.4
        END as relevance
    FROM user_profiles up
    WHERE 
        (up.email ILIKE '%' || search_term || '%' OR
         up.first_name ILIKE '%' || search_term || '%' OR
         up.last_name ILIKE '%' || search_term || '%' OR
         up.bio ILIKE '%' || search_term || '%')
        AND (role_filter IS NULL OR up.role = role_filter)
        AND up.is_active = true
    ORDER BY relevance DESC, up.first_name, up.last_name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get user statistics by role
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_users', COUNT(*),
        'active_users', COUNT(*) FILTER (WHERE is_active = true),
        'by_role', json_object_agg(role, role_count)
    ) INTO stats
    FROM (
        SELECT 
            role,
            COUNT(*) as role_count,
            bool_and(is_active) as is_active
        FROM user_profiles
        GROUP BY role
    ) role_stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MATERIALIZED VIEW REFRESH FUNCTIONS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_user_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_profiles;
    REFRESH MATERIALIZED VIEW CONCURRENTLY active_instructors;
    REFRESH MATERIALIZED VIEW CONCURRENTLY active_trainees;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh materialized views on user changes
CREATE OR REPLACE FUNCTION trigger_refresh_user_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh views asynchronously (in production, use a job queue)
    PERFORM refresh_user_materialized_views();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic refresh (use sparingly in production)
-- DROP TRIGGER IF EXISTS refresh_views_on_user_change ON users;
-- CREATE TRIGGER refresh_views_on_user_change
--     AFTER INSERT OR UPDATE OR DELETE ON users
--     FOR EACH STATEMENT
--     EXECUTE FUNCTION trigger_refresh_user_views();
