import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feedback_forms_blocks_text_input_format" AS ENUM('text', 'email', 'phone', 'number', 'textarea');
  CREATE TYPE "public"."enum_feedback_forms_blocks_choice_input_ui_type" AS ENUM('radio', 'dropdown', 'checkbox_group');
  CREATE TABLE "feedback_forms_blocks_text_input" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"placeholder" varchar,
  	"format" "enum_feedback_forms_blocks_text_input_format" DEFAULT 'text',
  	"is_required" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "feedback_forms_blocks_choice_input_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "feedback_forms_blocks_choice_input" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"ui_type" "enum_feedback_forms_blocks_choice_input_ui_type" DEFAULT 'radio' NOT NULL,
  	"is_required" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "feedback_forms_blocks_survey_matrix_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "feedback_forms_blocks_survey_matrix_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "feedback_forms_blocks_survey_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"question" varchar NOT NULL,
  	"is_required" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "feedback_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"trainee_id" integer NOT NULL,
  	"responses" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "courses" ADD COLUMN "feedback_form_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedback_forms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedback_submissions_id" integer;
  ALTER TABLE "feedback_forms_blocks_text_input" ADD CONSTRAINT "feedback_forms_blocks_text_input_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_forms_blocks_choice_input_options" ADD CONSTRAINT "feedback_forms_blocks_choice_input_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms_blocks_choice_input"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_forms_blocks_choice_input" ADD CONSTRAINT "feedback_forms_blocks_choice_input_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_forms_blocks_survey_matrix_columns" ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms_blocks_survey_matrix"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_forms_blocks_survey_matrix_rows" ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms_blocks_survey_matrix"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_forms_blocks_survey_matrix" ADD CONSTRAINT "feedback_forms_blocks_survey_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feedback_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_form_id_feedback_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."feedback_forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "feedback_forms_blocks_text_input_order_idx" ON "feedback_forms_blocks_text_input" USING btree ("_order");
  CREATE INDEX "feedback_forms_blocks_text_input_parent_id_idx" ON "feedback_forms_blocks_text_input" USING btree ("_parent_id");
  CREATE INDEX "feedback_forms_blocks_text_input_path_idx" ON "feedback_forms_blocks_text_input" USING btree ("_path");
  CREATE INDEX "feedback_forms_blocks_choice_input_options_order_idx" ON "feedback_forms_blocks_choice_input_options" USING btree ("_order");
  CREATE INDEX "feedback_forms_blocks_choice_input_options_parent_id_idx" ON "feedback_forms_blocks_choice_input_options" USING btree ("_parent_id");
  CREATE INDEX "feedback_forms_blocks_choice_input_order_idx" ON "feedback_forms_blocks_choice_input" USING btree ("_order");
  CREATE INDEX "feedback_forms_blocks_choice_input_parent_id_idx" ON "feedback_forms_blocks_choice_input" USING btree ("_parent_id");
  CREATE INDEX "feedback_forms_blocks_choice_input_path_idx" ON "feedback_forms_blocks_choice_input" USING btree ("_path");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_columns_order_idx" ON "feedback_forms_blocks_survey_matrix_columns" USING btree ("_order");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_columns_parent_id_idx" ON "feedback_forms_blocks_survey_matrix_columns" USING btree ("_parent_id");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_rows_order_idx" ON "feedback_forms_blocks_survey_matrix_rows" USING btree ("_order");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_rows_parent_id_idx" ON "feedback_forms_blocks_survey_matrix_rows" USING btree ("_parent_id");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_order_idx" ON "feedback_forms_blocks_survey_matrix" USING btree ("_order");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_parent_id_idx" ON "feedback_forms_blocks_survey_matrix" USING btree ("_parent_id");
  CREATE INDEX "feedback_forms_blocks_survey_matrix_path_idx" ON "feedback_forms_blocks_survey_matrix" USING btree ("_path");
  CREATE INDEX "feedback_forms_updated_at_idx" ON "feedback_forms" USING btree ("updated_at");
  CREATE INDEX "feedback_forms_created_at_idx" ON "feedback_forms" USING btree ("created_at");
  CREATE INDEX "feedback_submissions_form_idx" ON "feedback_submissions" USING btree ("form_id");
  CREATE INDEX "feedback_submissions_course_idx" ON "feedback_submissions" USING btree ("course_id");
  CREATE INDEX "feedback_submissions_trainee_idx" ON "feedback_submissions" USING btree ("trainee_id");
  CREATE INDEX "feedback_submissions_updated_at_idx" ON "feedback_submissions" USING btree ("updated_at");
  CREATE INDEX "feedback_submissions_created_at_idx" ON "feedback_submissions" USING btree ("created_at");
  ALTER TABLE "courses" ADD CONSTRAINT "courses_feedback_form_id_feedback_forms_id_fk" FOREIGN KEY ("feedback_form_id") REFERENCES "public"."feedback_forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_forms_fk" FOREIGN KEY ("feedback_forms_id") REFERENCES "public"."feedback_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_submissions_fk" FOREIGN KEY ("feedback_submissions_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_feedback_form_idx" ON "courses" USING btree ("feedback_form_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_forms_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_submissions_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feedback_forms_blocks_text_input" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_forms_blocks_choice_input_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_forms_blocks_choice_input" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_forms_blocks_survey_matrix_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_forms_blocks_survey_matrix_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_forms_blocks_survey_matrix" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_forms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_submissions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "feedback_forms_blocks_text_input" CASCADE;
  DROP TABLE "feedback_forms_blocks_choice_input_options" CASCADE;
  DROP TABLE "feedback_forms_blocks_choice_input" CASCADE;
  DROP TABLE "feedback_forms_blocks_survey_matrix_columns" CASCADE;
  DROP TABLE "feedback_forms_blocks_survey_matrix_rows" CASCADE;
  DROP TABLE "feedback_forms_blocks_survey_matrix" CASCADE;
  DROP TABLE "feedback_forms" CASCADE;
  DROP TABLE "feedback_submissions" CASCADE;
  ALTER TABLE "courses" DROP CONSTRAINT "courses_feedback_form_id_feedback_forms_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedback_forms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedback_submissions_fk";
  
  DROP INDEX "courses_feedback_form_idx";
  DROP INDEX "payload_locked_documents_rels_feedback_forms_id_idx";
  DROP INDEX "payload_locked_documents_rels_feedback_submissions_id_idx";
  ALTER TABLE "courses" DROP COLUMN "feedback_form_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feedback_forms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feedback_submissions_id";
  DROP TYPE "public"."enum_feedback_forms_blocks_text_input_format";
  DROP TYPE "public"."enum_feedback_forms_blocks_choice_input_ui_type";`)
}
