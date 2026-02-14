import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_certificates_status" AS ENUM('active', 'revoked', 'expired');
  CREATE TABLE "certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"certificate_code" varchar NOT NULL,
  	"verification_url" varchar,
  	"trainee_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"enrollment_id" integer NOT NULL,
  	"issue_date" timestamp(3) with time zone NOT NULL,
  	"expiry_date" timestamp(3) with time zone,
  	"file_id" integer,
  	"metadata" jsonb,
  	"status" "enum_certificates_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "certificates_id" integer;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "certificates_certificate_code_idx" ON "certificates" USING btree ("certificate_code");
  CREATE INDEX "certificates_trainee_idx" ON "certificates" USING btree ("trainee_id");
  CREATE INDEX "certificates_course_idx" ON "certificates" USING btree ("course_id");
  CREATE INDEX "certificates_enrollment_idx" ON "certificates" USING btree ("enrollment_id");
  CREATE INDEX "certificates_file_idx" ON "certificates" USING btree ("file_id");
  CREATE INDEX "certificates_updated_at_idx" ON "certificates" USING btree ("updated_at");
  CREATE INDEX "certificates_created_at_idx" ON "certificates" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "payload_locked_documents_rels" USING btree ("certificates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "certificates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "certificates" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_certificates_fk";
  
  DROP INDEX "payload_locked_documents_rels_certificates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "certificates_id";
  DROP TYPE "public"."enum_certificates_status";`)
}
