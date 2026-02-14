import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Remove foreign key from payload_locked_documents_rels if it exists
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_user_certifications_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_certifications_fk";
      END IF;
    END $$;

    -- Drop index if it exists
    DROP INDEX IF EXISTS "payload_locked_documents_rels_user_certifications_id_idx";

    -- Remove column from payload_locked_documents_rels if it exists
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "user_certifications_id";

    -- Drop user_certifications table
    DROP TABLE IF EXISTS "user_certifications" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user_certifications" (
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
    
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "user_certifications_id" integer;
    
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_certifications_user_id_users_id_fk') THEN
        ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "user_certifications_user_idx" ON "user_certifications" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "user_certifications_updated_at_idx" ON "user_certifications" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "user_certifications_created_at_idx" ON "user_certifications" USING btree ("created_at");
    
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_user_certifications_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_certifications_fk" FOREIGN KEY ("user_certifications_id") REFERENCES "public"."user_certifications"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_user_certifications_id_idx" ON "payload_locked_documents_rels" USING btree ("user_certifications_id");
  `)
}
