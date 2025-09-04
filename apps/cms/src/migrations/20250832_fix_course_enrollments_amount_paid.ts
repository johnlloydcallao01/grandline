import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Type definitions for query results
interface TableExistsResult {
  table_exists: boolean
}

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

/**
 * SAFE COURSE ENROLLMENTS SCHEMA MIGRATION
 * 
 * This migration safely handles the course_enrollments table schema conflict by:
 * 1. Checking if the table exists
 * 2. Creating a backup of existing data
 * 3. Safely handling the amount_paid column conflict
 * 4. Preserving data from enrollment_metadata.amount_paid
 * 
 * Following the database-modification-guide.md safety rules
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🛡️ Starting SAFE course_enrollments schema migration...')

  try {
    // Step 1: Check if course_enrollments table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_enrollments'
      ) as table_exists;
    `)

    const tableExists = ((tableCheck as unknown) as { rows: TableExistsResult[] }).rows[0]?.table_exists

    if (tableExists) {
      console.log('📋 Course enrollments table found - checking for schema conflicts...')

      // Step 2: Check if amount_paid column exists
      const amountPaidColumnCheck = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'course_enrollments'
        AND column_name = 'amount_paid';
      `)

      // Step 3: Check if metadata column exists and contains amount_paid
      const metadataColumnCheck = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'course_enrollments'
        AND column_name = 'metadata';
      `)

      // Create backup table with existing data (SAFETY FIRST)
      console.log('💾 Creating backup of existing course_enrollments data...')
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS course_enrollments_backup_${Date.now().toString()} AS 
        SELECT * FROM course_enrollments;
      `)

      // Handle the schema conflict
      if (((amountPaidColumnCheck as unknown) as { rows: ColumnInfo[] }).rows.length === 0 && ((metadataColumnCheck as unknown) as { rows: ColumnInfo[] }).rows.length > 0) {
        // Case 1: amount_paid doesn't exist yet but metadata does
        console.log('⚙️ Creating amount_paid column and migrating data from metadata...')
        
        // Add amount_paid column
        await db.execute(sql`
          ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;
        `)

        // Migrate data from metadata.amount_paid to amount_paid column
        await db.execute(sql`
          UPDATE course_enrollments
          SET amount_paid = (metadata->>'amount_paid')::numeric
          WHERE metadata->>'amount_paid' IS NOT NULL;
        `)

        console.log('✅ Successfully created amount_paid column and migrated data')
      } else if (((amountPaidColumnCheck as unknown) as { rows: ColumnInfo[] }).rows.length > 0 && ((metadataColumnCheck as unknown) as { rows: ColumnInfo[] }).rows.length > 0) {
        // Case 2: Both amount_paid column and metadata exist
        console.log('⚙️ Both amount_paid column and metadata exist, ensuring data consistency...')
        
        // Update amount_paid from metadata if amount_paid is NULL but metadata has value
        await db.execute(sql`
          UPDATE course_enrollments
          SET amount_paid = (metadata->>'amount_paid')::numeric
          WHERE amount_paid IS NULL AND metadata->>'amount_paid' IS NOT NULL;
        `)

        // Remove amount_paid from metadata to avoid duplication
        await db.execute(sql`
          UPDATE course_enrollments
          SET metadata = metadata - 'amount_paid'
          WHERE metadata->>'amount_paid' IS NOT NULL;
        `)

        console.log('✅ Successfully consolidated amount_paid data')
      } else if (((amountPaidColumnCheck as unknown) as { rows: ColumnInfo[] }).rows.length > 0) {
        // Case 3: Only amount_paid column exists
        console.log('✅ Schema is already correct with amount_paid column')
      } else {
        // Case 4: Neither exists, create amount_paid column
        console.log('⚙️ Creating amount_paid column...')
        await db.execute(sql`
          ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;
        `)
        console.log('✅ Successfully created amount_paid column')
      }

    } else {
      console.log('✅ No existing course_enrollments table - PayloadCMS will create it fresh')
    }

    console.log('🎉 Safe course_enrollments schema migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting safe course_enrollments schema migration...')
  
  // This migration is designed to be safe and mostly irreversible
  // The backup tables remain for data recovery if needed
  console.log('⚠️ Note: This migration created backups but cannot fully revert schema changes')
  console.log('💡 Check for course_enrollments_backup_* tables if you need to recover data')
  console.log('✅ Migration rollback completed')
}