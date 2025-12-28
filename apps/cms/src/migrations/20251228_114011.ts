import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "company_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"position" varchar NOT NULL,
  	"bio" varchar,
  	"profile_picture_id" integer,
  	"order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"email" varchar,
  	"linkedin_url" varchar,
  	"twitter_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "company_members_id" integer;
  ALTER TABLE "company_members" ADD CONSTRAINT "company_members_profile_picture_id_media_id_fk" FOREIGN KEY ("profile_picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "company_members_profile_picture_idx" ON "company_members" USING btree ("profile_picture_id");
  CREATE INDEX "company_members_updated_at_idx" ON "company_members" USING btree ("updated_at");
  CREATE INDEX "company_members_created_at_idx" ON "company_members" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_company_members_fk" FOREIGN KEY ("company_members_id") REFERENCES "public"."company_members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_company_members_id_idx" ON "payload_locked_documents_rels" USING btree ("company_members_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company_members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "company_members" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_company_members_fk";
  
  DROP INDEX "payload_locked_documents_rels_company_members_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "company_members_id";`)
}
