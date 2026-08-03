import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Replace the auto-set createdBy (-> users) with an editable instructor field
  // (-> instructors), matching the `courses` collection pattern.
  // No data conversion needed: created_by_id held user IDs, the new field expects
  // instructor-profile IDs (different entity). All existing rows are NULL.
  await db.execute(sql`
    ALTER TABLE "assignments" DROP CONSTRAINT IF EXISTS "assignments_created_by_id_users_id_fk";
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "assignments_created_by_idx";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" DROP COLUMN IF EXISTS "created_by_id";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" ADD COLUMN IF NOT EXISTS "instructor_id" integer;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "assignments_instructor_idx" ON "assignments" USING btree ("instructor_id");
  `)
  // RESTRICT matches the courses collection to prevent accidental assignment deletion
  await db.execute(sql`
    ALTER TABLE "assignments" ADD CONSTRAINT "assignments_instructor_id_instructors_id_fk"
    FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "assignments" DROP CONSTRAINT IF EXISTS "assignments_instructor_id_instructors_id_fk";
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "assignments_instructor_idx";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" DROP COLUMN IF EXISTS "instructor_id";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" ADD COLUMN IF NOT EXISTS "created_by_id" integer;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "assignments_created_by_idx" ON "assignments" USING btree ("created_by_id");
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_id_users_id_fk"
    FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `)
}
