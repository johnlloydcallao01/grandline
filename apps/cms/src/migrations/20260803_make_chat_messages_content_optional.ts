import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db, payload: _payload }: MigrateUpArgs): Promise<void> {
  // Remove NOT NULL constraint from chat_messages.content so image-only
  // messages (no caption) can be stored with an empty paragraph object.
  await db.execute(sql`
    ALTER TABLE "chat_messages" ALTER COLUMN "content" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore NOT NULL constraint. Existing image messages with empty content
  // will need a valid paragraph object (they already have one).
  await db.execute(sql`
    UPDATE "chat_messages" SET "content" = '{"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}'::jsonb WHERE "content" IS NULL;
    ALTER TABLE "chat_messages" ALTER COLUMN "content" SET NOT NULL;
  `)
}
