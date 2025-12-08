import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE recent_searches ALTER COLUMN scope DROP DEFAULT;
    ALTER TABLE recent_searches ALTER COLUMN scope TYPE varchar USING scope::text;
    ALTER TABLE recent_searches ALTER COLUMN scope SET DEFAULT 'courses';
    UPDATE recent_searches SET scope = 'courses' WHERE scope = 'restaurants';
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_recent_searches_scope'
      ) THEN
        DROP TYPE "public"."enum_recent_searches_scope";
      END IF;
    END$$;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_recent_searches_scope" AS ENUM('restaurants');
    ALTER TABLE recent_searches ALTER COLUMN scope DROP DEFAULT;
    ALTER TABLE recent_searches ALTER COLUMN scope TYPE "public"."enum_recent_searches_scope" USING scope::"public"."enum_recent_searches_scope";
    ALTER TABLE recent_searches ALTER COLUMN scope SET DEFAULT 'restaurants';
  `)
}

