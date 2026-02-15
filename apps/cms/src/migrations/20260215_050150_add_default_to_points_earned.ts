import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    SET LOCAL statement_timeout = '300s';
    ALTER TABLE "submission_answers" ALTER COLUMN "points_earned" SET DEFAULT 0;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "submission_answers" ALTER COLUMN "points_earned" DROP DEFAULT;
  `)
}
