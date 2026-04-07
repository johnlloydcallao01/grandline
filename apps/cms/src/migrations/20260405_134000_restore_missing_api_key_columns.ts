import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Restore missing columns for users that might have been accidentally dropped
  await db.execute(sql`
    ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean;
    ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "api_key" varchar;
    ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "api_key_index" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "users" DROP COLUMN IF EXISTS "enable_a_p_i_key";
    ALTER TABLE IF EXISTS "users" DROP COLUMN IF EXISTS "api_key";
    ALTER TABLE IF EXISTS "users" DROP COLUMN IF EXISTS "api_key_index";
  `)
}
