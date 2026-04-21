import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "assessment_submissions" ADD COLUMN "is_feedback_read" boolean DEFAULT false;
  ALTER TABLE "assignment_submissions" ADD COLUMN "is_feedback_read" boolean DEFAULT false;
  ALTER TABLE "submission_answers" ADD COLUMN "is_feedback_read" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "assessment_submissions" DROP COLUMN "is_feedback_read";
  ALTER TABLE "assignment_submissions" DROP COLUMN "is_feedback_read";
  ALTER TABLE "submission_answers" DROP COLUMN "is_feedback_read";`)
}
