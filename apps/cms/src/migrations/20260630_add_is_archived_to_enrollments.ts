import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "course_enrollments"
    ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false NOT NULL;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "course_enrollments"
    DROP COLUMN IF EXISTS "is_archived";
  `)
}
