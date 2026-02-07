import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_enrollments" DROP COLUMN "completed_lessons";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_enrollments" ADD COLUMN "completed_lessons" jsonb DEFAULT '[]'::jsonb;`)
}
