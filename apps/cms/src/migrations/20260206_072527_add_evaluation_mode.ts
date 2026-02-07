import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_evaluation_mode" AS ENUM('lessons', 'exam', 'quizzes', 'lessons_exam', 'lessons_quizzes', 'quizzes_exam', 'lessons_quizzes_exam');
  ALTER TABLE "courses" ADD COLUMN "evaluation_mode" "enum_courses_evaluation_mode" DEFAULT 'lessons_exam';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN "evaluation_mode";
  DROP TYPE "public"."enum_courses_evaluation_mode";`)
}
