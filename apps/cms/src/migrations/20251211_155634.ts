import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recent_searches" ALTER COLUMN "scope" SET DATA TYPE varchar;
  ALTER TABLE "recent_searches" ALTER COLUMN "scope" SET DEFAULT 'courses';
  ALTER TABLE "recent_searches" ALTER COLUMN "source" SET DATA TYPE varchar;
  ALTER TABLE "recent_searches" ALTER COLUMN "source" SET DEFAULT 'unknown';
  DROP TYPE IF EXISTS "public"."enum_recent_searches_scope";
  DROP TYPE IF EXISTS "public"."enum_recent_searches_source";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_recent_searches_scope" AS ENUM('restaurants');
  CREATE TYPE "public"."enum_recent_searches_source" AS ENUM('unknown');
  ALTER TABLE "recent_searches" ALTER COLUMN "scope" SET DEFAULT 'restaurants'::"public"."enum_recent_searches_scope";
  ALTER TABLE "recent_searches" ALTER COLUMN "scope" SET DATA TYPE "public"."enum_recent_searches_scope" USING "scope"::"public"."enum_recent_searches_scope";
  ALTER TABLE "recent_searches" ALTER COLUMN "source" SET DEFAULT 'unknown'::"public"."enum_recent_searches_source";
  ALTER TABLE "recent_searches" ALTER COLUMN "source" SET DATA TYPE "public"."enum_recent_searches_source" USING "source"::"public"."enum_recent_searches_source";`)
}

