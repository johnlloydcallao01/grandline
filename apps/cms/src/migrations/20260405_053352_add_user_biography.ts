import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_chats_status" AS ENUM('active', 'archived', 'deleted');
  ALTER TABLE "chats" ADD COLUMN "status" "enum_chats_status" DEFAULT 'active';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chats" DROP COLUMN "status";
  DROP TYPE "public"."enum_chats_status";`)
}
