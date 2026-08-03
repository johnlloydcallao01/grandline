import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Fix: the previous migration created the column as "created_by", but Payload
  // names single-relationship FK columns with a "_id" suffix (e.g. "created_by_id",
  // matching course_lessons.module -> module_id). The admin List query fails because
  // it selects "created_by_id" which does not exist.
  await db.execute(sql`
    ALTER TABLE "assignments" DROP CONSTRAINT IF EXISTS "assignments_created_by_users_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" RENAME COLUMN "created_by" TO "created_by_id";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_id_users_id_fk"
    FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `)
  // The existing index follows the renamed column automatically; keep it explicit.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "assignments_created_by_idx" ON "assignments" USING btree ("created_by_id");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "assignments" DROP CONSTRAINT IF EXISTS "assignments_created_by_id_users_id_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" RENAME COLUMN "created_by_id" TO "created_by";
  `)
  await db.execute(sql`
    ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_users_id_fk"
    FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "assignments_created_by_idx" ON "assignments" USING btree ("created_by");
  `)
}
