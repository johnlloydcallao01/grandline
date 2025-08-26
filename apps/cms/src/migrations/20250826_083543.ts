import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trainees_current_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_admins_admin_level" AS ENUM('system', 'department', 'content');
  CREATE TYPE "public"."enum_user_relationships_related_entity_type" AS ENUM('course', 'department', 'project', 'group');
  CREATE TYPE "public"."enum_user_relationships_relationship_type" AS ENUM('enrolled', 'teaching', 'managing', 'supervising', 'member');
  CREATE TYPE "public"."enum_user_events_event_type" AS ENUM('USER_CREATED', 'ROLE_CHANGED', 'PROFILE_UPDATED', 'USER_DEACTIVATED', 'USER_REACTIVATED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_CHANGED');
  CREATE TABLE "admins_department_access" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"department" varchar
  );
  
  CREATE TABLE "user_certifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"certification_name" varchar NOT NULL,
  	"issuing_authority" varchar,
  	"issue_date" timestamp(3) with time zone,
  	"expiry_date" timestamp(3) with time zone,
  	"verification_url" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  CREATE TABLE "user_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"event_type" "enum_user_events_event_type" NOT NULL,
  	"event_data" jsonb NOT NULL,
  	"triggered_by_id" integer,
  	"timestamp" timestamp(3) with time zone,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "bio" varchar;
  ALTER TABLE "users" ADD COLUMN "phone" varchar;
  ALTER TABLE "users" ADD COLUMN "profile_image_url" varchar;
  ALTER TABLE "users" ADD COLUMN "emergency_contact" varchar;
  ALTER TABLE "users" ADD COLUMN "preferences" jsonb;
  ALTER TABLE "users" ADD COLUMN "metadata" jsonb;
  ALTER TABLE "instructors" ADD COLUMN "teaching_permissions" jsonb;
  ALTER TABLE "trainees" ADD COLUMN "enrollment_date" timestamp(3) with time zone;
  ALTER TABLE "trainees" ADD COLUMN "current_level" "enum_trainees_current_level" DEFAULT 'beginner';
  ALTER TABLE "trainees" ADD COLUMN "graduation_target_date" timestamp(3) with time zone;
  ALTER TABLE "trainees" ADD COLUMN "learning_path" varchar;
  ALTER TABLE "admins" ADD COLUMN "admin_level" "enum_admins_admin_level" DEFAULT 'content' NOT NULL;
  ALTER TABLE "admins" ADD COLUMN "system_permissions" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_certifications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_relationships_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_events_id" integer;
  ALTER TABLE "admins_department_access" ADD CONSTRAINT "admins_department_access_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_events" ADD CONSTRAINT "user_events_triggered_by_id_users_id_fk" FOREIGN KEY ("triggered_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "admins_department_access_order_idx" ON "admins_department_access" USING btree ("_order");
  CREATE INDEX "admins_department_access_parent_id_idx" ON "admins_department_access" USING btree ("_parent_id");
  CREATE INDEX "user_certifications_user_idx" ON "user_certifications" USING btree ("user_id");
  CREATE INDEX "user_certifications_updated_at_idx" ON "user_certifications" USING btree ("updated_at");
  CREATE INDEX "user_certifications_created_at_idx" ON "user_certifications" USING btree ("created_at");
  CREATE INDEX "user_relationships_user_idx" ON "user_relationships" USING btree ("user_id");
  CREATE INDEX "user_relationships_updated_at_idx" ON "user_relationships" USING btree ("updated_at");
  CREATE INDEX "user_relationships_created_at_idx" ON "user_relationships" USING btree ("created_at");
  CREATE INDEX "user_events_user_idx" ON "user_events" USING btree ("user_id");
  CREATE INDEX "user_events_triggered_by_idx" ON "user_events" USING btree ("triggered_by_id");
  CREATE INDEX "user_events_updated_at_idx" ON "user_events" USING btree ("updated_at");
  CREATE INDEX "user_events_created_at_idx" ON "user_events" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_certifications_fk" FOREIGN KEY ("user_certifications_id") REFERENCES "public"."user_certifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_relationships_fk" FOREIGN KEY ("user_relationships_id") REFERENCES "public"."user_relationships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_events_fk" FOREIGN KEY ("user_events_id") REFERENCES "public"."user_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_user_certifications_id_idx" ON "payload_locked_documents_rels" USING btree ("user_certifications_id");
  CREATE INDEX "payload_locked_documents_rels_user_relationships_id_idx" ON "payload_locked_documents_rels" USING btree ("user_relationships_id");
  CREATE INDEX "payload_locked_documents_rels_user_events_id_idx" ON "payload_locked_documents_rels" USING btree ("user_events_id");
  ALTER TABLE "instructors" DROP COLUMN "bio";
  ALTER TABLE "instructors" DROP COLUMN "is_active";
  ALTER TABLE "trainees" DROP COLUMN "is_active";
  ALTER TABLE "admins" DROP COLUMN "is_active";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "admins_department_access" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_certifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_relationships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "user_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "admins_department_access" CASCADE;
  DROP TABLE "user_certifications" CASCADE;
  DROP TABLE "user_relationships" CASCADE;
  DROP TABLE "user_events" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_certifications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_relationships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_events_fk";
  
  DROP INDEX "payload_locked_documents_rels_user_certifications_id_idx";
  DROP INDEX "payload_locked_documents_rels_user_relationships_id_idx";
  DROP INDEX "payload_locked_documents_rels_user_events_id_idx";
  ALTER TABLE "instructors" ADD COLUMN "bio" varchar;
  ALTER TABLE "instructors" ADD COLUMN "is_active" boolean DEFAULT true;
  ALTER TABLE "trainees" ADD COLUMN "is_active" boolean DEFAULT true;
  ALTER TABLE "admins" ADD COLUMN "is_active" boolean DEFAULT true;
  ALTER TABLE "users" DROP COLUMN "bio";
  ALTER TABLE "users" DROP COLUMN "phone";
  ALTER TABLE "users" DROP COLUMN "profile_image_url";
  ALTER TABLE "users" DROP COLUMN "emergency_contact";
  ALTER TABLE "users" DROP COLUMN "preferences";
  ALTER TABLE "users" DROP COLUMN "metadata";
  ALTER TABLE "instructors" DROP COLUMN "teaching_permissions";
  ALTER TABLE "trainees" DROP COLUMN "enrollment_date";
  ALTER TABLE "trainees" DROP COLUMN "current_level";
  ALTER TABLE "trainees" DROP COLUMN "graduation_target_date";
  ALTER TABLE "trainees" DROP COLUMN "learning_path";
  ALTER TABLE "admins" DROP COLUMN "admin_level";
  ALTER TABLE "admins" DROP COLUMN "system_permissions";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_certifications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_relationships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_events_id";
  DROP TYPE "public"."enum_trainees_current_level";
  DROP TYPE "public"."enum_admins_admin_level";
  DROP TYPE "public"."enum_user_relationships_related_entity_type";
  DROP TYPE "public"."enum_user_relationships_relationship_type";
  DROP TYPE "public"."enum_user_events_event_type";`)
}
