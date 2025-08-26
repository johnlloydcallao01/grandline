import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_admins_permissions" AS ENUM('user_management', 'course_management', 'content_management', 'system_settings', 'reports_access');
  CREATE TYPE "public"."enum_admins_admin_level" AS ENUM('system', 'department', 'content');
  CREATE TABLE "instructors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"specialization" varchar NOT NULL,
  	"years_experience" numeric,
  	"certifications" varchar,
  	"bio" varchar,
  	"office_hours" varchar,
  	"contact_email" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trainees" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "admins_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_admins_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "admins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"department" varchar NOT NULL,
  	"admin_level" "enum_admins_admin_level" NOT NULL,
  	"hire_date" timestamp(3) with time zone,
  	"office_location" varchar,
  	"direct_reports" numeric,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  ALTER TABLE "services_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_features" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_gallery" CASCADE;
  DROP TABLE "services_features" CASCADE;
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'trainee'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'instructor', 'trainee');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'trainee'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "services" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_services_status";
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_services_status";
  ALTER TABLE "services" ALTER COLUMN "status" SET DATA TYPE "public"."enum_services_status" USING "status"::"public"."enum_services_status";
  ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "cloudinary_public_id" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_u_r_l" varchar;
  ALTER TABLE "services" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "services" ADD COLUMN "content" jsonb NOT NULL;
  ALTER TABLE "services" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "services" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "services" ADD COLUMN "author_id" integer NOT NULL;
  ALTER TABLE "services" ADD COLUMN "seo_focus_keyword" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "trainees_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "admins_id" integer;
  ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trainees" ADD CONSTRAINT "trainees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admins_permissions" ADD CONSTRAINT "admins_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_tags" ADD CONSTRAINT "services_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "instructors_user_idx" ON "instructors" USING btree ("user_id");
  CREATE INDEX "instructors_updated_at_idx" ON "instructors" USING btree ("updated_at");
  CREATE INDEX "instructors_created_at_idx" ON "instructors" USING btree ("created_at");
  CREATE UNIQUE INDEX "trainees_user_idx" ON "trainees" USING btree ("user_id");
  CREATE INDEX "trainees_updated_at_idx" ON "trainees" USING btree ("updated_at");
  CREATE INDEX "trainees_created_at_idx" ON "trainees" USING btree ("created_at");
  CREATE INDEX "admins_permissions_order_idx" ON "admins_permissions" USING btree ("order");
  CREATE INDEX "admins_permissions_parent_idx" ON "admins_permissions" USING btree ("parent_id");
  CREATE UNIQUE INDEX "admins_user_idx" ON "admins" USING btree ("user_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE INDEX "services_tags_order_idx" ON "services_tags" USING btree ("_order");
  CREATE INDEX "services_tags_parent_id_idx" ON "services_tags" USING btree ("_parent_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trainees_fk" FOREIGN KEY ("trainees_id") REFERENCES "public"."trainees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_author_idx" ON "services" USING btree ("author_id");
  CREATE INDEX "payload_locked_documents_rels_instructors_id_idx" ON "payload_locked_documents_rels" USING btree ("instructors_id");
  CREATE INDEX "payload_locked_documents_rels_trainees_id_idx" ON "payload_locked_documents_rels" USING btree ("trainees_id");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  ALTER TABLE "services" DROP COLUMN "name";
  ALTER TABLE "services" DROP COLUMN "description";
  ALTER TABLE "services" DROP COLUMN "short_description";
  ALTER TABLE "services" DROP COLUMN "pricing_type";
  ALTER TABLE "services" DROP COLUMN "pricing_amount";
  ALTER TABLE "services" DROP COLUMN "pricing_currency";
  ALTER TABLE "services" DROP COLUMN "category";
  DROP TYPE "public"."enum_services_pricing_type";
  DROP TYPE "public"."enum_services_pricing_currency";
  DROP TYPE "public"."enum_services_category";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_pricing_type" AS ENUM('fixed', 'starting', 'custom');
  CREATE TYPE "public"."enum_services_pricing_currency" AS ENUM('USD', 'EUR', 'GBP');
  CREATE TYPE "public"."enum_services_category" AS ENUM('web-development', 'mobile-development', 'design', 'consulting', 'other');
  CREATE TABLE "services_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "services_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL,
  	"included" boolean DEFAULT true
  );
  
  ALTER TABLE "instructors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "trainees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "admins_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "admins" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "instructors" CASCADE;
  DROP TABLE "trainees" CASCADE;
  DROP TABLE "admins_permissions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "services_tags" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_author_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_trainees_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_admins_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'admin', 'editor', 'viewer');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "services" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'active'::text;
  DROP TYPE "public"."enum_services_status";
  CREATE TYPE "public"."enum_services_status" AS ENUM('active', 'coming-soon', 'discontinued');
  ALTER TABLE "services" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."enum_services_status";
  ALTER TABLE "services" ALTER COLUMN "status" SET DATA TYPE "public"."enum_services_status" USING "status"::"public"."enum_services_status";
  DROP INDEX "services_author_idx";
  DROP INDEX "payload_locked_documents_rels_instructors_id_idx";
  DROP INDEX "payload_locked_documents_rels_trainees_id_idx";
  DROP INDEX "payload_locked_documents_rels_admins_id_idx";
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "services" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "services" ADD COLUMN "description" jsonb NOT NULL;
  ALTER TABLE "services" ADD COLUMN "short_description" varchar;
  ALTER TABLE "services" ADD COLUMN "pricing_type" "enum_services_pricing_type" DEFAULT 'fixed';
  ALTER TABLE "services" ADD COLUMN "pricing_amount" numeric;
  ALTER TABLE "services" ADD COLUMN "pricing_currency" "enum_services_pricing_currency" DEFAULT 'USD';
  ALTER TABLE "services" ADD COLUMN "category" "enum_services_category";
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_features" ADD CONSTRAINT "services_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_gallery_order_idx" ON "services_gallery" USING btree ("_order");
  CREATE INDEX "services_gallery_parent_id_idx" ON "services_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_gallery_image_idx" ON "services_gallery" USING btree ("image_id");
  CREATE INDEX "services_features_order_idx" ON "services_features" USING btree ("_order");
  CREATE INDEX "services_features_parent_id_idx" ON "services_features" USING btree ("_parent_id");
  ALTER TABLE "media" DROP COLUMN "cloudinary_public_id";
  ALTER TABLE "media" DROP COLUMN "cloudinary_u_r_l";
  ALTER TABLE "services" DROP COLUMN "title";
  ALTER TABLE "services" DROP COLUMN "content";
  ALTER TABLE "services" DROP COLUMN "excerpt";
  ALTER TABLE "services" DROP COLUMN "published_at";
  ALTER TABLE "services" DROP COLUMN "author_id";
  ALTER TABLE "services" DROP COLUMN "seo_focus_keyword";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "trainees_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "admins_id";
  DROP TYPE "public"."enum_admins_permissions";
  DROP TYPE "public"."enum_admins_admin_level";`)
}
