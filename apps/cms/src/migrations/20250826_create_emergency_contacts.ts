import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Create emergency_contacts table for trainee signup
  await db.execute(sql`
    -- Create relationship enum type for emergency contacts
    DO $$ BEGIN
        CREATE TYPE enum_emergency_contacts_relationship AS ENUM ('parent', 'spouse', 'sibling', 'child', 'guardian', 'friend', 'relative', 'other');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    -- Create emergency_contacts table
    CREATE TABLE IF NOT EXISTS "emergency_contacts" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "first_name" VARCHAR NOT NULL,
      "middle_name" VARCHAR NOT NULL,
      "last_name" VARCHAR NOT NULL,
      "contact_number" VARCHAR NOT NULL,
      "relationship" enum_emergency_contacts_relationship NOT NULL,
      "complete_address" VARCHAR NOT NULL,
      "is_primary" BOOLEAN DEFAULT false,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    -- Add indexes for better performance
    CREATE INDEX IF NOT EXISTS "emergency_contacts_user_id_idx" ON "emergency_contacts" ("user_id");
    CREATE INDEX IF NOT EXISTS "emergency_contacts_updated_at_idx" ON "emergency_contacts" ("updated_at");
    CREATE INDEX IF NOT EXISTS "emergency_contacts_created_at_idx" ON "emergency_contacts" ("created_at");
    CREATE INDEX IF NOT EXISTS "emergency_contacts_is_primary_idx" ON "emergency_contacts" ("is_primary");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Remove emergency_contacts table and enum
  await db.execute(sql`
    -- Drop indexes
    DROP INDEX IF EXISTS "emergency_contacts_user_id_idx";
    DROP INDEX IF EXISTS "emergency_contacts_updated_at_idx";
    DROP INDEX IF EXISTS "emergency_contacts_created_at_idx";
    DROP INDEX IF EXISTS "emergency_contacts_is_primary_idx";
    
    -- Drop table
    DROP TABLE IF EXISTS "emergency_contacts";
    
    -- Drop enum type
    DROP TYPE IF EXISTS enum_emergency_contacts_relationship;
  `)
}
