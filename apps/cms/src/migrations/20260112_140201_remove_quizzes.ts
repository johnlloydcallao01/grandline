import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_quizzes_fk";
   DROP INDEX IF EXISTS "payload_locked_documents_rels_quizzes_id_idx";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "quizzes_id";
   ALTER TABLE "quizzes_items" DROP CONSTRAINT IF EXISTS "quizzes_items_question_id_questions_id_fk";
   ALTER TABLE "quizzes_items" DROP CONSTRAINT IF EXISTS "quizzes_items_parent_id_fk";
   ALTER TABLE "quizzes" DROP CONSTRAINT IF EXISTS "quizzes_lesson_id_course_lessons_id_fk";
   DROP INDEX IF EXISTS "quizzes_items_order_idx";
   DROP INDEX IF EXISTS "quizzes_items_parent_id_idx";
   DROP INDEX IF EXISTS "quizzes_items_question_idx";
   DROP INDEX IF EXISTS "quizzes_lesson_idx";
   DROP INDEX IF EXISTS "quizzes_updated_at_idx";
   DROP INDEX IF EXISTS "quizzes_created_at_idx";
   DROP TABLE IF EXISTS "quizzes_items" CASCADE;
   DROP TABLE IF EXISTS "quizzes" CASCADE;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"is_required" boolean DEFAULT false,
  	"estimated_duration" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "quizzes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_id" integer NOT NULL,
  	"order" numeric,
  	"points" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "quizzes_id" integer;
  ALTER TABLE "quizzes_items" ADD CONSTRAINT "quizzes_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_items" ADD CONSTRAINT "quizzes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "quizzes_items_order_idx" ON "quizzes_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "quizzes_items_parent_id_idx" ON "quizzes_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "quizzes_items_question_idx" ON "quizzes_items" USING btree ("question_id");
  CREATE INDEX IF NOT EXISTS "quizzes_lesson_idx" ON "quizzes" USING btree ("lesson_id");
  CREATE INDEX IF NOT EXISTS "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quizzes_fk" FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");`)
}

