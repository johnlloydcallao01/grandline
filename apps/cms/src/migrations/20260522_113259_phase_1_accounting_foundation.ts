import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_accounting_chart_of_accounts_account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'expense');
  CREATE TYPE "public"."enum_accounting_chart_of_accounts_account_sub_type" AS ENUM('cash_and_cash_equivalents', 'bank', 'accounts_receivable', 'prepaid_expense', 'fixed_asset', 'other_asset', 'accounts_payable', 'accrued_liability', 'deferred_revenue', 'tax_payable', 'other_liability', 'owner_equity', 'retained_earnings', 'revenue', 'other_income', 'cost_of_sales', 'operating_expense', 'tax_expense', 'other_expense');
  CREATE TYPE "public"."enum_accounting_chart_of_accounts_normal_balance" AS ENUM('debit', 'credit');
  CREATE TYPE "public"."enum_accounting_fiscal_years_status" AS ENUM('draft', 'open', 'closed');
  CREATE TYPE "public"."enum_accounting_fiscal_years_close_mode" AS ENUM('manual', 'hard_lock');
  CREATE TYPE "public"."enum_accounting_periods_status" AS ENUM('draft', 'open', 'soft_locked', 'closed');
  CREATE TYPE "public"."enum_accounting_tax_codes_scope" AS ENUM('sales', 'purchase', 'both');
  CREATE TYPE "public"."enum_accounting_tax_codes_calculation_method" AS ENUM('exclusive', 'inclusive');
  CREATE TYPE "public"."enum_accounting_journal_entries_source_type" AS ENUM('manual', 'opening_balance', 'adjustment', 'reversal', 'system');
  CREATE TYPE "public"."enum_accounting_journal_entries_status" AS ENUM('draft', 'posted', 'reversed', 'voided');
  CREATE TYPE "public"."enum_accounting_journal_entries_posting_status" AS ENUM('unposted', 'posted', 'reversed', 'voided');
  CREATE TYPE "public"."enum_accounting_settings_opening_balance_source_type" AS ENUM('manual', 'opening_balance', 'adjustment', 'reversal', 'system');
  CREATE TYPE "public"."enum_accounting_settings_default_tax_behavior" AS ENUM('exclusive', 'inclusive');
  CREATE TABLE "accounting_chart_of_accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"account_type" "enum_accounting_chart_of_accounts_account_type" NOT NULL,
  	"account_sub_type" "enum_accounting_chart_of_accounts_account_sub_type",
  	"normal_balance" "enum_accounting_chart_of_accounts_normal_balance" DEFAULT 'debit' NOT NULL,
  	"parent_account_id" integer,
  	"is_active" boolean DEFAULT true,
  	"allow_manual_entries" boolean DEFAULT true,
  	"is_control_account" boolean DEFAULT false,
  	"is_retained_earnings" boolean DEFAULT false,
  	"is_suspense_account" boolean DEFAULT false,
  	"description" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_fiscal_years" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_accounting_fiscal_years_status" DEFAULT 'draft' NOT NULL,
  	"close_mode" "enum_accounting_fiscal_years_close_mode" DEFAULT 'manual' NOT NULL,
  	"locked_from_date" timestamp(3) with time zone,
  	"closed_at" timestamp(3) with time zone,
  	"closed_by_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_periods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fiscal_year_id" integer NOT NULL,
  	"period_number" numeric NOT NULL,
  	"label" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_accounting_periods_status" DEFAULT 'draft' NOT NULL,
  	"locked_from_date" timestamp(3) with time zone,
  	"closed_at" timestamp(3) with time zone,
  	"closed_by_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_tax_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"scope" "enum_accounting_tax_codes_scope" DEFAULT 'both' NOT NULL,
  	"rate" numeric DEFAULT 0 NOT NULL,
  	"calculation_method" "enum_accounting_tax_codes_calculation_method" DEFAULT 'exclusive' NOT NULL,
  	"purchase_account_id" integer,
  	"sales_account_id" integer,
  	"is_active" boolean DEFAULT true,
  	"description" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_journal_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entry_number" varchar NOT NULL,
  	"entry_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"source_type" "enum_accounting_journal_entries_source_type" DEFAULT 'manual' NOT NULL,
  	"source_reference" varchar,
  	"memo" varchar,
  	"reference_number" varchar,
  	"status" "enum_accounting_journal_entries_status" DEFAULT 'draft' NOT NULL,
  	"posting_status" "enum_accounting_journal_entries_posting_status" DEFAULT 'unposted' NOT NULL,
  	"total_debit" numeric DEFAULT 0,
  	"total_credit" numeric DEFAULT 0,
  	"is_balanced" boolean DEFAULT false,
  	"reversal_of_id" integer,
  	"reversed_by_id" integer,
  	"posted_at" timestamp(3) with time zone,
  	"posted_by_id" integer,
  	"approved_by_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_journal_entry_lines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"journal_entry_id" integer NOT NULL,
  	"line_number" numeric NOT NULL,
  	"account_id" integer NOT NULL,
  	"description" varchar,
  	"debit" numeric DEFAULT 0,
  	"credit" numeric DEFAULT 0,
  	"tax_code_id" integer,
  	"reference_entity_type" varchar,
  	"reference_entity_id" varchar,
  	"line_meta" jsonb,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"base_currency" varchar DEFAULT 'PHP' NOT NULL,
  	"timezone" varchar DEFAULT 'Asia/Manila' NOT NULL,
  	"journal_number_prefix" varchar DEFAULT 'JE' NOT NULL,
  	"opening_balance_source_type" "enum_accounting_settings_opening_balance_source_type" DEFAULT 'opening_balance' NOT NULL,
  	"default_suspense_account_id" integer,
  	"retained_earnings_account_id" integer,
  	"allow_backdated_posting" boolean DEFAULT false,
  	"default_tax_behavior" "enum_accounting_settings_default_tax_behavior" DEFAULT 'exclusive' NOT NULL,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_chart_of_accounts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_fiscal_years_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_periods_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_tax_codes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_journal_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_journal_entry_lines_id" integer;
  ALTER TABLE "accounting_chart_of_accounts" ADD CONSTRAINT "accounting_chart_of_accounts_parent_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("parent_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_chart_of_accounts" ADD CONSTRAINT "accounting_chart_of_accounts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_chart_of_accounts" ADD CONSTRAINT "accounting_chart_of_accounts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_fiscal_years" ADD CONSTRAINT "accounting_fiscal_years_closed_by_id_users_id_fk" FOREIGN KEY ("closed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_fiscal_years" ADD CONSTRAINT "accounting_fiscal_years_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_fiscal_years" ADD CONSTRAINT "accounting_fiscal_years_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_closed_by_id_users_id_fk" FOREIGN KEY ("closed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_tax_codes" ADD CONSTRAINT "accounting_tax_codes_purchase_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("purchase_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_tax_codes" ADD CONSTRAINT "accounting_tax_codes_sales_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("sales_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_tax_codes" ADD CONSTRAINT "accounting_tax_codes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_tax_codes" ADD CONSTRAINT "accounting_tax_codes_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_reversal_of_id_accounting_journal_entries_id_fk" FOREIGN KEY ("reversal_of_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_reversed_by_id_accounting_journal_entries_id_fk" FOREIGN KEY ("reversed_by_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_posted_by_id_users_id_fk" FOREIGN KEY ("posted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entry_lines" ADD CONSTRAINT "accounting_journal_entry_lines_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entry_lines" ADD CONSTRAINT "accounting_journal_entry_lines_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entry_lines" ADD CONSTRAINT "accounting_journal_entry_lines_tax_code_id_accounting_tax_codes_id_fk" FOREIGN KEY ("tax_code_id") REFERENCES "public"."accounting_tax_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entry_lines" ADD CONSTRAINT "accounting_journal_entry_lines_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entry_lines" ADD CONSTRAINT "accounting_journal_entry_lines_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_default_suspense_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("default_suspense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_retained_earnings_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("retained_earnings_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "accounting_chart_of_accounts_code_idx" ON "accounting_chart_of_accounts" USING btree ("code");
  CREATE INDEX "accounting_chart_of_accounts_account_type_idx" ON "accounting_chart_of_accounts" USING btree ("account_type");
  CREATE INDEX "accounting_chart_of_accounts_parent_account_idx" ON "accounting_chart_of_accounts" USING btree ("parent_account_id");
  CREATE INDEX "accounting_chart_of_accounts_is_active_idx" ON "accounting_chart_of_accounts" USING btree ("is_active");
  CREATE INDEX "accounting_chart_of_accounts_created_by_idx" ON "accounting_chart_of_accounts" USING btree ("created_by_id");
  CREATE INDEX "accounting_chart_of_accounts_updated_by_idx" ON "accounting_chart_of_accounts" USING btree ("updated_by_id");
  CREATE INDEX "accounting_chart_of_accounts_updated_at_idx" ON "accounting_chart_of_accounts" USING btree ("updated_at");
  CREATE INDEX "accounting_chart_of_accounts_created_at_idx" ON "accounting_chart_of_accounts" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_fiscal_years_code_idx" ON "accounting_fiscal_years" USING btree ("code");
  CREATE INDEX "accounting_fiscal_years_status_idx" ON "accounting_fiscal_years" USING btree ("status");
  CREATE INDEX "accounting_fiscal_years_closed_by_idx" ON "accounting_fiscal_years" USING btree ("closed_by_id");
  CREATE INDEX "accounting_fiscal_years_created_by_idx" ON "accounting_fiscal_years" USING btree ("created_by_id");
  CREATE INDEX "accounting_fiscal_years_updated_by_idx" ON "accounting_fiscal_years" USING btree ("updated_by_id");
  CREATE INDEX "accounting_fiscal_years_updated_at_idx" ON "accounting_fiscal_years" USING btree ("updated_at");
  CREATE INDEX "accounting_fiscal_years_created_at_idx" ON "accounting_fiscal_years" USING btree ("created_at");
  CREATE INDEX "accounting_periods_fiscal_year_idx" ON "accounting_periods" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_periods_status_idx" ON "accounting_periods" USING btree ("status");
  CREATE INDEX "accounting_periods_closed_by_idx" ON "accounting_periods" USING btree ("closed_by_id");
  CREATE INDEX "accounting_periods_created_by_idx" ON "accounting_periods" USING btree ("created_by_id");
  CREATE INDEX "accounting_periods_updated_by_idx" ON "accounting_periods" USING btree ("updated_by_id");
  CREATE INDEX "accounting_periods_updated_at_idx" ON "accounting_periods" USING btree ("updated_at");
  CREATE INDEX "accounting_periods_created_at_idx" ON "accounting_periods" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_tax_codes_code_idx" ON "accounting_tax_codes" USING btree ("code");
  CREATE INDEX "accounting_tax_codes_purchase_account_idx" ON "accounting_tax_codes" USING btree ("purchase_account_id");
  CREATE INDEX "accounting_tax_codes_sales_account_idx" ON "accounting_tax_codes" USING btree ("sales_account_id");
  CREATE INDEX "accounting_tax_codes_is_active_idx" ON "accounting_tax_codes" USING btree ("is_active");
  CREATE INDEX "accounting_tax_codes_created_by_idx" ON "accounting_tax_codes" USING btree ("created_by_id");
  CREATE INDEX "accounting_tax_codes_updated_by_idx" ON "accounting_tax_codes" USING btree ("updated_by_id");
  CREATE INDEX "accounting_tax_codes_updated_at_idx" ON "accounting_tax_codes" USING btree ("updated_at");
  CREATE INDEX "accounting_tax_codes_created_at_idx" ON "accounting_tax_codes" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_journal_entries_entry_number_idx" ON "accounting_journal_entries" USING btree ("entry_number");
  CREATE INDEX "accounting_journal_entries_fiscal_year_idx" ON "accounting_journal_entries" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_journal_entries_period_idx" ON "accounting_journal_entries" USING btree ("period_id");
  CREATE INDEX "accounting_journal_entries_status_idx" ON "accounting_journal_entries" USING btree ("status");
  CREATE INDEX "accounting_journal_entries_reversal_of_idx" ON "accounting_journal_entries" USING btree ("reversal_of_id");
  CREATE INDEX "accounting_journal_entries_reversed_by_idx" ON "accounting_journal_entries" USING btree ("reversed_by_id");
  CREATE INDEX "accounting_journal_entries_posted_by_idx" ON "accounting_journal_entries" USING btree ("posted_by_id");
  CREATE INDEX "accounting_journal_entries_approved_by_idx" ON "accounting_journal_entries" USING btree ("approved_by_id");
  CREATE INDEX "accounting_journal_entries_created_by_idx" ON "accounting_journal_entries" USING btree ("created_by_id");
  CREATE INDEX "accounting_journal_entries_updated_by_idx" ON "accounting_journal_entries" USING btree ("updated_by_id");
  CREATE INDEX "accounting_journal_entries_updated_at_idx" ON "accounting_journal_entries" USING btree ("updated_at");
  CREATE INDEX "accounting_journal_entries_created_at_idx" ON "accounting_journal_entries" USING btree ("created_at");
  CREATE INDEX "accounting_journal_entry_lines_journal_entry_idx" ON "accounting_journal_entry_lines" USING btree ("journal_entry_id");
  CREATE INDEX "accounting_journal_entry_lines_account_idx" ON "accounting_journal_entry_lines" USING btree ("account_id");
  CREATE INDEX "accounting_journal_entry_lines_tax_code_idx" ON "accounting_journal_entry_lines" USING btree ("tax_code_id");
  CREATE INDEX "accounting_journal_entry_lines_created_by_idx" ON "accounting_journal_entry_lines" USING btree ("created_by_id");
  CREATE INDEX "accounting_journal_entry_lines_updated_by_idx" ON "accounting_journal_entry_lines" USING btree ("updated_by_id");
  CREATE INDEX "accounting_journal_entry_lines_updated_at_idx" ON "accounting_journal_entry_lines" USING btree ("updated_at");
  CREATE INDEX "accounting_journal_entry_lines_created_at_idx" ON "accounting_journal_entry_lines" USING btree ("created_at");
  CREATE INDEX "accounting_settings_default_suspense_account_idx" ON "accounting_settings" USING btree ("default_suspense_account_id");
  CREATE INDEX "accounting_settings_retained_earnings_account_idx" ON "accounting_settings" USING btree ("retained_earnings_account_id");
  CREATE INDEX "accounting_settings_updated_by_idx" ON "accounting_settings" USING btree ("updated_by_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_chart_of_account_fk" FOREIGN KEY ("accounting_chart_of_accounts_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_fiscal_years_fk" FOREIGN KEY ("accounting_fiscal_years_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_periods_fk" FOREIGN KEY ("accounting_periods_id") REFERENCES "public"."accounting_periods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_tax_codes_fk" FOREIGN KEY ("accounting_tax_codes_id") REFERENCES "public"."accounting_tax_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_journal_entries_fk" FOREIGN KEY ("accounting_journal_entries_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_journal_entry_li_fk" FOREIGN KEY ("accounting_journal_entry_lines_id") REFERENCES "public"."accounting_journal_entry_lines"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_accounting_chart_of_accoun_idx" ON "payload_locked_documents_rels" USING btree ("accounting_chart_of_accounts_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_fiscal_years_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_fiscal_years_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_periods_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_periods_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_tax_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_tax_codes_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_journal_entries_idx" ON "payload_locked_documents_rels" USING btree ("accounting_journal_entries_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_journal_entry_l_idx" ON "payload_locked_documents_rels" USING btree ("accounting_journal_entry_lines_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accounting_chart_of_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_fiscal_years" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_periods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_tax_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_journal_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_journal_entry_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "accounting_chart_of_accounts" CASCADE;
  DROP TABLE "accounting_fiscal_years" CASCADE;
  DROP TABLE "accounting_periods" CASCADE;
  DROP TABLE "accounting_tax_codes" CASCADE;
  DROP TABLE "accounting_journal_entries" CASCADE;
  DROP TABLE "accounting_journal_entry_lines" CASCADE;
  DROP TABLE "accounting_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_chart_of_account_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_fiscal_years_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_periods_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_tax_codes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_journal_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_journal_entry_li_fk";
  
  DROP INDEX "payload_locked_documents_rels_accounting_chart_of_accoun_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_fiscal_years_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_periods_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_tax_codes_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_journal_entries_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_journal_entry_l_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_chart_of_accounts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_fiscal_years_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_periods_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_tax_codes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_journal_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_journal_entry_lines_id";
  DROP TYPE "public"."enum_accounting_chart_of_accounts_account_type";
  DROP TYPE "public"."enum_accounting_chart_of_accounts_account_sub_type";
  DROP TYPE "public"."enum_accounting_chart_of_accounts_normal_balance";
  DROP TYPE "public"."enum_accounting_fiscal_years_status";
  DROP TYPE "public"."enum_accounting_fiscal_years_close_mode";
  DROP TYPE "public"."enum_accounting_periods_status";
  DROP TYPE "public"."enum_accounting_tax_codes_scope";
  DROP TYPE "public"."enum_accounting_tax_codes_calculation_method";
  DROP TYPE "public"."enum_accounting_journal_entries_source_type";
  DROP TYPE "public"."enum_accounting_journal_entries_status";
  DROP TYPE "public"."enum_accounting_journal_entries_posting_status";
  DROP TYPE "public"."enum_accounting_settings_opening_balance_source_type";
  DROP TYPE "public"."enum_accounting_settings_default_tax_behavior";`)
}
