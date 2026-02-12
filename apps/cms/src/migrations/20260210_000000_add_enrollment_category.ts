import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const result = await db.execute(sql`
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'enum_support_tickets_category' AND e.enumlabel = 'enrollment'
  `)

  if (result.rows && result.rows.length > 0) {
    // Already exists
    return
  }

  await db.execute(sql`
    ALTER TYPE "public"."enum_support_tickets_category" ADD VALUE 'enrollment';
  `)
}

export async function down({ db: _db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL doesn't support removing enum values directly
  // This migration is not reversible
}
