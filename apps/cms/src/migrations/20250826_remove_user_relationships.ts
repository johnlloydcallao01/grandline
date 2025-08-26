import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Remove user_relationships table - unnecessary for Coursera-style LMS
  await db.execute(sql`
    -- Drop user_relationships table completely
    DROP TABLE IF EXISTS "user_relationships" CASCADE;
    
    -- Drop related enum types
    DROP TYPE IF EXISTS "enum_user_relationships_related_entity_type" CASCADE;
    DROP TYPE IF EXISTS "enum_user_relationships_relationship_type" CASCADE;
    
    -- Drop any related indexes
    DROP INDEX IF EXISTS "user_relationships_user_idx";
    DROP INDEX IF EXISTS "user_relationships_updated_at_idx";
    DROP INDEX IF EXISTS "user_relationships_created_at_idx";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Recreate table if rollback is needed (basic structure)
  await db.execute(sql`
    -- Recreate enum types
    CREATE TYPE "enum_user_relationships_related_entity_type" AS ENUM ('course', 'department', 'project', 'group');
    CREATE TYPE "enum_user_relationships_relationship_type" AS ENUM ('enrolled', 'teaching', 'managing', 'supervising', 'member');
    
    -- Recreate user_relationships table
    CREATE TABLE IF NOT EXISTS "user_relationships" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "related_entity_type" "enum_user_relationships_related_entity_type" NOT NULL,
      "related_entity_id" NUMERIC NOT NULL,
      "relationship_type" "enum_user_relationships_relationship_type" NOT NULL,
      "relationship_data" JSONB,
      "is_active" BOOLEAN DEFAULT true,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    -- Recreate indexes
    CREATE INDEX IF NOT EXISTS "user_relationships_user_idx" ON "user_relationships" ("user_id");
    CREATE INDEX IF NOT EXISTS "user_relationships_updated_at_idx" ON "user_relationships" ("updated_at");
    CREATE INDEX IF NOT EXISTS "user_relationships_created_at_idx" ON "user_relationships" ("created_at");
    
    -- Recreate foreign key constraint
    ALTER TABLE "user_relationships" 
    ADD CONSTRAINT "user_relationships_user_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;
  `)
}
