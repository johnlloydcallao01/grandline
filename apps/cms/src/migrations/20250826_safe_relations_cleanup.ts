import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Safe cleanup of payload_locked_documents_rels table
  await db.execute(sql`
    -- First, backup any existing data (optional - for safety)
    CREATE TABLE IF NOT EXISTS payload_locked_documents_rels_backup AS 
    SELECT * FROM payload_locked_documents_rels 
    WHERE services_id IS NOT NULL OR user_relationships_id IS NOT NULL;
    
    -- Add emergency_contacts_id column if it doesn't exist
    ALTER TABLE payload_locked_documents_rels 
    ADD COLUMN IF NOT EXISTS emergency_contacts_id INTEGER;
    
    -- Clean up orphaned relations for removed collections
    DELETE FROM payload_locked_documents_rels 
    WHERE services_id IS NOT NULL OR user_relationships_id IS NOT NULL;
    
    -- Drop the old foreign key columns safely
    ALTER TABLE payload_locked_documents_rels 
    DROP COLUMN IF EXISTS services_id;
    
    ALTER TABLE payload_locked_documents_rels 
    DROP COLUMN IF EXISTS user_relationships_id;
    
    -- Add foreign key constraint for emergency_contacts_id
    ALTER TABLE payload_locked_documents_rels 
    ADD CONSTRAINT payload_locked_documents_rels_emergency_contacts_fk 
    FOREIGN KEY (emergency_contacts_id) REFERENCES emergency_contacts(id) ON DELETE CASCADE;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Rollback the changes
  await db.execute(sql`
    -- Remove emergency_contacts_id column and constraint
    ALTER TABLE payload_locked_documents_rels 
    DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_emergency_contacts_fk;
    
    ALTER TABLE payload_locked_documents_rels 
    DROP COLUMN IF EXISTS emergency_contacts_id;
    
    -- Restore old columns (basic structure)
    ALTER TABLE payload_locked_documents_rels 
    ADD COLUMN IF NOT EXISTS services_id INTEGER;
    
    ALTER TABLE payload_locked_documents_rels 
    ADD COLUMN IF NOT EXISTS user_relationships_id INTEGER;
    
    -- Restore data from backup if it exists
    INSERT INTO payload_locked_documents_rels 
    SELECT * FROM payload_locked_documents_rels_backup 
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_locked_documents_rels_backup');
    
    -- Drop backup table
    DROP TABLE IF EXISTS payload_locked_documents_rels_backup;
  `)
}
