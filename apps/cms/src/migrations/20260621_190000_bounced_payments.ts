import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_accounting_bounced_payments_bounce_reason" AS ENUM(
      'insufficient_funds',
      'account_closed',
      'payment_recalled',
      'stop_payment',
      'invalid_account',
      'bank_error',
      'other'
    );
    CREATE TYPE "public"."enum_accounting_bounced_payments_case_status" AS ENUM(
      'open',
      'awaiting_reversal',
      'collections_follow_up',
      'resolved',
      'written_off'
    );

    CREATE TABLE "accounting_bounced_payments" (
      "id" serial PRIMARY KEY NOT NULL,
      "case_number" varchar NOT NULL,
      "original_payment_id" integer NOT NULL,
      "customer_id" integer NOT NULL,
      "original_receipt_number" varchar NOT NULL,
      "original_payment_date" timestamp(3) with time zone,
      "original_payment_amount" numeric DEFAULT 0,
      "original_deposit_account_id" integer,
      "original_journal_entry_id" integer NOT NULL,
      "bounce_date" timestamp(3) with time zone NOT NULL,
      "bank_notice_date" timestamp(3) with time zone,
      "bounce_reason" "enum_accounting_bounced_payments_bounce_reason" DEFAULT 'insufficient_funds' NOT NULL,
      "case_status" "enum_accounting_bounced_payments_case_status" DEFAULT 'open' NOT NULL,
      "bank_charge_amount" numeric DEFAULT 0,
      "charge_expense_account_id" integer,
      "reversal_journal_entry_id" integer,
      "charge_journal_entry_id" integer,
      "recovery_payment_id" integer,
      "recovery_date" timestamp(3) with time zone,
      "follow_up_date" timestamp(3) with time zone,
      "resolution_date" timestamp(3) with time zone,
      "notes" varchar,
      "resolution_notes" varchar,
      "created_by_id" integer,
      "updated_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_original_payment_id_accounting_payments_received_id_fk"
      FOREIGN KEY ("original_payment_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_customer_id_accounting_customers_id_fk"
      FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_original_deposit_account_id_accounting_bank_accounts_id_fk"
      FOREIGN KEY ("original_deposit_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_original_journal_entry_id_accounting_journal_entries_id_fk"
      FOREIGN KEY ("original_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_charge_expense_account_id_accounting_chart_of_accounts_id_fk"
      FOREIGN KEY ("charge_expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_reversal_journal_entry_id_accounting_journal_entries_id_fk"
      FOREIGN KEY ("reversal_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_charge_journal_entry_id_accounting_journal_entries_id_fk"
      FOREIGN KEY ("charge_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_recovery_payment_id_accounting_payments_received_id_fk"
      FOREIGN KEY ("recovery_payment_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_created_by_id_users_id_fk"
      FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bounced_payments"
      ADD CONSTRAINT "accounting_bounced_payments_updated_by_id_users_id_fk"
      FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "accounting_bounced_payments_case_number_idx"
      ON "accounting_bounced_payments" USING btree ("case_number");
    CREATE INDEX "accounting_bounced_payments_original_payment_idx"
      ON "accounting_bounced_payments" USING btree ("original_payment_id");
    CREATE INDEX "accounting_bounced_payments_customer_idx"
      ON "accounting_bounced_payments" USING btree ("customer_id");
    CREATE INDEX "accounting_bounced_payments_original_receipt_number_idx"
      ON "accounting_bounced_payments" USING btree ("original_receipt_number");
    CREATE INDEX "accounting_bounced_payments_original_deposit_account_idx"
      ON "accounting_bounced_payments" USING btree ("original_deposit_account_id");
    CREATE INDEX "accounting_bounced_payments_original_journal_entry_idx"
      ON "accounting_bounced_payments" USING btree ("original_journal_entry_id");
    CREATE INDEX "accounting_bounced_payments_bounce_date_idx"
      ON "accounting_bounced_payments" USING btree ("bounce_date");
    CREATE INDEX "accounting_bounced_payments_bounce_reason_idx"
      ON "accounting_bounced_payments" USING btree ("bounce_reason");
    CREATE INDEX "accounting_bounced_payments_case_status_idx"
      ON "accounting_bounced_payments" USING btree ("case_status");
    CREATE INDEX "accounting_bounced_payments_reversal_journal_entry_idx"
      ON "accounting_bounced_payments" USING btree ("reversal_journal_entry_id");
    CREATE INDEX "accounting_bounced_payments_charge_journal_entry_idx"
      ON "accounting_bounced_payments" USING btree ("charge_journal_entry_id");
    CREATE INDEX "accounting_bounced_payments_recovery_payment_idx"
      ON "accounting_bounced_payments" USING btree ("recovery_payment_id");
    CREATE INDEX "accounting_bounced_payments_created_by_idx"
      ON "accounting_bounced_payments" USING btree ("created_by_id");
    CREATE INDEX "accounting_bounced_payments_updated_by_idx"
      ON "accounting_bounced_payments" USING btree ("updated_by_id");
    CREATE INDEX "accounting_bounced_payments_updated_at_idx"
      ON "accounting_bounced_payments" USING btree ("updated_at");
    CREATE INDEX "accounting_bounced_payments_created_at_idx"
      ON "accounting_bounced_payments" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "accounting_bounced_payments_case_number_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_original_payment_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_customer_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_original_receipt_number_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_original_deposit_account_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_original_journal_entry_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_bounce_date_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_bounce_reason_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_case_status_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_reversal_journal_entry_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_charge_journal_entry_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_recovery_payment_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_created_by_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_updated_by_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_updated_at_idx";
    DROP INDEX IF EXISTS "accounting_bounced_payments_created_at_idx";

    DROP TABLE IF EXISTS "accounting_bounced_payments" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_accounting_bounced_payments_bounce_reason";
    DROP TYPE IF EXISTS "public"."enum_accounting_bounced_payments_case_status";
  `)
}
