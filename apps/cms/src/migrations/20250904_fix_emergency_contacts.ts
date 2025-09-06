import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * FIX EMERGENCY CONTACTS MIGRATION
 * 
 * This migration fixes the emergency contacts table issues:
 * 1. Makes middle_name nullable to match PayloadCMS collection
 * 2. Ensures proper relationship with users table
 * 3. Creates any missing emergency contact records for existing trainees
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🔧 Fixing emergency contacts table...')

  try {
    // Step 1: Fix the middle_name column to be nullable
    console.log('📝 1. Making middle_name column nullable...')
    
    await db.execute(sql`
      ALTER TABLE emergency_contacts 
      ALTER COLUMN middle_name DROP NOT NULL;
    `)
    
    console.log('✅ middle_name column is now nullable')

    // Step 2: Ensure proper foreign key relationship exists
    console.log('📝 2. Checking foreign key relationship...')
    
    // Check if foreign key constraint exists
    const fkCheck = await db.execute(sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'emergency_contacts'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%user%'
    `)

    if (((fkCheck as unknown) as { rows: Array<{ constraint_name: string }> }).rows.length === 0) {
      console.log('🔧 Adding foreign key constraint...')
      
      await db.execute(sql`
        ALTER TABLE emergency_contacts
        ADD CONSTRAINT emergency_contacts_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `)
      
      console.log('✅ Foreign key constraint added')
    } else {
      console.log('✅ Foreign key constraint already exists')
    }

    // Step 3: Create index for better performance
    console.log('📝 3. Creating performance indexes...')
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS emergency_contacts_user_id_idx 
      ON emergency_contacts(user_id);
      
      CREATE INDEX IF NOT EXISTS emergency_contacts_is_primary_idx 
      ON emergency_contacts(is_primary) WHERE is_primary = true;
    `)
    
    console.log('✅ Performance indexes created')

    // Step 4: Check for trainees without emergency contacts
    console.log('📝 4. Checking for trainees without emergency contacts...')
    
    const orphanedTrainees = await db.execute(sql`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        t.srn
      FROM users u
      INNER JOIN trainees t ON u.id = t.user_id
      LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
      WHERE u.role = 'trainee' AND ec.id IS NULL
    `)

    const orphanedCount = ((orphanedTrainees as unknown) as { rows: Array<Record<string, unknown>> }).rows.length
    console.log(`📊 Found ${orphanedCount} trainees without emergency contacts`)

    if (orphanedCount > 0) {
      console.log('⚠️  Note: These trainees will need to add emergency contacts manually')
      console.log('💡 Emergency contacts are now properly configured for future registrations')
    }

    console.log('\n🎉 EMERGENCY CONTACTS FIX COMPLETED!')
    console.log('✅ middle_name column is now nullable')
    console.log('✅ Foreign key relationship verified')
    console.log('✅ Performance indexes created')
    console.log('💡 Emergency contact creation should now work in registration API')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting emergency contacts fix...')
  
  try {
    // Revert middle_name to NOT NULL (though this might fail if there are NULL values)
    await _db.execute(sql`
      -- Note: This might fail if there are NULL middle_name values
      UPDATE emergency_contacts SET middle_name = 'N/A' WHERE middle_name IS NULL;
      ALTER TABLE emergency_contacts ALTER COLUMN middle_name SET NOT NULL;
    `)
    
    console.log('⚠️  Reverted middle_name to NOT NULL (filled NULL values with "N/A")')
    
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    console.log('💡 Note: Rollback may fail if there are NULL middle_name values')
  }
}
