import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_company_members_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_company_members_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "company_members_id";
    DROP TABLE IF EXISTS "company_members" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
    // Safe rollback attempts, though data might be lost
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "company_members" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "middle_name" varchar,
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
    
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_members_id" integer;
    
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_company_members_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_company_members_fk" FOREIGN KEY ("company_members_id") REFERENCES "public"."company_members"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
    
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_company_members_id_idx" ON "payload_locked_documents_rels" USING btree ("company_members_id");
    CREATE INDEX IF NOT EXISTS "company_members_profile_picture_idx" ON "company_members" USING btree ("profile_picture_id");
    CREATE INDEX IF NOT EXISTS "company_members_updated_at_idx" ON "company_members" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "company_members_created_at_idx" ON "company_members" USING btree ("created_at");
  `)
}
