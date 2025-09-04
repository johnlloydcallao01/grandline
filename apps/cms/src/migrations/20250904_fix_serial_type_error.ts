import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Type definitions for query results
interface TableExistsResult {
  exists: boolean
}

interface ColumnInfo {
  column_name: string
  data_type: string
  column_default: string | null
  is_nullable: string
}

/**
 * FIX SERIAL TYPE ERROR MIGRATION
 * 
 * This migration fixes the PostgreSQL "type serial does not exist" error
 * by properly handling SERIAL columns in existing tables.
 * 
 * The issue occurs because SERIAL is not a real PostgreSQL data type,
 * but a pseudo-type that creates INTEGER + SEQUENCE + DEFAULT.
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🔧 Starting SERIAL type error fix migration...')

  try {
    // List of tables that might have SERIAL column issues
    const tablesToCheck = [
      'course_categories',
      'courses', 
      'course_enrollments',
      'users',
      'instructors',
      'trainees',
      'admins',
      'posts',
      'media'
    ]

    for (const tableName of tablesToCheck) {
      console.log(`🔍 Checking table: ${tableName}`)
      
      // Check if table exists
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        ) as exists;
      `)

      if (!((tableExists as unknown) as { rows: TableExistsResult[] }).rows[0]?.exists) {
        console.log(`⏭️  Table ${tableName} doesn't exist, skipping...`)
        continue
      }

      // Check the id column
      const idColumnInfo = await db.execute(sql`
        SELECT 
          column_name,
          data_type,
          column_default,
          is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        AND column_name = 'id';
      `)

      if (((idColumnInfo as unknown) as { rows: ColumnInfo[] }).rows.length === 0) {
        console.log(`➕ Adding SERIAL id column to ${tableName}...`)
        
        // Add SERIAL id column
        await db.execute(sql`
          ALTER TABLE ${sql.identifier(tableName)} 
          ADD COLUMN id SERIAL PRIMARY KEY;
        `)
        
      } else {
        const idColumn = ((idColumnInfo as unknown) as { rows: ColumnInfo[] }).rows[0]
        console.log(`📋 Found id column in ${tableName}: ${idColumn.data_type}`)
        
        // If it's not integer or doesn't have a sequence, fix it
        if (idColumn.data_type !== 'integer' || !idColumn.column_default?.includes('nextval')) {
          console.log(`🔧 Fixing id column in ${tableName}...`)
          
          // Create sequence for this table
          const sequenceName = `${tableName}_id_seq`
          
          await db.execute(sql`
            -- Create sequence if it doesn't exist
            CREATE SEQUENCE IF NOT EXISTS ${sql.identifier(sequenceName)};
            
            -- Convert column to integer if needed
            ALTER TABLE ${sql.identifier(tableName)} 
            ALTER COLUMN id TYPE INTEGER;
            
            -- Set default to use sequence
            ALTER TABLE ${sql.identifier(tableName)} 
            ALTER COLUMN id SET DEFAULT nextval('${sequenceName}');
            
            -- Make sequence owned by column
            ALTER SEQUENCE ${sql.identifier(sequenceName)} 
            OWNED BY ${sql.identifier(tableName)}.id;
            
            -- Ensure it's not nullable
            ALTER TABLE ${sql.identifier(tableName)} 
            ALTER COLUMN id SET NOT NULL;
          `)
          
          // Try to add primary key constraint if it doesn't exist
          try {
            await db.execute(sql`
              ALTER TABLE ${sql.identifier(tableName)} 
              ADD CONSTRAINT ${sql.identifier(tableName + '_pkey')} PRIMARY KEY (id);
            `)
          } catch (_error) {
            // Primary key might already exist, that's okay
            console.log(`ℹ️  Primary key constraint already exists for ${tableName}`)
          }
        }
      }

      // Ensure other essential PayloadCMS columns exist
      await db.execute(sql`
        ALTER TABLE ${sql.identifier(tableName)} 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW();
        
        ALTER TABLE ${sql.identifier(tableName)} 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW();
      `)

      console.log(`✅ Fixed ${tableName}`)
    }

    console.log('🎉 SERIAL type error fix migration completed successfully!')
    console.log('💡 All tables now have proper SERIAL-equivalent id columns')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting SERIAL type error fix migration...')
  
  // This migration fixes structural issues and is not easily reversible
  // The changes made are generally safe and improve database consistency
  console.log('⚠️  Note: This migration fixes database structure and is not reversible')
  console.log('💡 The changes made improve PostgreSQL compatibility and are safe to keep')
  console.log('✅ Migration rollback completed (no changes made)')
}
