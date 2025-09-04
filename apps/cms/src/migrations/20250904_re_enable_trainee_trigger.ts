import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Type definitions for query results
interface UserInfo {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
}

/**
 * RE-ENABLE TRAINEE TRIGGER MIGRATION
 * 
 * This migration fixes the issue where trainee records were not being created
 * when users with role 'trainee' were added. The trainee logic was previously
 * disabled in the database triggers, causing the disconnect between users and trainees tables.
 * 
 * This migration:
 * 1. Re-enables trainee record creation in database triggers
 * 2. Creates missing trainee records for existing trainee users
 * 3. Ensures consistency between users and trainees tables
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🔧 Re-enabling trainee trigger...')

  try {
    // Step 1: Update create_role_record function to include trainee logic
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
                  
              WHEN 'trainee' THEN
                  -- RE-ENABLED: Create trainee record with auto-generated SRN
                  INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
                  VALUES (
                    NEW.id, 
                    'SRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 
                    'beginner',
                    NOW(),
                    NOW(), 
                    NOW()
                  );
          END CASE;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Step 2: Update handle_role_change function to include trainee logic
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
                      -- RE-ENABLED: Create trainee record with auto-generated SRN
                      INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
                      VALUES (
                        NEW.id, 
                        'SRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 
                        'beginner',
                        NOW(),
                        NOW(), 
                        NOW()
                      );
              END CASE;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Step 3: Create missing trainee records for existing users
    const orphanedTrainees = await db.execute(sql`
      SELECT u.id, u.email, u.first_name, u.last_name
      FROM users u
      LEFT JOIN trainees t ON u.id = t.user_id
      WHERE u.role = 'trainee' AND t.id IS NULL
    `)

    console.log(`📊 Found ${((orphanedTrainees as unknown) as { rows: UserInfo[] }).rows.length} trainee users without trainee records`)

    if (((orphanedTrainees as unknown) as { rows: UserInfo[] }).rows.length > 0) {
      console.log('🔧 Creating missing trainee records...')

      for (const user of ((orphanedTrainees as unknown) as { rows: UserInfo[] }).rows) {
        const srn = `SRN-${user.id}-${new Date().getFullYear()}`
        
        await db.execute(sql`
          INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
          VALUES (${user.id}, ${srn}, 'beginner', NOW(), NOW(), NOW())
        `)
        
        console.log(`  ✅ Created trainee record for: ${user.email} (SRN: ${srn})`)
      }
    }

    console.log('\n🎉 TRAINEE TRIGGER RE-ENABLED SUCCESSFULLY!')
    console.log('✅ Database triggers now properly handle trainee role')
    console.log('✅ All existing trainee users now have trainee records')
    console.log('💡 New users with role "trainee" will automatically get trainee records')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    // client.release() - not needed in PayloadCMS migrations
  }
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting trainee trigger re-enablement...')
  
  try {
    // Revert to the disabled state (though this is not recommended)
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
                  
              WHEN 'trainee' THEN
                  -- DISABLED: Skip trainee auto-creation
                  NULL;
          END CASE;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    console.log('⚠️  Trainee trigger disabled again (not recommended)')
    console.log('💡 Note: Existing trainee records were not removed')
    
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    throw error
  }
}
