import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🚀 Creating performance optimization views and indexes...')
  
  // Create materialized view for complete user profiles
  await db.execute(sql`
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
    WHERE u.is_active = true
  `)
  
  // Create indexes on materialized view
  await db.execute(sql`
    CREATE UNIQUE INDEX idx_user_profiles_id ON user_profiles(id)
  `)
  
  await db.execute(sql`
    CREATE INDEX idx_user_profiles_role_active ON user_profiles(role, is_active)
  `)
  
  await db.execute(sql`
    CREATE INDEX idx_user_profiles_email ON user_profiles(email)
  `)
  
  // Create strategic indexes for performance
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_users_role_active_created ON users(role, is_active, created_at)
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_users_email_active_role ON users(email, is_active, role)
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_admins_user_level ON admins(user_id, admin_level)
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_instructors_user_specialization ON instructors(user_id, specialization)
  `)
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_trainees_user_level ON trainees(user_id, current_level)
  `)
  
  // Create query optimization function
  await db.execute(sql`
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
    $$ LANGUAGE plpgsql
  `)
  
  // Create user statistics function
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION get_user_statistics()
    RETURNS JSON AS $$
    DECLARE
        stats JSON;
    BEGIN
        SELECT json_build_object(
            'total_users', COUNT(*),
            'active_users', COUNT(*) FILTER (WHERE is_active = true),
            'admins', COUNT(*) FILTER (WHERE role = 'admin' AND is_active = true),
            'instructors', COUNT(*) FILTER (WHERE role = 'instructor' AND is_active = true),
            'trainees', COUNT(*) FILTER (WHERE role = 'trainee' AND is_active = true)
        ) INTO stats
        FROM users;
        
        RETURN stats;
    END;
    $$ LANGUAGE plpgsql
  `)
  
  // Create materialized view refresh function
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION refresh_user_materialized_views()
    RETURNS VOID AS $$
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY user_profiles;
    END;
    $$ LANGUAGE plpgsql
  `)
  
  console.log('✅ Performance optimization completed successfully!')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Removing performance optimizations...')
  
  // Drop functions
  await db.execute(sql`
    DROP FUNCTION IF EXISTS get_user_profile(INTEGER)
  `)
  
  await db.execute(sql`
    DROP FUNCTION IF EXISTS get_user_statistics()
  `)
  
  await db.execute(sql`
    DROP FUNCTION IF EXISTS refresh_user_materialized_views()
  `)
  
  // Drop materialized view
  await db.execute(sql`
    DROP MATERIALIZED VIEW IF EXISTS user_profiles
  `)
  
  // Drop performance indexes
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_users_role_active_created
  `)
  
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_users_email_active_role
  `)
  
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_admins_user_level
  `)
  
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_instructors_user_specialization
  `)
  
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_trainees_user_level
  `)
  
  console.log('✅ Performance optimizations removed successfully!')
}
