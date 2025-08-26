import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Remove services and services_tags tables completely
  await db.execute(sql`
    -- Drop services_tags table first (has foreign key to services)
    DROP TABLE IF EXISTS "services_tags" CASCADE;
    
    -- Drop services table
    DROP TABLE IF EXISTS "services" CASCADE;
    
    -- Drop any related indexes
    DROP INDEX IF EXISTS "services_tags_order_idx";
    DROP INDEX IF EXISTS "services_tags_parent_id_idx";
    DROP INDEX IF EXISTS "services_updated_at_idx";
    DROP INDEX IF EXISTS "services_created_at_idx";
    DROP INDEX IF EXISTS "services_author_id_idx";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Recreate tables if rollback is needed (basic structure)
  await db.execute(sql`
    -- Recreate services table
    CREATE TABLE IF NOT EXISTS "services" (
      "id" SERIAL PRIMARY KEY,
      "title" VARCHAR NOT NULL,
      "description" VARCHAR,
      "author_id" INTEGER,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    -- Recreate services_tags table
    CREATE TABLE IF NOT EXISTS "services_tags" (
      "_order" INTEGER NOT NULL,
      "_parent_id" INTEGER NOT NULL,
      "id" VARCHAR PRIMARY KEY,
      "tag" VARCHAR
    );
    
    -- Recreate indexes
    CREATE INDEX IF NOT EXISTS "services_updated_at_idx" ON "services" ("updated_at");
    CREATE INDEX IF NOT EXISTS "services_created_at_idx" ON "services" ("created_at");
    CREATE INDEX IF NOT EXISTS "services_tags_order_idx" ON "services_tags" ("_order");
    CREATE INDEX IF NOT EXISTS "services_tags_parent_id_idx" ON "services_tags" ("_parent_id");
    
    -- Recreate foreign key constraints
    ALTER TABLE "services_tags" 
    ADD CONSTRAINT "services_tags_parent_id_fk" 
    FOREIGN KEY ("_parent_id") REFERENCES "services"("id") ON DELETE CASCADE;
  `)
}
