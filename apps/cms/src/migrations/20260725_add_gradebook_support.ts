import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "grade_scales" (
      "id" SERIAL PRIMARY KEY,
      "title" VARCHAR NOT NULL,
      "description" VARCHAR,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "grade_scales_grades" (
      "_order" INTEGER NOT NULL,
      "_parent_id" INTEGER NOT NULL,
      "id" VARCHAR PRIMARY KEY,
      "label" VARCHAR NOT NULL,
      "min_score" NUMERIC NOT NULL,
      "max_score" NUMERIC NOT NULL,
      "gpa_value" NUMERIC,
      "description" VARCHAR
    );

    CREATE INDEX IF NOT EXISTS "grade_scales_updated_at_idx" ON "grade_scales" ("updated_at");
    CREATE INDEX IF NOT EXISTS "grade_scales_created_at_idx" ON "grade_scales" ("created_at");
    CREATE INDEX IF NOT EXISTS "grade_scales_grades_parent_idx" ON "grade_scales_grades" ("_parent_id");

    ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "grade_weight" NUMERIC DEFAULT 1;

    ALTER TABLE "assignments" ADD COLUMN IF NOT EXISTS "grade_weight" NUMERIC DEFAULT 1;

    ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "grade_scale_id" INTEGER;

    CREATE INDEX IF NOT EXISTS "courses_grade_scale_idx" ON "courses" ("grade_scale_id");

    DO $$ BEGIN
      ALTER TABLE "grade_scales_grades" ADD CONSTRAINT "grade_scales_grades_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "grade_scales"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "courses" ADD CONSTRAINT "courses_grade_scale_id_grade_scales_id_fk"
        FOREIGN KEY ("grade_scale_id") REFERENCES "grade_scales"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_grade_scale_id_grade_scales_id_fk";
    ALTER TABLE "grade_scales_grades" DROP CONSTRAINT IF EXISTS "grade_scales_grades_parent_id_fk";

    DROP INDEX IF EXISTS "courses_grade_scale_idx";
    DROP INDEX IF EXISTS "grade_scales_grades_parent_idx";
    DROP INDEX IF EXISTS "grade_scales_created_at_idx";
    DROP INDEX IF EXISTS "grade_scales_updated_at_idx";

    ALTER TABLE "courses" DROP COLUMN IF EXISTS "grade_scale_id";
    ALTER TABLE "assignments" DROP COLUMN IF EXISTS "grade_weight";
    ALTER TABLE "assessments" DROP COLUMN IF EXISTS "grade_weight";

    DROP TABLE IF EXISTS "grade_scales_grades";
    DROP TABLE IF EXISTS "grade_scales";
  `)
}
