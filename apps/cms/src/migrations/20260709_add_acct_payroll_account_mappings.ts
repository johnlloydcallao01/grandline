import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_acct_payroll_account_mappings_entry_type" AS ENUM(
      'salary',
      'contractor',
      'reimbursement',
      'adjustment'
    );

    CREATE TYPE "public"."enum_acct_payroll_account_mappings_status" AS ENUM(
      'draft',
      'approved',
      'posted',
      'voided'
    );

    CREATE TABLE "acct_payroll_account_mappings" (
      "id" serial PRIMARY KEY NOT NULL,
      "entry_type" "enum_acct_payroll_account_mappings_entry_type" DEFAULT 'salary' NOT NULL,
      "person" varchar NOT NULL,
      "expense_account_id" integer NOT NULL,
      "payable_account_id" integer NOT NULL,
      "deduction_amount" numeric DEFAULT 0,
      "status" "enum_acct_payroll_account_mappings_status" DEFAULT 'draft' NOT NULL,
      "notes" varchar,
      "created_by_id" integer,
      "updated_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "acct_payroll_account_mappings"
      ADD CONSTRAINT "acct_payroll_account_mappings_expense_account_id_accounting_chart_of_accounts_id_fk"
      FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "acct_payroll_account_mappings"
      ADD CONSTRAINT "acct_payroll_account_mappings_payable_account_id_accounting_chart_of_accounts_id_fk"
      FOREIGN KEY ("payable_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "acct_payroll_account_mappings"
      ADD CONSTRAINT "acct_payroll_account_mappings_created_by_id_users_id_fk"
      FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "acct_payroll_account_mappings"
      ADD CONSTRAINT "acct_payroll_account_mappings_updated_by_id_users_id_fk"
      FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "acct_payroll_account_mappings_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_acct_payroll_account_mappings_id_fk"
      FOREIGN KEY ("acct_payroll_account_mappings_id") REFERENCES "public"."acct_payroll_account_mappings"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "acct_payroll_account_mappings_entry_type_idx"
      ON "acct_payroll_account_mappings" USING btree ("entry_type");

    CREATE INDEX "acct_payroll_account_mappings_person_idx"
      ON "acct_payroll_account_mappings" USING btree ("person");

    CREATE INDEX "acct_payroll_account_mappings_expense_account_idx"
      ON "acct_payroll_account_mappings" USING btree ("expense_account_id");

    CREATE INDEX "acct_payroll_account_mappings_payable_account_idx"
      ON "acct_payroll_account_mappings" USING btree ("payable_account_id");

    CREATE INDEX "acct_payroll_account_mappings_status_idx"
      ON "acct_payroll_account_mappings" USING btree ("status");

    CREATE INDEX "acct_payroll_account_mappings_created_by_idx"
      ON "acct_payroll_account_mappings" USING btree ("created_by_id");

    CREATE INDEX "acct_payroll_account_mappings_updated_by_idx"
      ON "acct_payroll_account_mappings" USING btree ("updated_by_id");

    CREATE INDEX "acct_payroll_account_mappings_updated_at_idx"
      ON "acct_payroll_account_mappings" USING btree ("updated_at");

    CREATE INDEX "acct_payroll_account_mappings_created_at_idx"
      ON "acct_payroll_account_mappings" USING btree ("created_at");

    CREATE INDEX "payload_locked_documents_rels_acct_payroll_account_mappings_id_idx"
      ON "payload_locked_documents_rels" USING btree ("acct_payroll_account_mappings_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_entry_type_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_person_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_expense_account_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_payable_account_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_status_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_created_by_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_updated_by_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_updated_at_idx";
    DROP INDEX IF EXISTS "acct_payroll_account_mappings_created_at_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_acct_payroll_account_mappings_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_acct_payroll_account_mappings_id_fk";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "acct_payroll_account_mappings_id";

    ALTER TABLE "acct_payroll_account_mappings"
      DROP CONSTRAINT IF EXISTS "acct_payroll_account_mappings_expense_account_id_accounting_chart_of_accounts_id_fk";

    ALTER TABLE "acct_payroll_account_mappings"
      DROP CONSTRAINT IF EXISTS "acct_payroll_account_mappings_payable_account_id_accounting_chart_of_accounts_id_fk";

    ALTER TABLE "acct_payroll_account_mappings"
      DROP CONSTRAINT IF EXISTS "acct_payroll_account_mappings_created_by_id_users_id_fk";

    ALTER TABLE "acct_payroll_account_mappings"
      DROP CONSTRAINT IF EXISTS "acct_payroll_account_mappings_updated_by_id_users_id_fk";

    DROP TABLE IF EXISTS "acct_payroll_account_mappings" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_acct_payroll_account_mappings_entry_type";
    DROP TYPE IF EXISTS "public"."enum_acct_payroll_account_mappings_status";
  `)
}
