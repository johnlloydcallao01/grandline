import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_coupon_codes_status" AS ENUM('draft', 'active', 'paused', 'expired', 'archived');
  CREATE TYPE "public"."enum_coupon_codes_discount_type" AS ENUM('percent', 'fixed_course', 'fixed_cart');
  CREATE TYPE "public"."enum_coupon_codes_scope_type" AS ENUM('all_courses', 'specific_courses', 'specific_categories');
  CREATE TYPE "public"."enum_coupon_redemptions_context_type" AS ENUM('checkout_preview', 'checkout_commit', 'manual_adjustment', 'refund_reversal');
  CREATE TYPE "public"."enum_coupon_redemptions_status" AS ENUM('applied', 'voided', 'reversed');
  CREATE TABLE "coupon_codes_allowed_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "coupon_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"status" "enum_coupon_codes_status" DEFAULT 'draft' NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"discount_type" "enum_coupon_codes_discount_type" DEFAULT 'percent' NOT NULL,
  	"amount" numeric NOT NULL,
  	"max_discount_amount" numeric,
  	"scope_type" "enum_coupon_codes_scope_type" DEFAULT 'all_courses' NOT NULL,
  	"exclude_sale_courses" boolean DEFAULT false,
  	"minimum_amount" numeric,
  	"maximum_amount" numeric,
  	"usage_limit_total" numeric,
  	"usage_limit_per_user" numeric,
  	"max_items_affected" numeric,
  	"stackable" boolean DEFAULT false,
  	"priority" numeric DEFAULT 100,
  	"usage_count" numeric DEFAULT 0,
  	"last_used_at" timestamp(3) with time zone,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupon_codes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"course_categories_id" integer,
  	"trainees_id" integer
  );
  
  CREATE TABLE "coupon_redemptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"coupon_id" integer NOT NULL,
  	"trainee_id" integer,
  	"user_id" integer,
  	"course_enrollment_id" integer,
  	"course_id" integer,
  	"context_type" "enum_coupon_redemptions_context_type" DEFAULT 'checkout_commit' NOT NULL,
  	"status" "enum_coupon_redemptions_status" DEFAULT 'applied' NOT NULL,
  	"code_snapshot" varchar NOT NULL,
  	"discount_type_snapshot" varchar NOT NULL,
  	"discount_amount_snapshot" numeric NOT NULL,
  	"subtotal_snapshot" numeric NOT NULL,
  	"final_total_snapshot" numeric NOT NULL,
  	"currency_snapshot" varchar DEFAULT 'PHP' NOT NULL,
  	"applied_at" timestamp(3) with time zone NOT NULL,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "course_enrollments" ADD COLUMN "coupon_id" integer;
  ALTER TABLE "course_enrollments" ADD COLUMN "coupon_code" varchar;
  ALTER TABLE "course_enrollments" ADD COLUMN "coupon_discount_amount" numeric DEFAULT 0;
  ALTER TABLE "course_enrollments" ADD COLUMN "list_price_snapshot" numeric;
  ALTER TABLE "course_enrollments" ADD COLUMN "final_price_snapshot" numeric;
  ALTER TABLE "course_enrollments" ADD COLUMN "pricing_breakdown" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "coupon_codes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "coupon_redemptions_id" integer;
  ALTER TABLE "coupon_codes_allowed_emails" ADD CONSTRAINT "coupon_codes_allowed_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coupon_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupon_codes_rels" ADD CONSTRAINT "coupon_codes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coupon_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupon_codes_rels" ADD CONSTRAINT "coupon_codes_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupon_codes_rels" ADD CONSTRAINT "coupon_codes_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupon_codes_rels" ADD CONSTRAINT "coupon_codes_rels_trainees_fk" FOREIGN KEY ("trainees_id") REFERENCES "public"."trainees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_course_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("course_enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "coupon_codes_allowed_emails_order_idx" ON "coupon_codes_allowed_emails" USING btree ("_order");
  CREATE INDEX "coupon_codes_allowed_emails_parent_id_idx" ON "coupon_codes_allowed_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "coupon_codes_code_idx" ON "coupon_codes" USING btree ("code");
  CREATE INDEX "coupon_codes_status_idx" ON "coupon_codes" USING btree ("status");
  CREATE INDEX "coupon_codes_starts_at_idx" ON "coupon_codes" USING btree ("starts_at");
  CREATE INDEX "coupon_codes_expires_at_idx" ON "coupon_codes" USING btree ("expires_at");
  CREATE INDEX "coupon_codes_updated_at_idx" ON "coupon_codes" USING btree ("updated_at");
  CREATE INDEX "coupon_codes_created_at_idx" ON "coupon_codes" USING btree ("created_at");
  CREATE INDEX "coupon_codes_rels_order_idx" ON "coupon_codes_rels" USING btree ("order");
  CREATE INDEX "coupon_codes_rels_parent_idx" ON "coupon_codes_rels" USING btree ("parent_id");
  CREATE INDEX "coupon_codes_rels_path_idx" ON "coupon_codes_rels" USING btree ("path");
  CREATE INDEX "coupon_codes_rels_courses_id_idx" ON "coupon_codes_rels" USING btree ("courses_id");
  CREATE INDEX "coupon_codes_rels_course_categories_id_idx" ON "coupon_codes_rels" USING btree ("course_categories_id");
  CREATE INDEX "coupon_codes_rels_trainees_id_idx" ON "coupon_codes_rels" USING btree ("trainees_id");
  CREATE INDEX "coupon_redemptions_coupon_idx" ON "coupon_redemptions" USING btree ("coupon_id");
  CREATE INDEX "coupon_redemptions_trainee_idx" ON "coupon_redemptions" USING btree ("trainee_id");
  CREATE INDEX "coupon_redemptions_user_idx" ON "coupon_redemptions" USING btree ("user_id");
  CREATE INDEX "coupon_redemptions_course_enrollment_idx" ON "coupon_redemptions" USING btree ("course_enrollment_id");
  CREATE INDEX "coupon_redemptions_course_idx" ON "coupon_redemptions" USING btree ("course_id");
  CREATE INDEX "coupon_redemptions_status_idx" ON "coupon_redemptions" USING btree ("status");
  CREATE INDEX "coupon_redemptions_code_snapshot_idx" ON "coupon_redemptions" USING btree ("code_snapshot");
  CREATE INDEX "coupon_redemptions_applied_at_idx" ON "coupon_redemptions" USING btree ("applied_at");
  CREATE INDEX "coupon_redemptions_updated_at_idx" ON "coupon_redemptions" USING btree ("updated_at");
  CREATE INDEX "coupon_redemptions_created_at_idx" ON "coupon_redemptions" USING btree ("created_at");
  ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_coupon_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupon_codes_fk" FOREIGN KEY ("coupon_codes_id") REFERENCES "public"."coupon_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupon_redemptions_fk" FOREIGN KEY ("coupon_redemptions_id") REFERENCES "public"."coupon_redemptions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_enrollments_coupon_idx" ON "course_enrollments" USING btree ("coupon_id");
  CREATE INDEX "course_enrollments_coupon_code_idx" ON "course_enrollments" USING btree ("coupon_code");
  CREATE INDEX "payload_locked_documents_rels_coupon_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("coupon_codes_id");
  CREATE INDEX "payload_locked_documents_rels_coupon_redemptions_id_idx" ON "payload_locked_documents_rels" USING btree ("coupon_redemptions_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupon_codes_allowed_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coupon_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coupon_codes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coupon_redemptions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "coupon_codes_allowed_emails" CASCADE;
  DROP TABLE "coupon_codes" CASCADE;
  DROP TABLE "coupon_codes_rels" CASCADE;
  DROP TABLE "coupon_redemptions" CASCADE;
  ALTER TABLE "course_enrollments" DROP CONSTRAINT "course_enrollments_coupon_id_coupon_codes_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_coupon_codes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_coupon_redemptions_fk";
  
  DROP INDEX "course_enrollments_coupon_idx";
  DROP INDEX "course_enrollments_coupon_code_idx";
  DROP INDEX "payload_locked_documents_rels_coupon_codes_id_idx";
  DROP INDEX "payload_locked_documents_rels_coupon_redemptions_id_idx";
  ALTER TABLE "course_enrollments" DROP COLUMN "coupon_id";
  ALTER TABLE "course_enrollments" DROP COLUMN "coupon_code";
  ALTER TABLE "course_enrollments" DROP COLUMN "coupon_discount_amount";
  ALTER TABLE "course_enrollments" DROP COLUMN "list_price_snapshot";
  ALTER TABLE "course_enrollments" DROP COLUMN "final_price_snapshot";
  ALTER TABLE "course_enrollments" DROP COLUMN "pricing_breakdown";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "coupon_codes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "coupon_redemptions_id";
  DROP TYPE "public"."enum_coupon_codes_status";
  DROP TYPE "public"."enum_coupon_codes_discount_type";
  DROP TYPE "public"."enum_coupon_codes_scope_type";
  DROP TYPE "public"."enum_coupon_redemptions_context_type";
  DROP TYPE "public"."enum_coupon_redemptions_status";`)
}
