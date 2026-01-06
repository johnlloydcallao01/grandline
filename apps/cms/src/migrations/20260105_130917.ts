import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_materials_type" AS ENUM('video', 'pdf', 'image', 'audio', 'link', 'scorm', 'zip', 'other');
  CREATE TYPE "public"."enum_materials_material_source" AS ENUM('media', 'external');
  CREATE TABLE "materials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_materials_type" DEFAULT 'other' NOT NULL,
  	"description" varchar,
  	"material_source" "enum_materials_material_source" DEFAULT 'media' NOT NULL,
  	"media_id" integer,
  	"external_url" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_materials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"course_id" integer NOT NULL,
  	"material_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"is_required" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lesson_materials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"material_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"is_required" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "materials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_materials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lesson_materials_id" integer;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_materials" ADD CONSTRAINT "lesson_materials_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lesson_materials" ADD CONSTRAINT "lesson_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "materials_media_idx" ON "materials" USING btree ("media_id");
  CREATE INDEX "materials_updated_at_idx" ON "materials" USING btree ("updated_at");
  CREATE INDEX "materials_created_at_idx" ON "materials" USING btree ("created_at");
  CREATE INDEX "course_materials_course_idx" ON "course_materials" USING btree ("course_id");
  CREATE INDEX "course_materials_material_idx" ON "course_materials" USING btree ("material_id");
  CREATE INDEX "course_materials_updated_at_idx" ON "course_materials" USING btree ("updated_at");
  CREATE INDEX "course_materials_created_at_idx" ON "course_materials" USING btree ("created_at");
  CREATE INDEX "lesson_materials_lesson_idx" ON "lesson_materials" USING btree ("lesson_id");
  CREATE INDEX "lesson_materials_material_idx" ON "lesson_materials" USING btree ("material_id");
  CREATE INDEX "lesson_materials_updated_at_idx" ON "lesson_materials" USING btree ("updated_at");
  CREATE INDEX "lesson_materials_created_at_idx" ON "lesson_materials" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_materials_fk" FOREIGN KEY ("course_materials_id") REFERENCES "public"."course_materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lesson_materials_fk" FOREIGN KEY ("lesson_materials_id") REFERENCES "public"."lesson_materials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_materials_id_idx" ON "payload_locked_documents_rels" USING btree ("materials_id");
  CREATE INDEX "payload_locked_documents_rels_course_materials_id_idx" ON "payload_locked_documents_rels" USING btree ("course_materials_id");
  CREATE INDEX "payload_locked_documents_rels_lesson_materials_id_idx" ON "payload_locked_documents_rels" USING btree ("lesson_materials_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "materials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_materials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lesson_materials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "materials" CASCADE;
  DROP TABLE "course_materials" CASCADE;
  DROP TABLE "lesson_materials" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_materials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_materials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lesson_materials_fk";
  
  DROP INDEX "payload_locked_documents_rels_materials_id_idx";
  DROP INDEX "payload_locked_documents_rels_course_materials_id_idx";
  DROP INDEX "payload_locked_documents_rels_lesson_materials_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "materials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_materials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lesson_materials_id";
  DROP TYPE "public"."enum_materials_type";
  DROP TYPE "public"."enum_materials_material_source";`)
}
