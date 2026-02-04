import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_lessons" DROP COLUMN "order";
  ALTER TABLE "assessments" DROP COLUMN "order";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_lessons" ADD COLUMN "order" numeric DEFAULT 1 NOT NULL;
  ALTER TABLE "assessments" ADD COLUMN "order" numeric DEFAULT 1;`)
}
