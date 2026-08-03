import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Add visibility enum (shared/private) and uploadedBy single relationship to users.
  // Payload names single-relationship FK columns with a "_id" suffix
  // (field uploadedBy -> column uploaded_by_id), matching the assignments
  // createdBy -> created_by_id convention.
  await db.execute(sql`
   DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_media_visibility') THEN
       CREATE TYPE "public"."enum_media_visibility" AS ENUM('shared', 'private');
     END IF;
   END $$;

   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "visibility" "public"."enum_media_visibility" DEFAULT 'shared';
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "uploaded_by_id" integer;
   ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk"
     FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX IF NOT EXISTS "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_uploaded_by_id_users_id_fk";
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_uploaded_by_idx";
  `)
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "uploaded_by_id";
  `)
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "visibility";
  `)
  await db.execute(sql`
    DROP TYPE IF EXISTS "public"."enum_media_visibility";
  `)
}
