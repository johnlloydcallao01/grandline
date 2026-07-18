import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_courses_status" ADD VALUE 'archived';
  `)
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  throw new Error('Cannot remove enum value - this migration is not reversible')
}
