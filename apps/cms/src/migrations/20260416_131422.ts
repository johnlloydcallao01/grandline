import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_assignments_allowed_file_types" AS ENUM('pdf', 'word', 'excel', 'powerpoint', 'images', 'zip');
  CREATE TYPE "public"."enum_assignments_submission_type" AS ENUM('file_upload', 'text_entry', 'both');
  CREATE TYPE "public"."enum_assignment_submissions_status" AS ENUM('draft', 'submitted', 'graded', 'returned_for_revision');
  CREATE TABLE "assignments_allowed_file_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_assignments_allowed_file_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "assignments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"max_score" numeric DEFAULT 100 NOT NULL,
  	"passing_score" numeric DEFAULT 75 NOT NULL,
  	"submission_type" "enum_assignments_submission_type" DEFAULT 'both' NOT NULL,
  	"due_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "assignments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "assignment_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"assignment_id" integer NOT NULL,
  	"trainee_id" integer NOT NULL,
  	"enrollment_id" integer NOT NULL,
  	"status" "enum_assignment_submissions_status" DEFAULT 'draft' NOT NULL,
  	"submitted_text" jsonb,
  	"score" numeric,
  	"feedback" jsonb,
  	"submitted_at" timestamp(3) with time zone,
  	"graded_at" timestamp(3) with time zone,
  	"graded_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "assignment_submissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "course_modules_rels" ADD COLUMN "assignments_id" integer;
  ALTER TABLE "course_item_progress_rels" ADD COLUMN "assignments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "assignments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "assignment_submissions_id" integer;
  ALTER TABLE "assignments_allowed_file_types" ADD CONSTRAINT "assignments_allowed_file_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "assignments_rels" ADD CONSTRAINT "assignments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "assignments_rels" ADD CONSTRAINT "assignments_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_graded_by_id_users_id_fk" FOREIGN KEY ("graded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "assignment_submissions_rels" ADD CONSTRAINT "assignment_submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "assignment_submissions_rels" ADD CONSTRAINT "assignment_submissions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "assignments_allowed_file_types_order_idx" ON "assignments_allowed_file_types" USING btree ("order");
  CREATE INDEX "assignments_allowed_file_types_parent_idx" ON "assignments_allowed_file_types" USING btree ("parent_id");
  CREATE INDEX "assignments_updated_at_idx" ON "assignments" USING btree ("updated_at");
  CREATE INDEX "assignments_created_at_idx" ON "assignments" USING btree ("created_at");
  CREATE INDEX "assignments_rels_order_idx" ON "assignments_rels" USING btree ("order");
  CREATE INDEX "assignments_rels_parent_idx" ON "assignments_rels" USING btree ("parent_id");
  CREATE INDEX "assignments_rels_path_idx" ON "assignments_rels" USING btree ("path");
  CREATE INDEX "assignments_rels_media_id_idx" ON "assignments_rels" USING btree ("media_id");
  CREATE INDEX "assignment_submissions_assignment_idx" ON "assignment_submissions" USING btree ("assignment_id");
  CREATE INDEX "assignment_submissions_trainee_idx" ON "assignment_submissions" USING btree ("trainee_id");
  CREATE INDEX "assignment_submissions_enrollment_idx" ON "assignment_submissions" USING btree ("enrollment_id");
  CREATE INDEX "assignment_submissions_status_idx" ON "assignment_submissions" USING btree ("status");
  CREATE INDEX "assignment_submissions_graded_by_idx" ON "assignment_submissions" USING btree ("graded_by_id");
  CREATE INDEX "assignment_submissions_updated_at_idx" ON "assignment_submissions" USING btree ("updated_at");
  CREATE INDEX "assignment_submissions_created_at_idx" ON "assignment_submissions" USING btree ("created_at");
  CREATE INDEX "assignment_submissions_rels_order_idx" ON "assignment_submissions_rels" USING btree ("order");
  CREATE INDEX "assignment_submissions_rels_parent_idx" ON "assignment_submissions_rels" USING btree ("parent_id");
  CREATE INDEX "assignment_submissions_rels_path_idx" ON "assignment_submissions_rels" USING btree ("path");
  CREATE INDEX "assignment_submissions_rels_media_id_idx" ON "assignment_submissions_rels" USING btree ("media_id");
  ALTER TABLE "course_modules_rels" ADD CONSTRAINT "course_modules_rels_assignments_fk" FOREIGN KEY ("assignments_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_item_progress_rels" ADD CONSTRAINT "course_item_progress_rels_assignments_fk" FOREIGN KEY ("assignments_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assignments_fk" FOREIGN KEY ("assignments_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assignment_submissions_fk" FOREIGN KEY ("assignment_submissions_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_modules_rels_assignments_id_idx" ON "course_modules_rels" USING btree ("assignments_id");
  CREATE INDEX "course_item_progress_rels_assignments_id_idx" ON "course_item_progress_rels" USING btree ("assignments_id");
  CREATE INDEX "payload_locked_documents_rels_assignments_id_idx" ON "payload_locked_documents_rels" USING btree ("assignments_id");
  CREATE INDEX "payload_locked_documents_rels_assignment_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("assignment_submissions_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "assignments_allowed_file_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assignments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assignments_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assignment_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "assignment_submissions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "assignments_allowed_file_types" CASCADE;
  DROP TABLE "assignments" CASCADE;
  DROP TABLE "assignments_rels" CASCADE;
  DROP TABLE "assignment_submissions" CASCADE;
  DROP TABLE "assignment_submissions_rels" CASCADE;
  ALTER TABLE "course_modules_rels" DROP CONSTRAINT "course_modules_rels_assignments_fk";
  
  ALTER TABLE "course_item_progress_rels" DROP CONSTRAINT "course_item_progress_rels_assignments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_assignments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_assignment_submissions_fk";
  
  DROP INDEX "course_modules_rels_assignments_id_idx";
  DROP INDEX "course_item_progress_rels_assignments_id_idx";
  DROP INDEX "payload_locked_documents_rels_assignments_id_idx";
  DROP INDEX "payload_locked_documents_rels_assignment_submissions_id_idx";
  ALTER TABLE "course_modules_rels" DROP COLUMN "assignments_id";
  ALTER TABLE "course_item_progress_rels" DROP COLUMN "assignments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "assignments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "assignment_submissions_id";
  DROP TYPE "public"."enum_assignments_allowed_file_types";
  DROP TYPE "public"."enum_assignments_submission_type";
  DROP TYPE "public"."enum_assignment_submissions_status";`)
}
