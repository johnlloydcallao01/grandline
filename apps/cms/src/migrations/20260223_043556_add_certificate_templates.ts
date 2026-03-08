import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_certificate_templates_status" AS ENUM('draft', 'published', 'archived');
  CREATE TABLE "certificate_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"background_image_id" integer NOT NULL,
  	"canvas_schema" jsonb NOT NULL,
  	"status" "enum_certificate_templates_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "courses" ADD COLUMN "certificate_template_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "certificate_templates_id" integer;
  ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "certificate_templates_slug_idx" ON "certificate_templates" USING btree ("slug");
  CREATE INDEX "certificate_templates_background_image_idx" ON "certificate_templates" USING btree ("background_image_id");
  CREATE INDEX "certificate_templates_updated_at_idx" ON "certificate_templates" USING btree ("updated_at");
  CREATE INDEX "certificate_templates_created_at_idx" ON "certificate_templates" USING btree ("created_at");
  ALTER TABLE "courses" ADD CONSTRAINT "courses_certificate_template_id_certificate_templates_id_fk" FOREIGN KEY ("certificate_template_id") REFERENCES "public"."certificate_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificate_templates_fk" FOREIGN KEY ("certificate_templates_id") REFERENCES "public"."certificate_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_certificate_template_idx" ON "courses" USING btree ("certificate_template_id");
  CREATE INDEX "payload_locked_documents_rels_certificate_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("certificate_templates_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "certificate_templates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "certificate_templates" CASCADE;
  ALTER TABLE "courses" DROP CONSTRAINT "courses_certificate_template_id_certificate_templates_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_certificate_templates_fk";
  
  DROP INDEX "courses_certificate_template_idx";
  DROP INDEX "payload_locked_documents_rels_certificate_templates_id_idx";
  ALTER TABLE "courses" DROP COLUMN "certificate_template_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "certificate_templates_id";
  DROP TYPE "public"."enum_certificate_templates_status";`)
}
