import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DATA TYPE text;
  ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DEFAULT 'standard'::text;
  UPDATE "trainees" SET "current_level" = 'standard' WHERE "current_level" = 'beginner';
  DROP TYPE "public"."enum_trainees_current_level";
  CREATE TYPE "public"."enum_trainees_current_level" AS ENUM('standard', 'intermediate', 'advanced');
  ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DEFAULT 'standard'::"public"."enum_trainees_current_level";
  ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DATA TYPE "public"."enum_trainees_current_level" USING "current_level"::"public"."enum_trainees_current_level";
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DATA TYPE text;
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DEFAULT 'standard'::text;
  UPDATE "courses" SET "difficulty_level" = 'standard' WHERE "difficulty_level" = 'beginner';
  DROP TYPE "public"."enum_courses_difficulty_level";
  CREATE TYPE "public"."enum_courses_difficulty_level" AS ENUM('standard', 'intermediate', 'advanced');
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DEFAULT 'standard'::"public"."enum_courses_difficulty_level";
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DATA TYPE "public"."enum_courses_difficulty_level" USING "difficulty_level"::"public"."enum_courses_difficulty_level";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DATA TYPE text;
  ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DEFAULT 'beginner'::text;
  UPDATE "trainees" SET "current_level" = 'beginner' WHERE "current_level" = 'standard';
  DROP TYPE "public"."enum_trainees_current_level";
  CREATE TYPE "public"."enum_trainees_current_level" AS ENUM('beginner', 'intermediate', 'advanced');
  ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DEFAULT 'beginner'::"public"."enum_trainees_current_level";
  ALTER TABLE "trainees" ALTER COLUMN "current_level" SET DATA TYPE "public"."enum_trainees_current_level" USING "current_level"::"public"."enum_trainees_current_level";
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DATA TYPE text;
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DEFAULT 'beginner'::text;
  UPDATE "courses" SET "difficulty_level" = 'beginner' WHERE "difficulty_level" = 'standard';
  DROP TYPE "public"."enum_courses_difficulty_level";
  CREATE TYPE "public"."enum_courses_difficulty_level" AS ENUM('beginner', 'intermediate', 'advanced');
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DEFAULT 'beginner'::"public"."enum_courses_difficulty_level";
  ALTER TABLE "courses" ALTER COLUMN "difficulty_level" SET DATA TYPE "public"."enum_courses_difficulty_level" USING "difficulty_level"::"public"."enum_courses_difficulty_level";`)
}
