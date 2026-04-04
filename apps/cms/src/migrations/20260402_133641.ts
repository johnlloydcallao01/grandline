import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_chats_type" AS ENUM('direct', 'group');
  CREATE TYPE "public"."enum_chat_messages_content_type" AS ENUM('text', 'image', 'file', 'system');
  CREATE TYPE "public"."enum_chat_message_status_status" AS ENUM('delivered', 'read');
  CREATE TABLE "chats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_chats_type" DEFAULT 'direct' NOT NULL,
  	"title" varchar,
  	"created_by_id" integer,
  	"last_message_at" timestamp(3) with time zone,
  	"last_message_preview" varchar,
  	"is_archived" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chats_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "chat_messages_reactions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"emoji" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "chat_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"chat_id" integer NOT NULL,
  	"sender_id" integer NOT NULL,
  	"content" jsonb NOT NULL,
  	"content_type" "enum_chat_messages_content_type" DEFAULT 'text',
  	"reply_to_id" integer,
  	"edited_at" timestamp(3) with time zone,
  	"is_deleted" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chat_messages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "chat_message_status" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"message_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"status" "enum_chat_message_status_status" DEFAULT 'delivered' NOT NULL,
  	"delivered_at" timestamp(3) with time zone,
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chat_typing_status" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"chat_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"is_typing" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chats_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chat_messages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chat_message_status_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chat_typing_status_id" integer;
  ALTER TABLE "chats" ADD CONSTRAINT "chats_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chats_rels" ADD CONSTRAINT "chats_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chats_rels" ADD CONSTRAINT "chats_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_messages_reactions" ADD CONSTRAINT "chat_messages_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages_reactions" ADD CONSTRAINT "chat_messages_reactions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_chat_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages_rels" ADD CONSTRAINT "chat_messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_messages_rels" ADD CONSTRAINT "chat_messages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_message_status" ADD CONSTRAINT "chat_message_status_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_message_status" ADD CONSTRAINT "chat_message_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_typing_status" ADD CONSTRAINT "chat_typing_status_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_typing_status" ADD CONSTRAINT "chat_typing_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "chats_created_by_idx" ON "chats" USING btree ("created_by_id");
  CREATE INDEX "chats_updated_at_idx" ON "chats" USING btree ("updated_at");
  CREATE INDEX "chats_created_at_idx" ON "chats" USING btree ("created_at");
  CREATE INDEX "chats_rels_order_idx" ON "chats_rels" USING btree ("order");
  CREATE INDEX "chats_rels_parent_idx" ON "chats_rels" USING btree ("parent_id");
  CREATE INDEX "chats_rels_path_idx" ON "chats_rels" USING btree ("path");
  CREATE INDEX "chats_rels_users_id_idx" ON "chats_rels" USING btree ("users_id");
  CREATE INDEX "chat_messages_reactions_order_idx" ON "chat_messages_reactions" USING btree ("_order");
  CREATE INDEX "chat_messages_reactions_parent_id_idx" ON "chat_messages_reactions" USING btree ("_parent_id");
  CREATE INDEX "chat_messages_reactions_user_idx" ON "chat_messages_reactions" USING btree ("user_id");
  CREATE INDEX "chat_messages_chat_idx" ON "chat_messages" USING btree ("chat_id");
  CREATE INDEX "chat_messages_sender_idx" ON "chat_messages" USING btree ("sender_id");
  CREATE INDEX "chat_messages_reply_to_idx" ON "chat_messages" USING btree ("reply_to_id");
  CREATE INDEX "chat_messages_updated_at_idx" ON "chat_messages" USING btree ("updated_at");
  CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");
  CREATE INDEX "chat_messages_rels_order_idx" ON "chat_messages_rels" USING btree ("order");
  CREATE INDEX "chat_messages_rels_parent_idx" ON "chat_messages_rels" USING btree ("parent_id");
  CREATE INDEX "chat_messages_rels_path_idx" ON "chat_messages_rels" USING btree ("path");
  CREATE INDEX "chat_messages_rels_media_id_idx" ON "chat_messages_rels" USING btree ("media_id");
  CREATE INDEX "chat_message_status_message_idx" ON "chat_message_status" USING btree ("message_id");
  CREATE INDEX "chat_message_status_user_idx" ON "chat_message_status" USING btree ("user_id");
  CREATE INDEX "chat_message_status_updated_at_idx" ON "chat_message_status" USING btree ("updated_at");
  CREATE INDEX "chat_message_status_created_at_idx" ON "chat_message_status" USING btree ("created_at");
  CREATE INDEX "chat_typing_status_chat_idx" ON "chat_typing_status" USING btree ("chat_id");
  CREATE INDEX "chat_typing_status_user_idx" ON "chat_typing_status" USING btree ("user_id");
  CREATE INDEX "chat_typing_status_created_at_idx" ON "chat_typing_status" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chats_fk" FOREIGN KEY ("chats_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_messages_fk" FOREIGN KEY ("chat_messages_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_message_status_fk" FOREIGN KEY ("chat_message_status_id") REFERENCES "public"."chat_message_status"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_typing_status_fk" FOREIGN KEY ("chat_typing_status_id") REFERENCES "public"."chat_typing_status"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_chats_id_idx" ON "payload_locked_documents_rels" USING btree ("chats_id");
  CREATE INDEX "payload_locked_documents_rels_chat_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_messages_id");
  CREATE INDEX "payload_locked_documents_rels_chat_message_status_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_message_status_id");
  CREATE INDEX "payload_locked_documents_rels_chat_typing_status_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_typing_status_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chats_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_messages_reactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_messages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_message_status" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_typing_status" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "chats" CASCADE;
  DROP TABLE "chats_rels" CASCADE;
  DROP TABLE "chat_messages_reactions" CASCADE;
  DROP TABLE "chat_messages" CASCADE;
  DROP TABLE "chat_messages_rels" CASCADE;
  DROP TABLE "chat_message_status" CASCADE;
  DROP TABLE "chat_typing_status" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chats_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chat_messages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chat_message_status_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chat_typing_status_fk";
  
  DROP INDEX "payload_locked_documents_rels_chats_id_idx";
  DROP INDEX "payload_locked_documents_rels_chat_messages_id_idx";
  DROP INDEX "payload_locked_documents_rels_chat_message_status_id_idx";
  DROP INDEX "payload_locked_documents_rels_chat_typing_status_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chats_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chat_messages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chat_message_status_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chat_typing_status_id";
  DROP TYPE "public"."enum_chats_type";
  DROP TYPE "public"."enum_chat_messages_content_type";
  DROP TYPE "public"."enum_chat_message_status_status";`)
}
