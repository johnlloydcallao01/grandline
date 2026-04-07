import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Explicitly recreate the wishlists table using IF NOT EXISTS 
  // since the database schema somehow dropped it but payload_migrations did not.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "wishlists" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "course_id" integer NOT NULL,
      "composite_key" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_user_id_users_id_fk') THEN
        ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_course_id_courses_id_fk') THEN
        ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_composite_key_idx" ON "wishlists" USING btree ("composite_key");
    CREATE INDEX IF NOT EXISTS "wishlists_user_id_idx" ON "wishlists" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "wishlists_course_id_idx" ON "wishlists" USING btree ("course_id");
    CREATE INDEX IF NOT EXISTS "wishlists_created_at_idx" ON "wishlists" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "wishlists" CASCADE;
  `)
}
