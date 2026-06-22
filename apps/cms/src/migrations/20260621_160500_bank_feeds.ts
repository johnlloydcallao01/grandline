import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_accounting_bank_feeds_connector_type" AS ENUM('direct_api', 'treasury_hub', 'csv_bridge', 'plaid', 'manual_sync', 'other');
    CREATE TYPE "public"."enum_accounting_bank_feeds_connection_status" AS ENUM('connected', 'sync_delayed', 'action_required', 'disconnected');
    CREATE TYPE "public"."enum_accounting_bank_feeds_health_status" AS ENUM('healthy', 'monitor', 'warning', 'critical');
    CREATE TYPE "public"."enum_accounting_bank_feeds_sync_frequency" AS ENUM('hourly', 'daily', 'manual');

    CREATE TABLE "accounting_bank_feeds" (
      "id" serial PRIMARY KEY NOT NULL,
      "feed_reference" varchar NOT NULL,
      "bank_account_id" integer NOT NULL,
      "connector_type" "enum_accounting_bank_feeds_connector_type" DEFAULT 'direct_api' NOT NULL,
      "connector_name" varchar NOT NULL,
      "provider_reference" varchar,
      "external_account_id" varchar,
      "connection_status" "enum_accounting_bank_feeds_connection_status" DEFAULT 'connected' NOT NULL,
      "health_status" "enum_accounting_bank_feeds_health_status" DEFAULT 'healthy' NOT NULL,
      "sync_frequency" "enum_accounting_bank_feeds_sync_frequency" DEFAULT 'hourly' NOT NULL,
      "last_sync_at" timestamp(3) with time zone,
      "last_successful_sync_at" timestamp(3) with time zone,
      "last_attempted_sync_at" timestamp(3) with time zone,
      "next_scheduled_sync_at" timestamp(3) with time zone,
      "last_imported_row_count" numeric DEFAULT 0,
      "last_imported_transaction_count" numeric DEFAULT 0,
      "feed_rule_set_name" varchar,
      "feed_rule_count" numeric DEFAULT 0,
      "auto_post_rule_count" numeric DEFAULT 0,
      "manual_review_rule_count" numeric DEFAULT 0,
      "last_rule_change_at" timestamp(3) with time zone,
      "sync_delay_minutes" numeric DEFAULT 0,
      "average_sync_latency_seconds" numeric DEFAULT 0,
      "token_expires_at" timestamp(3) with time zone,
      "needs_reconnection" boolean DEFAULT false,
      "disconnect_reason" varchar,
      "last_error_summary" varchar,
      "notes" varchar,
      "metadata" jsonb,
      "created_by_id" integer,
      "updated_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "accounting_bank_feeds"
      ADD CONSTRAINT "accounting_bank_feeds_bank_account_id_accounting_bank_accounts_id_fk"
      FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_feeds"
      ADD CONSTRAINT "accounting_bank_feeds_created_by_id_users_id_fk"
      FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_feeds"
      ADD CONSTRAINT "accounting_bank_feeds_updated_by_id_users_id_fk"
      FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "accounting_bank_feeds_feed_reference_idx"
      ON "accounting_bank_feeds" USING btree ("feed_reference");
    CREATE INDEX "accounting_bank_feeds_bank_account_idx"
      ON "accounting_bank_feeds" USING btree ("bank_account_id");
    CREATE INDEX "accounting_bank_feeds_connector_type_idx"
      ON "accounting_bank_feeds" USING btree ("connector_type");
    CREATE INDEX "accounting_bank_feeds_connection_status_idx"
      ON "accounting_bank_feeds" USING btree ("connection_status");
    CREATE INDEX "accounting_bank_feeds_health_status_idx"
      ON "accounting_bank_feeds" USING btree ("health_status");
    CREATE INDEX "accounting_bank_feeds_sync_frequency_idx"
      ON "accounting_bank_feeds" USING btree ("sync_frequency");
    CREATE INDEX "accounting_bank_feeds_needs_reconnection_idx"
      ON "accounting_bank_feeds" USING btree ("needs_reconnection");
    CREATE INDEX "accounting_bank_feeds_created_by_idx"
      ON "accounting_bank_feeds" USING btree ("created_by_id");
    CREATE INDEX "accounting_bank_feeds_updated_by_idx"
      ON "accounting_bank_feeds" USING btree ("updated_by_id");
    CREATE INDEX "accounting_bank_feeds_updated_at_idx"
      ON "accounting_bank_feeds" USING btree ("updated_at");
    CREATE INDEX "accounting_bank_feeds_created_at_idx"
      ON "accounting_bank_feeds" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "accounting_bank_feeds_feed_reference_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_bank_account_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_connector_type_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_connection_status_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_health_status_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_sync_frequency_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_needs_reconnection_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_created_by_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_updated_by_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_updated_at_idx";
    DROP INDEX IF EXISTS "accounting_bank_feeds_created_at_idx";

    DROP TABLE IF EXISTS "accounting_bank_feeds" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_accounting_bank_feeds_connector_type";
    DROP TYPE IF EXISTS "public"."enum_accounting_bank_feeds_connection_status";
    DROP TYPE IF EXISTS "public"."enum_accounting_bank_feeds_health_status";
    DROP TYPE IF EXISTS "public"."enum_accounting_bank_feeds_sync_frequency";
  `)
}
