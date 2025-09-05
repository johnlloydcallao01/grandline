import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_difficulty_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_courses_language" AS ENUM('en', 'es', 'fr', 'de');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_course_categories_category_type" AS ENUM('course', 'skill', 'topic', 'industry');
  CREATE TYPE "public"."enum_course_enrollments_enrollment_type" AS ENUM('free', 'paid', 'scholarship', 'trial', 'corporate');
  CREATE TYPE "public"."enum_course_enrollments_status" AS ENUM('active', 'suspended', 'completed', 'dropped', 'expired', 'pending');
  CREATE TYPE "public"."enum_course_enrollments_payment_status" AS ENUM('completed', 'pending', 'failed', 'refunded', 'not_required');
  CREATE TABLE "courses_learning_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"objective" varchar NOT NULL
  );
  
  CREATE TABLE "courses_prerequisites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prerequisite" varchar NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"course_code" varchar NOT NULL,
  	"excerpt" varchar,
  	"description" jsonb,
  	"instructor_id" integer NOT NULL,
  	"category_id" integer,
  	"thumbnail_id" integer,
  	"banner_image_id" integer,
  	"price" numeric DEFAULT 0,
  	"max_students" numeric,
  	"enrollment_start_date" timestamp(3) with time zone,
  	"enrollment_end_date" timestamp(3) with time zone,
  	"course_start_date" timestamp(3) with time zone,
  	"course_end_date" timestamp(3) with time zone,
  	"estimated_duration" numeric,
  	"difficulty_level" "enum_courses_difficulty_level" DEFAULT 'beginner',
  	"language" "enum_courses_language" DEFAULT 'en',
  	"passing_grade" numeric DEFAULT 70,
  	"status" "enum_courses_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"settings" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"instructors_id" integer
  );
  
  CREATE TABLE "course_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"parent_id" integer,
  	"category_type" "enum_course_categories_category_type" DEFAULT 'course' NOT NULL,
  	"icon_id" integer,
  	"color_code" varchar,
  	"display_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_enrollments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"enrolled_at" timestamp(3) with time zone,
  	"enrollment_type" "enum_course_enrollments_enrollment_type" DEFAULT 'free' NOT NULL,
  	"status" "enum_course_enrollments_status" DEFAULT 'active' NOT NULL,
  	"payment_status" "enum_course_enrollments_payment_status" DEFAULT 'completed',
  	"access_expires_at" timestamp(3) with time zone,
  	"amount_paid" numeric,
  	"progress_percentage" numeric DEFAULT 0,
  	"last_accessed_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"current_grade" numeric,
  	"final_grade" numeric,
  	"certificate_issued" boolean DEFAULT false,
  	"enrolled_by_id" integer,
  	"notes" varchar,
  	"display_title" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "admins_department_access" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_relationships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "admins_department_access" CASCADE;
  DROP TABLE "user_relationships" CASCADE;
  DROP TABLE "services_tags" CASCADE;
  DROP TABLE "services" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_relationships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "payload_locked_documents_rels_user_relationships_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "emergency_contacts" ALTER COLUMN "middle_name" DROP NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_enrollments_id" integer;
  ALTER TABLE "courses_learning_objectives" ADD CONSTRAINT "courses_learning_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_prerequisites" ADD CONSTRAINT "courses_prerequisites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_parent_id_course_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_student_id_trainees_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_enrolled_by_id_users_id_fk" FOREIGN KEY ("enrolled_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "courses_learning_objectives_order_idx" ON "courses_learning_objectives" USING btree ("_order");
  CREATE INDEX "courses_learning_objectives_parent_id_idx" ON "courses_learning_objectives" USING btree ("_parent_id");
  CREATE INDEX "courses_prerequisites_order_idx" ON "courses_prerequisites" USING btree ("_order");
  CREATE INDEX "courses_prerequisites_parent_id_idx" ON "courses_prerequisites" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_course_code_idx" ON "courses" USING btree ("course_code");
  CREATE INDEX "courses_instructor_idx" ON "courses" USING btree ("instructor_id");
  CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category_id");
  CREATE INDEX "courses_thumbnail_idx" ON "courses" USING btree ("thumbnail_id");
  CREATE INDEX "courses_banner_image_idx" ON "courses" USING btree ("banner_image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_instructors_id_idx" ON "courses_rels" USING btree ("instructors_id");
  CREATE UNIQUE INDEX "course_categories_slug_idx" ON "course_categories" USING btree ("slug");
  CREATE INDEX "course_categories_parent_idx" ON "course_categories" USING btree ("parent_id");
  CREATE INDEX "course_categories_icon_idx" ON "course_categories" USING btree ("icon_id");
  CREATE INDEX "course_categories_updated_at_idx" ON "course_categories" USING btree ("updated_at");
  CREATE INDEX "course_categories_created_at_idx" ON "course_categories" USING btree ("created_at");
  CREATE INDEX "course_enrollments_student_idx" ON "course_enrollments" USING btree ("student_id");
  CREATE INDEX "course_enrollments_course_idx" ON "course_enrollments" USING btree ("course_id");
  CREATE INDEX "course_enrollments_enrolled_by_idx" ON "course_enrollments" USING btree ("enrolled_by_id");
  CREATE INDEX "course_enrollments_updated_at_idx" ON "course_enrollments" USING btree ("updated_at");
  CREATE INDEX "course_enrollments_created_at_idx" ON "course_enrollments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_enrollments_fk" FOREIGN KEY ("course_enrollments_id") REFERENCES "public"."course_enrollments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_course_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("course_categories_id");
  CREATE INDEX "payload_locked_documents_rels_course_enrollments_id_idx" ON "payload_locked_documents_rels" USING btree ("course_enrollments_id");
  ALTER TABLE "users" DROP COLUMN "bio";
  ALTER TABLE "users" DROP COLUMN "phone";
  ALTER TABLE "users" DROP COLUMN "profile_image_url";
  ALTER TABLE "users" DROP COLUMN "emergency_contact";
  ALTER TABLE "users" DROP COLUMN "preferences";
  ALTER TABLE "users" DROP COLUMN "metadata";
  ALTER TABLE "trainees" DROP COLUMN "graduation_target_date";
  ALTER TABLE "trainees" DROP COLUMN "learning_path";
  ALTER TABLE "media" DROP COLUMN "cloudinary_u_r_l";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_relationships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  DROP TYPE "public"."enum_user_relationships_related_entity_type";
  DROP TYPE "public"."enum_user_relationships_relationship_type";
  DROP TYPE "public"."enum_services_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_user_relationships_related_entity_type" AS ENUM('course', 'department', 'project', 'group');
  CREATE TYPE "public"."enum_user_relationships_relationship_type" AS ENUM('enrolled', 'teaching', 'managing', 'supervising', 'member');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TABLE "admins_department_access" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"department" varchar
  );
  
  CREATE TABLE "user_relationships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"related_entity_type" "enum_user_relationships_related_entity_type" NOT NULL,
  	"related_entity_id" numeric NOT NULL,
  	"relationship_type" "enum_user_relationships_relationship_type" NOT NULL,
  	"relationship_data" jsonb,
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
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"excerpt" varchar,
  	"featured_image_id" integer,
  	"status" "enum_services_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_focus_keyword" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "courses_learning_objectives" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_prerequisites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "course_enrollments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses_learning_objectives" CASCADE;
  DROP TABLE "courses_prerequisites" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "course_categories" CASCADE;
  DROP TABLE "course_enrollments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_enrollments_fk";
  
  DROP INDEX "payload_locked_documents_rels_courses_id_idx";
  DROP INDEX "payload_locked_documents_rels_course_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_course_enrollments_id_idx";
  ALTER TABLE "emergency_contacts" ALTER COLUMN "middle_name" SET NOT NULL;
  ALTER TABLE "users" ADD COLUMN "bio" varchar;
  ALTER TABLE "users" ADD COLUMN "phone" varchar;
  ALTER TABLE "users" ADD COLUMN "profile_image_url" varchar;
  ALTER TABLE "users" ADD COLUMN "emergency_contact" varchar;
  ALTER TABLE "users" ADD COLUMN "preferences" jsonb;
  ALTER TABLE "users" ADD COLUMN "metadata" jsonb;
  ALTER TABLE "trainees" ADD COLUMN "graduation_target_date" timestamp(3) with time zone;
  ALTER TABLE "trainees" ADD COLUMN "learning_path" varchar;
  ALTER TABLE "media" ADD COLUMN "cloudinary_u_r_l" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_relationships_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "admins_department_access" ADD CONSTRAINT "admins_department_access_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_tags" ADD CONSTRAINT "services_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "admins_department_access_order_idx" ON "admins_department_access" USING btree ("_order");
  CREATE INDEX "admins_department_access_parent_id_idx" ON "admins_department_access" USING btree ("_parent_id");
  CREATE INDEX "user_relationships_user_idx" ON "user_relationships" USING btree ("user_id");
  CREATE INDEX "user_relationships_updated_at_idx" ON "user_relationships" USING btree ("updated_at");
  CREATE INDEX "user_relationships_created_at_idx" ON "user_relationships" USING btree ("created_at");
  CREATE INDEX "services_tags_order_idx" ON "services_tags" USING btree ("_order");
  CREATE INDEX "services_tags_parent_id_idx" ON "services_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_featured_image_idx" ON "services" USING btree ("featured_image_id");
  CREATE INDEX "services_author_idx" ON "services" USING btree ("author_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_relationships_fk" FOREIGN KEY ("user_relationships_id") REFERENCES "public"."user_relationships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_user_relationships_id_idx" ON "payload_locked_documents_rels" USING btree ("user_relationships_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "courses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_enrollments_id";
  DROP TYPE "public"."enum_courses_difficulty_level";
  DROP TYPE "public"."enum_courses_language";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum_course_categories_category_type";
  DROP TYPE "public"."enum_course_enrollments_enrollment_type";
  DROP TYPE "public"."enum_course_enrollments_status";
  DROP TYPE "public"."enum_course_enrollments_payment_status";`)
}
