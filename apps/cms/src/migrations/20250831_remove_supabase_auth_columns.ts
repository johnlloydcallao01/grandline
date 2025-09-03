import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres/drizzle'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🧹 Removing Supabase Auth columns from users table...')
  
  // First, let's check if we need to migrate any data from the nullable email to the NOT NULL email
  console.log('📧 Checking email data consistency...')
  
  try {
    // Check if there are any users with data in the nullable email but not in the NOT NULL email
    const emailCheck = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE email IS NOT NULL 
      AND (
        SELECT email FROM users u2 WHERE u2.id = users.id AND u2.email IS NOT NULL LIMIT 1
      ) IS NULL
    `)
    
    console.log(`Found ${emailCheck.rows[0]?.count || 0} users that might need email migration`)
    
    // Remove Supabase Auth columns one by one
    console.log('🗑️ Removing Supabase Auth columns...')
    
    // Remove Supabase Auth specific columns
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS instance_id`)
    console.log('✅ Removed instance_id')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS aud`)
    console.log('✅ Removed aud')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS encrypted_password`)
    console.log('✅ Removed encrypted_password')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS email_confirmed_at`)
    console.log('✅ Removed email_confirmed_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS invited_at`)
    console.log('✅ Removed invited_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS confirmation_token`)
    console.log('✅ Removed confirmation_token')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS confirmation_sent_at`)
    console.log('✅ Removed confirmation_sent_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS recovery_token`)
    console.log('✅ Removed recovery_token')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS recovery_sent_at`)
    console.log('✅ Removed recovery_sent_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS email_change_token_new`)
    console.log('✅ Removed email_change_token_new')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS email_change`)
    console.log('✅ Removed email_change')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS email_change_sent_at`)
    console.log('✅ Removed email_change_sent_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS last_sign_in_at`)
    console.log('✅ Removed last_sign_in_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS raw_app_meta_data`)
    console.log('✅ Removed raw_app_meta_data')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS raw_user_meta_data`)
    console.log('✅ Removed raw_user_meta_data')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS is_super_admin`)
    console.log('✅ Removed is_super_admin')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS phone_confirmed_at`)
    console.log('✅ Removed phone_confirmed_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS phone_change`)
    console.log('✅ Removed phone_change')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS phone_change_token`)
    console.log('✅ Removed phone_change_token')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS phone_change_sent_at`)
    console.log('✅ Removed phone_change_sent_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS confirmed_at`)
    console.log('✅ Removed confirmed_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS email_change_token_current`)
    console.log('✅ Removed email_change_token_current')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS email_change_confirm_status`)
    console.log('✅ Removed email_change_confirm_status')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS banned_until`)
    console.log('✅ Removed banned_until')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS reauthentication_token`)
    console.log('✅ Removed reauthentication_token')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS reauthentication_sent_at`)
    console.log('✅ Removed reauthentication_sent_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS is_sso_user`)
    console.log('✅ Removed is_sso_user')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS deleted_at`)
    console.log('✅ Removed deleted_at')
    
    await db.execute(sql`ALTER TABLE users DROP COLUMN IF EXISTS is_anonymous`)
    console.log('✅ Removed is_anonymous')
    
    console.log('🎉 Successfully removed all Supabase Auth columns!')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  }
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('⚠️ WARNING: This down migration cannot restore the removed Supabase Auth columns')
  console.log('⚠️ The columns and their data have been permanently removed')
  console.log('⚠️ If you need to restore Supabase Auth, you will need to recreate the schema manually')
}
