import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "post_tags" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR NOT NULL,
      "slug" VARCHAR NOT NULL,
      "description" VARCHAR,
      "color_code" VARCHAR,
      "display_order" NUMERIC DEFAULT 0,
      "is_active" BOOLEAN DEFAULT true,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "post_tags_slug_idx" ON "post_tags" ("slug");
    CREATE INDEX IF NOT EXISTS "post_tags_updated_at_idx" ON "post_tags" ("updated_at");
    CREATE INDEX IF NOT EXISTS "post_tags_created_at_idx" ON "post_tags" ("created_at");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "post_tags_slug_idx";
    DROP INDEX IF EXISTS "post_tags_updated_at_idx";
    DROP INDEX IF EXISTS "post_tags_created_at_idx";
    DROP TABLE IF EXISTS "post_tags";
  `)
}
