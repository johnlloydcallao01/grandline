import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "post_comments" (
      "id" SERIAL PRIMARY KEY,
      "post_id" INTEGER NOT NULL,
      "parent_id" INTEGER,
      "content" VARCHAR NOT NULL,
      "author_id" INTEGER,
      "author_name" VARCHAR,
      "author_email" VARCHAR,
      "status" VARCHAR DEFAULT 'pending' NOT NULL,
      "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "post_comments_post_idx" ON "post_comments" ("post_id");
    CREATE INDEX IF NOT EXISTS "post_comments_parent_idx" ON "post_comments" ("parent_id");
    CREATE INDEX IF NOT EXISTS "post_comments_status_idx" ON "post_comments" ("status");
    CREATE INDEX IF NOT EXISTS "post_comments_updated_at_idx" ON "post_comments" ("updated_at");
    CREATE INDEX IF NOT EXISTS "post_comments_created_at_idx" ON "post_comments" ("created_at");

    DO $$ BEGIN
      ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk"
        FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_post_comments_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_author_id_users_id_fk"
        FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "post_comments" DROP CONSTRAINT IF EXISTS "post_comments_post_id_posts_id_fk";
    ALTER TABLE "post_comments" DROP CONSTRAINT IF EXISTS "post_comments_parent_id_post_comments_id_fk";
    ALTER TABLE "post_comments" DROP CONSTRAINT IF EXISTS "post_comments_author_id_users_id_fk";
    DROP INDEX IF EXISTS "post_comments_post_idx";
    DROP INDEX IF EXISTS "post_comments_parent_idx";
    DROP INDEX IF EXISTS "post_comments_status_idx";
    DROP INDEX IF EXISTS "post_comments_updated_at_idx";
    DROP INDEX IF EXISTS "post_comments_created_at_idx";
    DROP TABLE IF EXISTS "post_comments";
  `)
}
