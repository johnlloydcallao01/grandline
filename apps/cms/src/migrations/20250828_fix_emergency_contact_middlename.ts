import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Make middleName optional in emergency_contacts table
  await db.execute(sql`
    -- Make middle_name nullable in emergency_contacts table
    ALTER TABLE "emergency_contacts" 
    ALTER COLUMN "middle_name" DROP NOT NULL;
  `)
  
  console.log('✅ Made emergency_contacts.middle_name optional')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Revert middleName to required (but first set empty values to 'N/A')
  await db.execute(sql`
    -- Set empty middle_name values to 'N/A' before making it required
    UPDATE "emergency_contacts" 
    SET "middle_name" = 'N/A' 
    WHERE "middle_name" IS NULL OR "middle_name" = '';
    
    -- Make middle_name required again
    ALTER TABLE "emergency_contacts" 
    ALTER COLUMN "middle_name" SET NOT NULL;
  `)
  
  console.log('✅ Reverted emergency_contacts.middle_name to required')
}
