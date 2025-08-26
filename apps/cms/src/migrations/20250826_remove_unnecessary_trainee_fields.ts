import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Remove unnecessary fields from trainees table
  await db.execute(sql`
    -- Remove learning_path column with CASCADE to drop dependencies
    ALTER TABLE "trainees" DROP COLUMN IF EXISTS "learning_path" CASCADE;

    -- Remove graduation_target_date column with CASCADE to drop dependencies
    ALTER TABLE "trainees" DROP COLUMN IF EXISTS "graduation_target_date" CASCADE;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Add back the removed fields (in case rollback is needed)
  await db.execute(sql`
    -- Add back learning_path column
    ALTER TABLE "trainees" ADD COLUMN IF NOT EXISTS "learning_path" VARCHAR;
    
    -- Add back graduation_target_date column
    ALTER TABLE "trainees" ADD COLUMN IF NOT EXISTS "graduation_target_date" TIMESTAMP WITH TIME ZONE;
  `)
}
