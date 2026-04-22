import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_chats_type" ADD VALUE 'instructor_trainee';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chats" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "chats" ALTER COLUMN "type" SET DEFAULT 'direct'::text;
  DROP TYPE "public"."enum_chats_type";
  CREATE TYPE "public"."enum_chats_type" AS ENUM('direct', 'group');
  ALTER TABLE "chats" ALTER COLUMN "type" SET DEFAULT 'direct'::"public"."enum_chats_type";
  ALTER TABLE "chats" ALTER COLUMN "type" SET DATA TYPE "public"."enum_chats_type" USING "type"::"public"."enum_chats_type";`)
}
