import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_permissions" CASCADE;
  ALTER TABLE "admins" DROP COLUMN "department";
  ALTER TABLE "admins" DROP COLUMN "admin_level";
  ALTER TABLE "admins" DROP COLUMN "hire_date";
  ALTER TABLE "admins" DROP COLUMN "office_location";
  ALTER TABLE "admins" DROP COLUMN "direct_reports";
  DROP TYPE "public"."enum_admins_permissions";
  DROP TYPE "public"."enum_admins_admin_level";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_admins_permissions" AS ENUM('user_management', 'course_management', 'content_management', 'system_settings', 'reports_access');
  CREATE TYPE "public"."enum_admins_admin_level" AS ENUM('system', 'department', 'content');
  CREATE TABLE "admins_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_admins_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "admins" ADD COLUMN "department" varchar NOT NULL;
  ALTER TABLE "admins" ADD COLUMN "admin_level" "enum_admins_admin_level" NOT NULL;
  ALTER TABLE "admins" ADD COLUMN "hire_date" timestamp(3) with time zone;
  ALTER TABLE "admins" ADD COLUMN "office_location" varchar;
  ALTER TABLE "admins" ADD COLUMN "direct_reports" numeric;
  ALTER TABLE "admins_permissions" ADD CONSTRAINT "admins_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_permissions_order_idx" ON "admins_permissions" USING btree ("order");
  CREATE INDEX "admins_permissions_parent_idx" ON "admins_permissions" USING btree ("parent_id");`)
}
