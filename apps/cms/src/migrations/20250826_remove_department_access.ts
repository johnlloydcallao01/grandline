import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Remove unnecessary department access system
  await db.execute(sql`
    -- Drop the admins_department_access table completely
    DROP TABLE IF EXISTS "admins_department_access" CASCADE;
    
    -- Drop any related indexes
    DROP INDEX IF EXISTS "admins_department_access_order_idx";
    DROP INDEX IF EXISTS "admins_department_access_parent_id_idx";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Recreate the table if rollback is needed (basic structure)
  await db.execute(sql`
    -- Recreate admins_department_access table
    CREATE TABLE IF NOT EXISTS "admins_department_access" (
      "_order" INTEGER NOT NULL,
      "_parent_id" INTEGER NOT NULL,
      "id" VARCHAR PRIMARY KEY,
      "department" VARCHAR
    );
    
    -- Recreate indexes
    CREATE INDEX IF NOT EXISTS "admins_department_access_order_idx" ON "admins_department_access" ("_order");
    CREATE INDEX IF NOT EXISTS "admins_department_access_parent_id_idx" ON "admins_department_access" ("_parent_id");
    
    -- Recreate foreign key constraint
    ALTER TABLE "admins_department_access" 
    ADD CONSTRAINT "admins_department_access_parent_id_fk" 
    FOREIGN KEY ("_parent_id") REFERENCES "admins"("id") ON DELETE CASCADE;
  `)
}
