#!/usr/bin/env node

/**
 * MAINTENANCE: Fix Trainee Trigger
 * 
 * This script re-enables the trainee trigger that creates trainee records
 * when users with role 'trainee' are created or updated.
 * 
 * Use this script if trainee users are not getting trainee records created.
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URI
})

async function fixTraineeTrigger() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 FIXING TRAINEE TRIGGER')
    console.log('🎯 Re-enabling trainee record creation')
    
    // Update trigger functions to include trainee logic
    await client.query(`
      CREATE OR REPLACE FUNCTION create_role_record()
      RETURNS TRIGGER AS $$
      BEGIN
          CASE NEW.role
              WHEN 'admin' THEN
                  INSERT INTO admins (user_id, admin_level, system_permissions, created_at, updated_at)
                  VALUES (NEW.id, 'content', '{"user_management": false, "content_management": true}', NOW(), NOW());
              WHEN 'instructor' THEN
                  INSERT INTO instructors (user_id, specialization, teaching_permissions, created_at, updated_at)
                  VALUES (NEW.id, 'General', '{"course_creation": true, "student_management": true}', NOW(), NOW());
              WHEN 'trainee' THEN
                  INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
                  VALUES (NEW.id, 'SRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW(), NOW());
          END CASE;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
    
    // Fix existing orphaned trainee users
    const orphaned = await client.query(`
      SELECT u.id, u.email FROM users u
      LEFT JOIN trainees t ON u.id = t.user_id
      WHERE u.role = 'trainee' AND t.id IS NULL
    `)
    
    for (const user of orphaned.rows) {
      const srn = `SRN-${user.id}-${new Date().getFullYear()}`
      await client.query(`
        INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
        VALUES ($1, $2, 'beginner', NOW(), NOW(), NOW())
      `, [user.id, srn])
      console.log(`✅ Fixed: ${user.email}`)
    }
    
    console.log('🎉 Trainee trigger fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixTraineeTrigger().catch(console.error)
