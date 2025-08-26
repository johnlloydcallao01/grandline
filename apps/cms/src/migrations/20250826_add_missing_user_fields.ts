import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Add missing required fields to users table for trainee signup
  await db.execute(sql`
    -- Add personal information fields
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "middle_name" VARCHAR;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name_extension" VARCHAR;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationality" VARCHAR;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" TIMESTAMP WITH TIME ZONE;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "place_of_birth" VARCHAR;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "complete_address" VARCHAR;
    
    -- Add gender enum type if not exists
    DO $$ BEGIN
        CREATE TYPE enum_users_gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    -- Add civil status enum type if not exists
    DO $$ BEGIN
        CREATE TYPE enum_users_civil_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    
    -- Add gender and civil status fields
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" enum_users_gender;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "civil_status" enum_users_civil_status;
    
    -- Add unique constraint on username
    CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username") WHERE "username" IS NOT NULL;
    
    -- Add indexes for better performance
    CREATE INDEX IF NOT EXISTS "users_nationality_idx" ON "users" ("nationality");
    CREATE INDEX IF NOT EXISTS "users_birth_date_idx" ON "users" ("birth_date");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Remove the added fields
  await db.execute(sql`
    -- Drop indexes
    DROP INDEX IF EXISTS "users_username_unique";
    DROP INDEX IF EXISTS "users_nationality_idx";
    DROP INDEX IF EXISTS "users_birth_date_idx";
    
    -- Drop columns
    ALTER TABLE "users" DROP COLUMN IF EXISTS "middle_name";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "name_extension";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "username";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "nationality";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "birth_date";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "place_of_birth";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "complete_address";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "gender";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "civil_status";
    
    -- Drop enum types
    DROP TYPE IF EXISTS enum_users_gender;
    DROP TYPE IF EXISTS enum_users_civil_status;
  `)
}
