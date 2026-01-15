import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS estimated_duration_unit VARCHAR;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE courses
    DROP COLUMN IF EXISTS estimated_duration_unit;
  `)
}

