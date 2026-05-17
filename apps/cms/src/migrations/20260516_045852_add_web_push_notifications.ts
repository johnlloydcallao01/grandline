import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_web_push_subscriptions_permission_state" AS ENUM('default', 'granted', 'denied');
  CREATE TABLE "web_push_subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"p256dh" varchar NOT NULL,
  	"auth" varchar NOT NULL,
  	"user_agent" varchar,
  	"browser" varchar,
  	"platform" varchar,
  	"device_label" varchar,
  	"permission_state" "enum_web_push_subscriptions_permission_state" DEFAULT 'granted' NOT NULL,
  	"is_active" boolean DEFAULT true NOT NULL,
  	"last_seen_at" timestamp(3) with time zone,
  	"last_subscribed_at" timestamp(3) with time zone,
  	"last_success_at" timestamp(3) with time zone,
  	"last_failure_at" timestamp(3) with time zone,
  	"failure_reason" varchar,
  	"subscription_j_s_o_n" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "emergency_contacts_user_idx";
  ALTER TABLE "users" ADD COLUMN "push_notifications_enabled" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "web_push_subscriptions_id" integer;
  ALTER TABLE "web_push_subscriptions" ADD CONSTRAINT "web_push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "web_push_subscriptions_user_idx" ON "web_push_subscriptions" USING btree ("user_id");
  CREATE INDEX "web_push_subscriptions_updated_at_idx" ON "web_push_subscriptions" USING btree ("updated_at");
  CREATE INDEX "web_push_subscriptions_created_at_idx" ON "web_push_subscriptions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_web_push_subscriptions_fk" FOREIGN KEY ("web_push_subscriptions_id") REFERENCES "public"."web_push_subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_web_push_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("web_push_subscriptions_id");
  CREATE UNIQUE INDEX "emergency_contacts_user_idx" ON "emergency_contacts" USING btree ("user_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "web_push_subscriptions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "web_push_subscriptions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_web_push_subscriptions_fk";
  
  DROP INDEX "payload_locked_documents_rels_web_push_subscriptions_id_idx";
  DROP INDEX "emergency_contacts_user_idx";
  CREATE INDEX "emergency_contacts_user_idx" ON "emergency_contacts" USING btree ("user_id");
  ALTER TABLE "users" DROP COLUMN "push_notifications_enabled";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "web_push_subscriptions_id";
  DROP TYPE "public"."enum_web_push_subscriptions_permission_state";`)
}
