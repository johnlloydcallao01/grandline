import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_modules" DROP CONSTRAINT "course_modules_course_id_courses_id_fk";
  
  DROP INDEX "course_modules_course_idx";
  ALTER TABLE "course_modules" DROP COLUMN "course_id";
  ALTER TABLE "course_modules" DROP COLUMN "order";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_modules" ADD COLUMN "course_id" integer; -- Removed NOT NULL to allow restoration
  ALTER TABLE "course_modules" ADD COLUMN "order" numeric DEFAULT 1;
  ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "course_modules_course_idx" ON "course_modules" USING btree ("course_id");`)
}
