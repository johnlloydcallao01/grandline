import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    // Add missing required fields to trainees table for signup process
  await db.execute(sql`
    -- Add SRN (Student Registration Number) - required for trainee signup
    ALTER TABLE "trainees" ADD COLUMN IF NOT EXISTS "srn" VARCHAR;

    -- Add coupon_code - required for marketing during trainee signup
    ALTER TABLE "trainees" ADD COLUMN IF NOT EXISTS "coupon_code" VARCHAR;

    -- Update existing records with temporary SRN values to avoid NULL constraint violation
    UPDATE "trainees" SET "srn" = 'TEMP_SRN_' || "id" WHERE "srn" IS NULL;

    -- Make SRN required and unique
    ALTER TABLE "trainees" ALTER COLUMN "srn" SET NOT NULL;

    -- Add unique constraint on SRN
    ALTER TABLE "trainees" ADD CONSTRAINT "trainees_srn_unique" UNIQUE ("srn");

    -- Add index for better performance
    CREATE INDEX IF NOT EXISTS "trainees_srn_idx" ON "trainees" ("srn");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    // Remove the added fields
  await db.execute(sql`
    -- Drop index
    DROP INDEX IF EXISTS "trainees_srn_idx";

    -- Drop unique constraint
    ALTER TABLE "trainees" DROP CONSTRAINT IF EXISTS "trainees_srn_unique";

    -- Drop columns
    ALTER TABLE "trainees" DROP COLUMN IF EXISTS "srn";
    ALTER TABLE "trainees" DROP COLUMN IF EXISTS "coupon_code";
  `)
}
