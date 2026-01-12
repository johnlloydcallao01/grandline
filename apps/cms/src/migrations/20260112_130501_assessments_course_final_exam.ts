import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "assessments" ALTER COLUMN "module_id" DROP NOT NULL;
   ALTER TABLE "assessments" ADD COLUMN "course_id" integer;
   ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX "assessments_course_idx" ON "assessments" USING btree ("course_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "assessments_course_idx";
  ALTER TABLE "assessments" DROP CONSTRAINT IF EXISTS "assessments_course_id_courses_id_fk";
  ALTER TABLE "assessments" DROP COLUMN IF EXISTS "course_id";
  ALTER TABLE "assessments" ALTER COLUMN "module_id" SET NOT NULL;`)
}
