import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_course_item_progress_status" AS ENUM('not_started', 'in_progress', 'completed', 'passed', 'failed');
  CREATE TABLE "course_item_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"trainee_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"enrollment_id" integer NOT NULL,
  	"status" "enum_course_item_progress_status" DEFAULT 'not_started' NOT NULL,
  	"is_completed" boolean DEFAULT false,
  	"progress_percentage" numeric DEFAULT 0,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"last_accessed_at" timestamp(3) with time zone,
  	"duration_seconds" numeric DEFAULT 0,
  	"score" numeric,
  	"grade" numeric,
  	"attempts" numeric DEFAULT 0,
  	"quiz_data" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_item_progress_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"course_lessons_id" integer,
  	"assessments_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_item_progress_id" integer;
  ALTER TABLE "course_item_progress" ADD CONSTRAINT "course_item_progress_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_item_progress" ADD CONSTRAINT "course_item_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_item_progress" ADD CONSTRAINT "course_item_progress_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_item_progress_rels" ADD CONSTRAINT "course_item_progress_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_item_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_item_progress_rels" ADD CONSTRAINT "course_item_progress_rels_course_lessons_fk" FOREIGN KEY ("course_lessons_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_item_progress_rels" ADD CONSTRAINT "course_item_progress_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_item_progress_trainee_idx" ON "course_item_progress" USING btree ("trainee_id");
  CREATE INDEX "course_item_progress_course_idx" ON "course_item_progress" USING btree ("course_id");
  CREATE INDEX "course_item_progress_enrollment_idx" ON "course_item_progress" USING btree ("enrollment_id");
  CREATE INDEX "course_item_progress_status_idx" ON "course_item_progress" USING btree ("status");
  CREATE INDEX "course_item_progress_is_completed_idx" ON "course_item_progress" USING btree ("is_completed");
  CREATE INDEX "course_item_progress_last_accessed_at_idx" ON "course_item_progress" USING btree ("last_accessed_at");
  CREATE INDEX "course_item_progress_updated_at_idx" ON "course_item_progress" USING btree ("updated_at");
  CREATE INDEX "course_item_progress_created_at_idx" ON "course_item_progress" USING btree ("created_at");
  CREATE INDEX "trainee_course_idx" ON "course_item_progress" USING btree ("trainee_id","course_id");
  CREATE INDEX "enrollment_isCompleted_idx" ON "course_item_progress" USING btree ("enrollment_id","is_completed");
  CREATE INDEX "course_item_progress_rels_order_idx" ON "course_item_progress_rels" USING btree ("order");
  CREATE INDEX "course_item_progress_rels_parent_idx" ON "course_item_progress_rels" USING btree ("parent_id");
  CREATE INDEX "course_item_progress_rels_path_idx" ON "course_item_progress_rels" USING btree ("path");
  CREATE INDEX "course_item_progress_rels_course_lessons_id_idx" ON "course_item_progress_rels" USING btree ("course_lessons_id");
  CREATE INDEX "course_item_progress_rels_assessments_id_idx" ON "course_item_progress_rels" USING btree ("assessments_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_item_progress_fk" FOREIGN KEY ("course_item_progress_id") REFERENCES "public"."course_item_progress"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_course_item_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("course_item_progress_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_item_progress" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_item_progress_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "course_item_progress" CASCADE;
  DROP TABLE "course_item_progress_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_item_progress_fk";
  
  DROP INDEX "payload_locked_documents_rels_course_item_progress_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_item_progress_id";
  DROP TYPE "public"."enum_course_item_progress_status";`)
}
