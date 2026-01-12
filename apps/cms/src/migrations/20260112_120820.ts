import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

interface TableExistsResult {
  table_exists: boolean
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const tableCheck = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'questions'
    ) as table_exists;
  `)

  const tableExists =
    ((tableCheck as unknown) as { rows: TableExistsResult[] }).rows[0]?.table_exists

  if (tableExists) {
    return
  }

  await db.execute(sql`
   CREATE TYPE "public"."enum_questions_type" AS ENUM('single_choice', 'multiple_choice', 'true_false');
  CREATE TYPE "public"."enum_questions_difficulty" AS ENUM('easy', 'medium', 'hard');
  CREATE TYPE "public"."enum_questions_status" AS ENUM('draft', 'active', 'deprecated');
  CREATE TYPE "public"."enum_assessments_assessment_type" AS ENUM('quiz', 'exam', 'final_exam');
  CREATE TABLE "questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"is_correct" boolean DEFAULT false
  );
  
  CREATE TABLE "questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prompt" varchar NOT NULL,
  	"type" "enum_questions_type" DEFAULT 'single_choice' NOT NULL,
  	"explanation" varchar,
  	"difficulty" "enum_questions_difficulty" DEFAULT 'medium' NOT NULL,
  	"status" "enum_questions_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "questions_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "quizzes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_id" integer NOT NULL,
  	"order" numeric,
  	"points" numeric
  );
  
  CREATE TABLE "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"is_required" boolean DEFAULT false,
  	"estimated_duration" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "assessments_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_id" integer NOT NULL,
  	"order" numeric,
  	"points" numeric
  );
  
  CREATE TABLE "assessments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"module_id" integer NOT NULL,
  	"assessment_type" "enum_assessments_assessment_type" DEFAULT 'quiz' NOT NULL,
  	"order" numeric DEFAULT 1,
  	"passing_score" numeric DEFAULT 70,
  	"max_attempts" numeric DEFAULT 1,
  	"time_limit_minutes" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "course_lessons" ADD COLUMN "description" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "questions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quizzes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "assessments_id" integer;
  ALTER TABLE "questions_options" ADD CONSTRAINT "questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "questions_texts" ADD CONSTRAINT "questions_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_items" ADD CONSTRAINT "quizzes_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_items" ADD CONSTRAINT "quizzes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assessments_items" ADD CONSTRAINT "assessments_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assessments_items" ADD CONSTRAINT "assessments_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "questions_options_order_idx" ON "questions_options" USING btree ("_order");
  CREATE INDEX "questions_options_parent_id_idx" ON "questions_options" USING btree ("_parent_id");
  CREATE INDEX "questions_updated_at_idx" ON "questions" USING btree ("updated_at");
  CREATE INDEX "questions_created_at_idx" ON "questions" USING btree ("created_at");
  CREATE INDEX "questions_texts_order_parent_idx" ON "questions_texts" USING btree ("order","parent_id");
  CREATE INDEX "quizzes_items_order_idx" ON "quizzes_items" USING btree ("_order");
  CREATE INDEX "quizzes_items_parent_id_idx" ON "quizzes_items" USING btree ("_parent_id");
  CREATE INDEX "quizzes_items_question_idx" ON "quizzes_items" USING btree ("question_id");
  CREATE INDEX "quizzes_lesson_idx" ON "quizzes" USING btree ("lesson_id");
  CREATE INDEX "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  CREATE INDEX "assessments_items_order_idx" ON "assessments_items" USING btree ("_order");
  CREATE INDEX "assessments_items_parent_id_idx" ON "assessments_items" USING btree ("_parent_id");
  CREATE INDEX "assessments_items_question_idx" ON "assessments_items" USING btree ("question_id");
  CREATE INDEX "assessments_module_idx" ON "assessments" USING btree ("module_id");
  CREATE INDEX "assessments_updated_at_idx" ON "assessments" USING btree ("updated_at");
  CREATE INDEX "assessments_created_at_idx" ON "assessments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_questions_fk" FOREIGN KEY ("questions_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quizzes_fk" FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("questions_id");
  CREATE INDEX "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");
  CREATE INDEX "payload_locked_documents_rels_assessments_id_idx" ON "payload_locked_documents_rels" USING btree ("assessments_id");
  ALTER TABLE "course_lessons" DROP COLUMN "body_blocks";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "questions_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "questions_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assessments_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assessments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "questions_options" CASCADE;
  DROP TABLE "questions" CASCADE;
  DROP TABLE "questions_texts" CASCADE;
  DROP TABLE "quizzes_items" CASCADE;
  DROP TABLE "quizzes" CASCADE;
  DROP TABLE "assessments_items" CASCADE;
  DROP TABLE "assessments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_questions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quizzes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_assessments_fk";
  
  DROP INDEX "payload_locked_documents_rels_questions_id_idx";
  DROP INDEX "payload_locked_documents_rels_quizzes_id_idx";
  DROP INDEX "payload_locked_documents_rels_assessments_id_idx";
  ALTER TABLE "course_lessons" ADD COLUMN "body_blocks" jsonb;
  ALTER TABLE "course_lessons" DROP COLUMN "description";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "questions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quizzes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "assessments_id";
  DROP TYPE "public"."enum_questions_type";
  DROP TYPE "public"."enum_questions_difficulty";
  DROP TYPE "public"."enum_questions_status";
  DROP TYPE "public"."enum_assessments_assessment_type";`)
}
