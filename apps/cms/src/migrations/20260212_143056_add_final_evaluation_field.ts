import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_course_enrollments_final_evaluation') THEN
       CREATE TYPE "public"."enum_course_enrollments_final_evaluation" AS ENUM('passed', 'failed');
     END IF;
   END $$;

   ALTER TABLE "course_enrollments" ADD COLUMN IF NOT EXISTS "final_evaluation" "enum_course_enrollments_final_evaluation";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_enrollments" DROP COLUMN IF EXISTS "final_evaluation";
   DROP TYPE IF EXISTS "public"."enum_course_enrollments_final_evaluation";
  `)
}
