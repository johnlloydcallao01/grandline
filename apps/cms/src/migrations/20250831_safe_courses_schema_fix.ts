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

interface CountResult {
  count: string
}

/**
 * SAFE COURSES SCHEMA MIGRATION
 * 
 * This migration safely handles the courses table schema conflict by:
 * 1. Backing up existing data if courses table exists
 * 2. Safely removing conflicting columns
 * 3. Allowing PayloadCMS to create the proper schema
 * 
 * Following the database-modification-guide.md safety rules
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🛡️ Starting SAFE courses schema migration...')

  try {
    // Step 1: Check if courses table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'courses'
      ) as table_exists;
    `)

    const tableExists = ((tableCheck as unknown) as { rows: TableExistsResult[] }).rows[0]?.table_exists

    if (tableExists) {
      console.log('📋 Courses table found - checking for conflicting columns...')

      // Step 2: Check which conflicting columns exist
      const columnCheck = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
        AND column_name IN ('co_instructors', 'is_free', 'certificate_template_id', 'enrollment_settings');
      `)

      if (((columnCheck as unknown) as { rows: ColumnInfo[] }).rows.length > 0) {
        console.log('⚠️  Found conflicting columns:', ((columnCheck as unknown) as { rows: ColumnInfo[] }).rows.map((row: ColumnInfo) => row.column_name))

        // Step 3: Create backup table with existing data (SAFETY FIRST)
        console.log('💾 Creating backup of existing courses data...')
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS courses_backup_${Date.now().toString()} AS 
          SELECT * FROM courses;
        `)

        // Step 4: Check if there's any actual data to preserve
        const dataCheck = await db.execute(sql`
          SELECT COUNT(*) as count FROM courses;
        `)

        const recordCount = parseInt(((dataCheck as unknown) as { rows: CountResult[] }).rows[0]?.count || '0')
        console.log(`📊 Found ${recordCount} existing course records`)

        if (recordCount > 0) {
          console.log('⚠️  WARNING: Existing course data detected!')
          console.log('💡 Data has been backed up to courses_backup_[timestamp] table')
          console.log('🔄 You may need to manually migrate this data to the new schema')
        }

        // Step 5: Safely remove conflicting columns one by one
        for (const row of ((columnCheck as unknown) as { rows: ColumnInfo[] }).rows) {
          const columnName = row.column_name
          console.log(`🗑️  Removing conflicting column: ${columnName}`)
          
          await db.execute(sql`
            ALTER TABLE courses DROP COLUMN IF EXISTS ${sql.identifier(columnName)};
          `)
        }

        console.log('✅ Conflicting columns removed safely')
      } else {
        console.log('✅ No conflicting columns found - table is compatible')
      }

      // Step 6: Ensure required columns exist for PayloadCMS
      console.log('🔧 Ensuring PayloadCMS required columns exist...')
      
      // Check if id column exists and handle it properly
      const idColumnCheck = await db.execute(sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'courses'
        AND column_name = 'id';
      `)

      if (((idColumnCheck as unknown) as { rows: ColumnInfo[] }).rows.length === 0) {
        // No id column exists, create it as SERIAL
        await db.execute(sql`
          ALTER TABLE courses ADD COLUMN id SERIAL PRIMARY KEY;
        `)
      } else {
        // id column exists, ensure it's a primary key and has a sequence
        const idColumn = ((idColumnCheck as unknown) as { rows: ColumnInfo[] }).rows[0]
        console.log(`📋 Found existing id column: ${idColumn.data_type}`)

        if (idColumn.data_type !== 'integer') {
          console.log('🔧 Converting id column to integer with sequence...')

          // Create sequence if it doesn't exist
          await db.execute(sql`
            CREATE SEQUENCE IF NOT EXISTS courses_id_seq;
          `)

          // Convert column to integer and set sequence
          await db.execute(sql`
            ALTER TABLE courses ALTER COLUMN id TYPE INTEGER;
            ALTER TABLE courses ALTER COLUMN id SET DEFAULT nextval('courses_id_seq');
            ALTER SEQUENCE courses_id_seq OWNED BY courses.id;
          `)
        }

        // Ensure it's a primary key
        await db.execute(sql`
          ALTER TABLE courses ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
        `)
      }

      await db.execute(sql`
        -- Add title column if it doesn't exist
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS title VARCHAR;

        -- Add other essential PayloadCMS columns if they don't exist
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW();
      `)

    } else {
      console.log('✅ No existing courses table - PayloadCMS will create it fresh')
    }

    console.log('🎉 Safe courses schema migration completed successfully!')
    console.log('💡 Next step: Run "pnpm payload migrate" to apply PayloadCMS schema')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting safe courses schema migration...')
  
  // This migration is designed to be safe and mostly irreversible
  // The backup tables remain for data recovery if needed
  console.log('⚠️  Note: This migration created backups but cannot fully revert schema changes')
  console.log('💡 Check for courses_backup_* tables if you need to recover data')
  console.log('✅ Migration rollback completed')
}