import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "course_modules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"course_id" integer NOT NULL,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"release_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"module_id" integer NOT NULL,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"body_blocks" jsonb,
  	"estimated_duration" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_modules_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_lessons_id" integer;
  ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "course_modules_course_idx" ON "course_modules" USING btree ("course_id");
  CREATE INDEX "course_modules_updated_at_idx" ON "course_modules" USING btree ("updated_at");
  CREATE INDEX "course_modules_created_at_idx" ON "course_modules" USING btree ("created_at");
  CREATE INDEX "course_lessons_module_idx" ON "course_lessons" USING btree ("module_id");
  CREATE INDEX "course_lessons_updated_at_idx" ON "course_lessons" USING btree ("updated_at");
  CREATE INDEX "course_lessons_created_at_idx" ON "course_lessons" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_modules_fk" FOREIGN KEY ("course_modules_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_lessons_fk" FOREIGN KEY ("course_lessons_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_course_modules_id_idx" ON "payload_locked_documents_rels" USING btree ("course_modules_id");
  CREATE INDEX "payload_locked_documents_rels_course_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("course_lessons_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_lessons" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "course_modules" CASCADE;
  DROP TABLE "course_lessons" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_modules_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_lessons_fk";
  
  DROP INDEX "payload_locked_documents_rels_course_modules_id_idx";
  DROP INDEX "payload_locked_documents_rels_course_lessons_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_modules_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_lessons_id";`)
}
