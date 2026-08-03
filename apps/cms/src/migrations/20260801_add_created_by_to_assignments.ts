import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Add createdBy single relationship to users (column, FK, and index).
  // Follows Payload's naming convention: field createdBy -> column created_by
  await db.execute(sql`
    ALTER TABLE "assignments" ADD COLUMN IF NOT EXISTS "created_by" integer;
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_users_id_fk"
    FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "assignments_created_by_idx" ON "assignments" USING btree ("created_by");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "assignments" DROP CONSTRAINT IF EXISTS "assignments_created_by_users_id_fk";
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "assignments_created_by_idx";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" DROP COLUMN IF EXISTS "created_by";
  `)
}
