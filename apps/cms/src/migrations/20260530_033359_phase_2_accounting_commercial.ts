import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_accounting_customers_customer_type" AS ENUM('individual', 'company', 'sponsor', 'other');
  CREATE TYPE "public"."enum_accounting_customers_status" AS ENUM('active', 'on_hold', 'inactive', 'archived');
  CREATE TYPE "public"."enum_accounting_vendors_vendor_type" AS ENUM('supplier', 'contractor', 'utility', 'government', 'other');
  CREATE TYPE "public"."enum_accounting_vendors_status" AS ENUM('active', 'on_hold', 'inactive', 'archived');
  CREATE TYPE "public"."enum_accounting_bank_accounts_account_type" AS ENUM('bank', 'cash_on_hand', 'undeposited_funds');
  CREATE TYPE "public"."enum_accounting_invoices_status" AS ENUM('draft', 'approved', 'posted', 'partially_paid', 'paid', 'voided');
  CREATE TYPE "public"."enum_accounting_invoices_posting_status" AS ENUM('unposted', 'posted', 'reversed', 'voided');
  CREATE TYPE "public"."enum_accounting_invoice_line_items_item_type" AS ENUM('service', 'product', 'fee', 'other');
  CREATE TYPE "public"."enum_accounting_bills_status" AS ENUM('draft', 'approved', 'posted', 'partially_paid', 'paid', 'voided');
  CREATE TYPE "public"."enum_accounting_bills_posting_status" AS ENUM('unposted', 'posted', 'reversed', 'voided');
  CREATE TYPE "public"."enum_accounting_credit_notes_status" AS ENUM('draft', 'approved', 'posted', 'partially_paid', 'paid', 'voided');
  CREATE TYPE "public"."enum_accounting_vendor_credits_status" AS ENUM('draft', 'approved', 'posted', 'partially_paid', 'paid', 'voided');
  CREATE TYPE "public"."enum_accounting_payments_received_payment_method" AS ENUM('cash', 'bank_transfer', 'check', 'card', 'e_wallet', 'other');
  CREATE TYPE "public"."enum_accounting_payments_received_status" AS ENUM('draft', 'posted', 'voided');
  CREATE TYPE "public"."enum_accounting_payments_made_payment_method" AS ENUM('cash', 'bank_transfer', 'check', 'card', 'e_wallet', 'other');
  CREATE TYPE "public"."enum_accounting_payments_made_status" AS ENUM('draft', 'posted', 'voided');
  CREATE TYPE "public"."enum_accounting_expenses_payment_method" AS ENUM('cash', 'bank', 'card', 'other');
  CREATE TYPE "public"."enum_accounting_expenses_status" AS ENUM('draft', 'posted', 'voided');
  CREATE TYPE "public"."enum_accounting_deposits_status" AS ENUM('draft', 'posted', 'voided');
  CREATE TYPE "public"."enum_accounting_transfers_status" AS ENUM('draft', 'posted', 'voided');
  CREATE TYPE "public"."enum_accounting_bank_transactions_match_status" AS ENUM('unmatched', 'suggested', 'matched', 'ignored');
  CREATE TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry');
  CREATE TYPE "public"."enum_accounting_bank_reconciliations_status" AS ENUM('draft', 'in_progress', 'completed', 'locked');
  CREATE TYPE "public"."enum_accounting_document_links_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry');
  CREATE TYPE "public"."enum_accounting_document_links_document_category" AS ENUM('invoice', 'bill', 'receipt', 'expense_receipt', 'bank_statement', 'contract', 'tax', 'other');
  CREATE TABLE "accounting_customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_code" varchar NOT NULL,
  	"display_name" varchar NOT NULL,
  	"legal_name" varchar,
  	"customer_type" "enum_accounting_customers_customer_type" DEFAULT 'individual' NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"billing_address" varchar,
  	"shipping_address" varchar,
  	"tax_id" varchar,
  	"tax_profile" jsonb,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"payment_terms" varchar,
  	"credit_limit" numeric DEFAULT 0,
  	"status" "enum_accounting_customers_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_vendors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vendor_code" varchar NOT NULL,
  	"display_name" varchar NOT NULL,
  	"legal_name" varchar,
  	"vendor_type" "enum_accounting_vendors_vendor_type" DEFAULT 'supplier' NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"billing_address" varchar,
  	"tax_id" varchar,
  	"tax_profile" jsonb,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"payment_terms" varchar,
  	"status" "enum_accounting_vendors_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_bank_accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"account_name" varchar NOT NULL,
  	"account_number_masked" varchar,
  	"bank_name" varchar,
  	"branch_name" varchar,
  	"account_type" "enum_accounting_bank_accounts_account_type" DEFAULT 'bank' NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"ledger_account_id" integer NOT NULL,
  	"is_default_receipt_account" boolean DEFAULT false,
  	"is_default_disbursement_account" boolean DEFAULT false,
  	"is_active" boolean DEFAULT true,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"invoice_number" varchar NOT NULL,
  	"customer_id" integer NOT NULL,
  	"invoice_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"due_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"status" "enum_accounting_invoices_status" DEFAULT 'draft' NOT NULL,
  	"posting_status" "enum_accounting_invoices_posting_status" DEFAULT 'unposted' NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"exchange_rate" numeric DEFAULT 1 NOT NULL,
  	"subtotal" numeric DEFAULT 0,
  	"tax_total" numeric DEFAULT 0,
  	"discount_total" numeric DEFAULT 0,
  	"total" numeric DEFAULT 0,
  	"balance_due" numeric DEFAULT 0,
  	"reference_number" varchar,
  	"memo" varchar,
  	"source_type" varchar DEFAULT 'commercial_invoice',
  	"source_reference" varchar,
  	"receivable_account_override_id" integer,
  	"posted_journal_entry_id" integer,
  	"voided_at" timestamp(3) with time zone,
  	"voided_by_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_invoice_line_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"invoice_id" integer NOT NULL,
  	"line_number" numeric NOT NULL,
  	"description" varchar NOT NULL,
  	"item_type" "enum_accounting_invoice_line_items_item_type" DEFAULT 'service' NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"unit_price" numeric DEFAULT 0 NOT NULL,
  	"discount_amount" numeric DEFAULT 0,
  	"tax_code_id" integer,
  	"line_subtotal" numeric DEFAULT 0,
  	"line_tax" numeric DEFAULT 0,
  	"line_total" numeric DEFAULT 0,
  	"income_account_id" integer NOT NULL,
  	"receivable_account_override_id" integer,
  	"reference_entity_type" varchar,
  	"reference_entity_id" varchar,
  	"metadata" jsonb,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_bills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bill_number" varchar NOT NULL,
  	"vendor_id" integer NOT NULL,
  	"bill_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"due_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"status" "enum_accounting_bills_status" DEFAULT 'draft' NOT NULL,
  	"posting_status" "enum_accounting_bills_posting_status" DEFAULT 'unposted' NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"exchange_rate" numeric DEFAULT 1 NOT NULL,
  	"subtotal" numeric DEFAULT 0,
  	"tax_total" numeric DEFAULT 0,
  	"total" numeric DEFAULT 0,
  	"balance_due" numeric DEFAULT 0,
  	"reference_number" varchar,
  	"memo" varchar,
  	"posted_journal_entry_id" integer,
  	"payable_account_override_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_bill_line_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bill_id" integer NOT NULL,
  	"line_number" numeric NOT NULL,
  	"description" varchar NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"unit_price" numeric DEFAULT 0 NOT NULL,
  	"tax_code_id" integer,
  	"line_subtotal" numeric DEFAULT 0,
  	"line_tax" numeric DEFAULT 0,
  	"line_total" numeric DEFAULT 0,
  	"expense_account_id" integer,
  	"asset_account_id" integer,
  	"payable_account_override_id" integer,
  	"reference_entity_type" varchar,
  	"reference_entity_id" varchar,
  	"metadata" jsonb,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_credit_notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit_note_number" varchar NOT NULL,
  	"customer_id" integer NOT NULL,
  	"credit_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"status" "enum_accounting_credit_notes_status" DEFAULT 'draft' NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"subtotal" numeric DEFAULT 0 NOT NULL,
  	"tax_total" numeric DEFAULT 0,
  	"total" numeric DEFAULT 0 NOT NULL,
  	"applied_amount" numeric DEFAULT 0,
  	"remaining_amount" numeric DEFAULT 0,
  	"source_invoice_id" integer,
  	"adjustment_account_id" integer NOT NULL,
  	"posted_journal_entry_id" integer,
  	"reason" varchar,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_vendor_credits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vendor_credit_number" varchar NOT NULL,
  	"vendor_id" integer NOT NULL,
  	"credit_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"status" "enum_accounting_vendor_credits_status" DEFAULT 'draft' NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"subtotal" numeric DEFAULT 0 NOT NULL,
  	"tax_total" numeric DEFAULT 0,
  	"total" numeric DEFAULT 0 NOT NULL,
  	"applied_amount" numeric DEFAULT 0,
  	"remaining_amount" numeric DEFAULT 0,
  	"source_bill_id" integer,
  	"adjustment_account_id" integer NOT NULL,
  	"posted_journal_entry_id" integer,
  	"reason" varchar,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_payments_received_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"invoice_id" integer NOT NULL,
  	"amount_applied" numeric NOT NULL
  );
  
  CREATE TABLE "accounting_payments_received" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"receipt_number" varchar NOT NULL,
  	"customer_id" integer NOT NULL,
  	"payment_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"payment_method" "enum_accounting_payments_received_payment_method" DEFAULT 'bank_transfer' NOT NULL,
  	"deposit_account_id" integer,
  	"undeposited_funds_account_id" integer,
  	"amount_received" numeric NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"exchange_rate" numeric DEFAULT 1 NOT NULL,
  	"status" "enum_accounting_payments_received_status" DEFAULT 'draft' NOT NULL,
  	"posted_journal_entry_id" integer,
  	"reference_number" varchar,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_payments_made_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"bill_id" integer NOT NULL,
  	"amount_applied" numeric NOT NULL
  );
  
  CREATE TABLE "accounting_payments_made" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"payment_number" varchar NOT NULL,
  	"vendor_id" integer NOT NULL,
  	"payment_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"payment_method" "enum_accounting_payments_made_payment_method" DEFAULT 'bank_transfer' NOT NULL,
  	"bank_account_id" integer NOT NULL,
  	"amount_paid" numeric NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"exchange_rate" numeric DEFAULT 1 NOT NULL,
  	"status" "enum_accounting_payments_made_status" DEFAULT 'draft' NOT NULL,
  	"posted_journal_entry_id" integer,
  	"reference_number" varchar,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_expenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"expense_number" varchar NOT NULL,
  	"expense_date" timestamp(3) with time zone NOT NULL,
  	"posting_date" timestamp(3) with time zone NOT NULL,
  	"fiscal_year_id" integer,
  	"period_id" integer,
  	"vendor_id" integer,
  	"expense_category" varchar,
  	"payment_method" "enum_accounting_expenses_payment_method" DEFAULT 'bank' NOT NULL,
  	"status" "enum_accounting_expenses_status" DEFAULT 'draft' NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"subtotal" numeric DEFAULT 0 NOT NULL,
  	"tax_total" numeric DEFAULT 0,
  	"total" numeric DEFAULT 0,
  	"expense_account_id" integer NOT NULL,
  	"tax_code_id" integer,
  	"payment_account_id" integer,
  	"bank_account_id" integer,
  	"posted_journal_entry_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_deposits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"deposit_number" varchar NOT NULL,
  	"deposit_date" timestamp(3) with time zone NOT NULL,
  	"bank_account_id" integer NOT NULL,
  	"source_account_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"status" "enum_accounting_deposits_status" DEFAULT 'draft' NOT NULL,
  	"posted_journal_entry_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_transfers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"transfer_number" varchar NOT NULL,
  	"transfer_date" timestamp(3) with time zone NOT NULL,
  	"from_bank_account_id" integer NOT NULL,
  	"to_bank_account_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"status" "enum_accounting_transfers_status" DEFAULT 'draft' NOT NULL,
  	"posted_journal_entry_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_bank_transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bank_account_id" integer NOT NULL,
  	"transaction_date" timestamp(3) with time zone NOT NULL,
  	"value_date" timestamp(3) with time zone,
  	"description" varchar NOT NULL,
  	"reference_number" varchar,
  	"amount_in" numeric DEFAULT 0,
  	"amount_out" numeric DEFAULT 0,
  	"running_balance" numeric,
  	"match_status" "enum_accounting_bank_transactions_match_status" DEFAULT 'unmatched' NOT NULL,
  	"matched_entity_type" "enum_accounting_bank_transactions_matched_entity_type",
  	"matched_entity_id" varchar,
  	"metadata" jsonb,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_bank_reconciliations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bank_account_id" integer NOT NULL,
  	"statement_start_date" timestamp(3) with time zone NOT NULL,
  	"statement_end_date" timestamp(3) with time zone NOT NULL,
  	"statement_closing_balance" numeric NOT NULL,
  	"book_closing_balance" numeric DEFAULT 0,
  	"difference_amount" numeric DEFAULT 0,
  	"status" "enum_accounting_bank_reconciliations_status" DEFAULT 'draft' NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"completed_by_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounting_document_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"entity_type" "enum_accounting_document_links_entity_type" NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"document_category" "enum_accounting_document_links_document_category" DEFAULT 'other' NOT NULL,
  	"document_date" timestamp(3) with time zone,
  	"uploaded_by_id" integer,
  	"notes" varchar,
  	"is_primary" boolean DEFAULT false,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_customers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_vendors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_bank_accounts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_invoices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_invoice_line_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_bills_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_bill_line_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_credit_notes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_vendor_credits_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_payments_received_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_payments_made_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_expenses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_deposits_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_transfers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_bank_transactions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_bank_reconciliations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "accounting_document_links_id" integer;
  ALTER TABLE "accounting_settings" ADD COLUMN "customer_number_prefix" varchar DEFAULT 'CUST' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "vendor_number_prefix" varchar DEFAULT 'VEND' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "invoice_number_prefix" varchar DEFAULT 'INV' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "bill_number_prefix" varchar DEFAULT 'BILL' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "payment_received_number_prefix" varchar DEFAULT 'RCPT' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "payment_made_number_prefix" varchar DEFAULT 'PAY' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "credit_note_number_prefix" varchar DEFAULT 'CN' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "vendor_credit_number_prefix" varchar DEFAULT 'VCN' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "deposit_number_prefix" varchar DEFAULT 'DEP' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "transfer_number_prefix" varchar DEFAULT 'TRF' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "default_receivable_account_id" integer;
  ALTER TABLE "accounting_settings" ADD COLUMN "default_payable_account_id" integer;
  ALTER TABLE "accounting_settings" ADD COLUMN "default_undeposited_funds_account_id" integer;
  ALTER TABLE "accounting_settings" ADD COLUMN "default_output_tax_account_id" integer;
  ALTER TABLE "accounting_settings" ADD COLUMN "default_input_tax_account_id" integer;
  ALTER TABLE "accounting_customers" ADD CONSTRAINT "accounting_customers_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_customers" ADD CONSTRAINT "accounting_customers_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendors" ADD CONSTRAINT "accounting_vendors_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendors" ADD CONSTRAINT "accounting_vendors_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_accounts" ADD CONSTRAINT "accounting_bank_accounts_ledger_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_accounts" ADD CONSTRAINT "accounting_bank_accounts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_accounts" ADD CONSTRAINT "accounting_bank_accounts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_receivable_account_override_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("receivable_account_override_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_voided_by_id_users_id_fk" FOREIGN KEY ("voided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoice_line_items" ADD CONSTRAINT "accounting_invoice_line_items_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoice_line_items" ADD CONSTRAINT "accounting_invoice_line_items_tax_code_id_accounting_tax_codes_id_fk" FOREIGN KEY ("tax_code_id") REFERENCES "public"."accounting_tax_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoice_line_items" ADD CONSTRAINT "accounting_invoice_line_items_income_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("income_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoice_line_items" ADD CONSTRAINT "accounting_invoice_line_items_receivable_account_override_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("receivable_account_override_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoice_line_items" ADD CONSTRAINT "accounting_invoice_line_items_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_invoice_line_items" ADD CONSTRAINT "accounting_invoice_line_items_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_vendor_id_accounting_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."accounting_vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_payable_account_override_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("payable_account_override_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bills" ADD CONSTRAINT "accounting_bills_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_bill_id_accounting_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."accounting_bills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_tax_code_id_accounting_tax_codes_id_fk" FOREIGN KEY ("tax_code_id") REFERENCES "public"."accounting_tax_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_expense_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_asset_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("asset_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_payable_account_override_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("payable_account_override_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bill_line_items" ADD CONSTRAINT "accounting_bill_line_items_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_source_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_adjustment_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("adjustment_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes" ADD CONSTRAINT "accounting_credit_notes_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_vendor_id_accounting_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."accounting_vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_source_bill_id_accounting_bills_id_fk" FOREIGN KEY ("source_bill_id") REFERENCES "public"."accounting_bills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_adjustment_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("adjustment_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits" ADD CONSTRAINT "accounting_vendor_credits_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received_applications" ADD CONSTRAINT "accounting_payments_received_applications_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received_applications" ADD CONSTRAINT "accounting_payments_received_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_deposit_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("deposit_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_undeposited_funds_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("undeposited_funds_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_received" ADD CONSTRAINT "accounting_payments_received_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made_applications" ADD CONSTRAINT "accounting_payments_made_applications_bill_id_accounting_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."accounting_bills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made_applications" ADD CONSTRAINT "accounting_payments_made_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accounting_payments_made"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_vendor_id_accounting_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."accounting_vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_payments_made" ADD CONSTRAINT "accounting_payments_made_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_vendor_id_accounting_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."accounting_vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_expense_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_tax_code_id_accounting_tax_codes_id_fk" FOREIGN KEY ("tax_code_id") REFERENCES "public"."accounting_tax_codes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_payment_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_deposits" ADD CONSTRAINT "accounting_deposits_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_deposits" ADD CONSTRAINT "accounting_deposits_source_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_deposits" ADD CONSTRAINT "accounting_deposits_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_deposits" ADD CONSTRAINT "accounting_deposits_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_deposits" ADD CONSTRAINT "accounting_deposits_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_transfers" ADD CONSTRAINT "accounting_transfers_from_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("from_bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_transfers" ADD CONSTRAINT "accounting_transfers_to_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("to_bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_transfers" ADD CONSTRAINT "accounting_transfers_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_transfers" ADD CONSTRAINT "accounting_transfers_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_transfers" ADD CONSTRAINT "accounting_transfers_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_transactions" ADD CONSTRAINT "accounting_bank_transactions_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_transactions" ADD CONSTRAINT "accounting_bank_transactions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_transactions" ADD CONSTRAINT "accounting_bank_transactions_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_reconciliations" ADD CONSTRAINT "accounting_bank_reconciliations_bank_account_id_accounting_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_reconciliations" ADD CONSTRAINT "accounting_bank_reconciliations_completed_by_id_users_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_reconciliations" ADD CONSTRAINT "accounting_bank_reconciliations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_bank_reconciliations" ADD CONSTRAINT "accounting_bank_reconciliations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_document_links" ADD CONSTRAINT "accounting_document_links_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_document_links" ADD CONSTRAINT "accounting_document_links_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_document_links" ADD CONSTRAINT "accounting_document_links_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_document_links" ADD CONSTRAINT "accounting_document_links_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "accounting_customers_customer_code_idx" ON "accounting_customers" USING btree ("customer_code");
  CREATE INDEX "accounting_customers_display_name_idx" ON "accounting_customers" USING btree ("display_name");
  CREATE INDEX "accounting_customers_status_idx" ON "accounting_customers" USING btree ("status");
  CREATE INDEX "accounting_customers_created_by_idx" ON "accounting_customers" USING btree ("created_by_id");
  CREATE INDEX "accounting_customers_updated_by_idx" ON "accounting_customers" USING btree ("updated_by_id");
  CREATE INDEX "accounting_customers_updated_at_idx" ON "accounting_customers" USING btree ("updated_at");
  CREATE INDEX "accounting_customers_created_at_idx" ON "accounting_customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_vendors_vendor_code_idx" ON "accounting_vendors" USING btree ("vendor_code");
  CREATE INDEX "accounting_vendors_display_name_idx" ON "accounting_vendors" USING btree ("display_name");
  CREATE INDEX "accounting_vendors_status_idx" ON "accounting_vendors" USING btree ("status");
  CREATE INDEX "accounting_vendors_created_by_idx" ON "accounting_vendors" USING btree ("created_by_id");
  CREATE INDEX "accounting_vendors_updated_by_idx" ON "accounting_vendors" USING btree ("updated_by_id");
  CREATE INDEX "accounting_vendors_updated_at_idx" ON "accounting_vendors" USING btree ("updated_at");
  CREATE INDEX "accounting_vendors_created_at_idx" ON "accounting_vendors" USING btree ("created_at");
  CREATE INDEX "accounting_bank_accounts_account_type_idx" ON "accounting_bank_accounts" USING btree ("account_type");
  CREATE INDEX "accounting_bank_accounts_ledger_account_idx" ON "accounting_bank_accounts" USING btree ("ledger_account_id");
  CREATE INDEX "accounting_bank_accounts_is_active_idx" ON "accounting_bank_accounts" USING btree ("is_active");
  CREATE INDEX "accounting_bank_accounts_created_by_idx" ON "accounting_bank_accounts" USING btree ("created_by_id");
  CREATE INDEX "accounting_bank_accounts_updated_by_idx" ON "accounting_bank_accounts" USING btree ("updated_by_id");
  CREATE INDEX "accounting_bank_accounts_updated_at_idx" ON "accounting_bank_accounts" USING btree ("updated_at");
  CREATE INDEX "accounting_bank_accounts_created_at_idx" ON "accounting_bank_accounts" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_invoices_invoice_number_idx" ON "accounting_invoices" USING btree ("invoice_number");
  CREATE INDEX "accounting_invoices_customer_idx" ON "accounting_invoices" USING btree ("customer_id");
  CREATE INDEX "accounting_invoices_fiscal_year_idx" ON "accounting_invoices" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_invoices_period_idx" ON "accounting_invoices" USING btree ("period_id");
  CREATE INDEX "accounting_invoices_status_idx" ON "accounting_invoices" USING btree ("status");
  CREATE INDEX "accounting_invoices_receivable_account_override_idx" ON "accounting_invoices" USING btree ("receivable_account_override_id");
  CREATE INDEX "accounting_invoices_posted_journal_entry_idx" ON "accounting_invoices" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_invoices_voided_by_idx" ON "accounting_invoices" USING btree ("voided_by_id");
  CREATE INDEX "accounting_invoices_created_by_idx" ON "accounting_invoices" USING btree ("created_by_id");
  CREATE INDEX "accounting_invoices_updated_by_idx" ON "accounting_invoices" USING btree ("updated_by_id");
  CREATE INDEX "accounting_invoices_updated_at_idx" ON "accounting_invoices" USING btree ("updated_at");
  CREATE INDEX "accounting_invoices_created_at_idx" ON "accounting_invoices" USING btree ("created_at");
  CREATE INDEX "accounting_invoice_line_items_invoice_idx" ON "accounting_invoice_line_items" USING btree ("invoice_id");
  CREATE INDEX "accounting_invoice_line_items_tax_code_idx" ON "accounting_invoice_line_items" USING btree ("tax_code_id");
  CREATE INDEX "accounting_invoice_line_items_income_account_idx" ON "accounting_invoice_line_items" USING btree ("income_account_id");
  CREATE INDEX "accounting_invoice_line_items_receivable_account_overrid_idx" ON "accounting_invoice_line_items" USING btree ("receivable_account_override_id");
  CREATE INDEX "accounting_invoice_line_items_created_by_idx" ON "accounting_invoice_line_items" USING btree ("created_by_id");
  CREATE INDEX "accounting_invoice_line_items_updated_by_idx" ON "accounting_invoice_line_items" USING btree ("updated_by_id");
  CREATE INDEX "accounting_invoice_line_items_updated_at_idx" ON "accounting_invoice_line_items" USING btree ("updated_at");
  CREATE INDEX "accounting_invoice_line_items_created_at_idx" ON "accounting_invoice_line_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_bills_bill_number_idx" ON "accounting_bills" USING btree ("bill_number");
  CREATE INDEX "accounting_bills_vendor_idx" ON "accounting_bills" USING btree ("vendor_id");
  CREATE INDEX "accounting_bills_fiscal_year_idx" ON "accounting_bills" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_bills_period_idx" ON "accounting_bills" USING btree ("period_id");
  CREATE INDEX "accounting_bills_status_idx" ON "accounting_bills" USING btree ("status");
  CREATE INDEX "accounting_bills_posted_journal_entry_idx" ON "accounting_bills" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_bills_payable_account_override_idx" ON "accounting_bills" USING btree ("payable_account_override_id");
  CREATE INDEX "accounting_bills_created_by_idx" ON "accounting_bills" USING btree ("created_by_id");
  CREATE INDEX "accounting_bills_updated_by_idx" ON "accounting_bills" USING btree ("updated_by_id");
  CREATE INDEX "accounting_bills_updated_at_idx" ON "accounting_bills" USING btree ("updated_at");
  CREATE INDEX "accounting_bills_created_at_idx" ON "accounting_bills" USING btree ("created_at");
  CREATE INDEX "accounting_bill_line_items_bill_idx" ON "accounting_bill_line_items" USING btree ("bill_id");
  CREATE INDEX "accounting_bill_line_items_tax_code_idx" ON "accounting_bill_line_items" USING btree ("tax_code_id");
  CREATE INDEX "accounting_bill_line_items_expense_account_idx" ON "accounting_bill_line_items" USING btree ("expense_account_id");
  CREATE INDEX "accounting_bill_line_items_asset_account_idx" ON "accounting_bill_line_items" USING btree ("asset_account_id");
  CREATE INDEX "accounting_bill_line_items_payable_account_override_idx" ON "accounting_bill_line_items" USING btree ("payable_account_override_id");
  CREATE INDEX "accounting_bill_line_items_created_by_idx" ON "accounting_bill_line_items" USING btree ("created_by_id");
  CREATE INDEX "accounting_bill_line_items_updated_by_idx" ON "accounting_bill_line_items" USING btree ("updated_by_id");
  CREATE INDEX "accounting_bill_line_items_updated_at_idx" ON "accounting_bill_line_items" USING btree ("updated_at");
  CREATE INDEX "accounting_bill_line_items_created_at_idx" ON "accounting_bill_line_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_credit_notes_credit_note_number_idx" ON "accounting_credit_notes" USING btree ("credit_note_number");
  CREATE INDEX "accounting_credit_notes_customer_idx" ON "accounting_credit_notes" USING btree ("customer_id");
  CREATE INDEX "accounting_credit_notes_fiscal_year_idx" ON "accounting_credit_notes" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_credit_notes_period_idx" ON "accounting_credit_notes" USING btree ("period_id");
  CREATE INDEX "accounting_credit_notes_status_idx" ON "accounting_credit_notes" USING btree ("status");
  CREATE INDEX "accounting_credit_notes_source_invoice_idx" ON "accounting_credit_notes" USING btree ("source_invoice_id");
  CREATE INDEX "accounting_credit_notes_adjustment_account_idx" ON "accounting_credit_notes" USING btree ("adjustment_account_id");
  CREATE INDEX "accounting_credit_notes_posted_journal_entry_idx" ON "accounting_credit_notes" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_credit_notes_created_by_idx" ON "accounting_credit_notes" USING btree ("created_by_id");
  CREATE INDEX "accounting_credit_notes_updated_by_idx" ON "accounting_credit_notes" USING btree ("updated_by_id");
  CREATE INDEX "accounting_credit_notes_updated_at_idx" ON "accounting_credit_notes" USING btree ("updated_at");
  CREATE INDEX "accounting_credit_notes_created_at_idx" ON "accounting_credit_notes" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_vendor_credits_vendor_credit_number_idx" ON "accounting_vendor_credits" USING btree ("vendor_credit_number");
  CREATE INDEX "accounting_vendor_credits_vendor_idx" ON "accounting_vendor_credits" USING btree ("vendor_id");
  CREATE INDEX "accounting_vendor_credits_fiscal_year_idx" ON "accounting_vendor_credits" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_vendor_credits_period_idx" ON "accounting_vendor_credits" USING btree ("period_id");
  CREATE INDEX "accounting_vendor_credits_status_idx" ON "accounting_vendor_credits" USING btree ("status");
  CREATE INDEX "accounting_vendor_credits_source_bill_idx" ON "accounting_vendor_credits" USING btree ("source_bill_id");
  CREATE INDEX "accounting_vendor_credits_adjustment_account_idx" ON "accounting_vendor_credits" USING btree ("adjustment_account_id");
  CREATE INDEX "accounting_vendor_credits_posted_journal_entry_idx" ON "accounting_vendor_credits" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_vendor_credits_created_by_idx" ON "accounting_vendor_credits" USING btree ("created_by_id");
  CREATE INDEX "accounting_vendor_credits_updated_by_idx" ON "accounting_vendor_credits" USING btree ("updated_by_id");
  CREATE INDEX "accounting_vendor_credits_updated_at_idx" ON "accounting_vendor_credits" USING btree ("updated_at");
  CREATE INDEX "accounting_vendor_credits_created_at_idx" ON "accounting_vendor_credits" USING btree ("created_at");
  CREATE INDEX "accounting_payments_received_applications_order_idx" ON "accounting_payments_received_applications" USING btree ("_order");
  CREATE INDEX "accounting_payments_received_applications_parent_id_idx" ON "accounting_payments_received_applications" USING btree ("_parent_id");
  CREATE INDEX "accounting_payments_received_applications_invoice_idx" ON "accounting_payments_received_applications" USING btree ("invoice_id");
  CREATE UNIQUE INDEX "accounting_payments_received_receipt_number_idx" ON "accounting_payments_received" USING btree ("receipt_number");
  CREATE INDEX "accounting_payments_received_customer_idx" ON "accounting_payments_received" USING btree ("customer_id");
  CREATE INDEX "accounting_payments_received_fiscal_year_idx" ON "accounting_payments_received" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_payments_received_period_idx" ON "accounting_payments_received" USING btree ("period_id");
  CREATE INDEX "accounting_payments_received_deposit_account_idx" ON "accounting_payments_received" USING btree ("deposit_account_id");
  CREATE INDEX "accounting_payments_received_undeposited_funds_account_idx" ON "accounting_payments_received" USING btree ("undeposited_funds_account_id");
  CREATE INDEX "accounting_payments_received_status_idx" ON "accounting_payments_received" USING btree ("status");
  CREATE INDEX "accounting_payments_received_posted_journal_entry_idx" ON "accounting_payments_received" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_payments_received_created_by_idx" ON "accounting_payments_received" USING btree ("created_by_id");
  CREATE INDEX "accounting_payments_received_updated_by_idx" ON "accounting_payments_received" USING btree ("updated_by_id");
  CREATE INDEX "accounting_payments_received_updated_at_idx" ON "accounting_payments_received" USING btree ("updated_at");
  CREATE INDEX "accounting_payments_received_created_at_idx" ON "accounting_payments_received" USING btree ("created_at");
  CREATE INDEX "accounting_payments_made_applications_order_idx" ON "accounting_payments_made_applications" USING btree ("_order");
  CREATE INDEX "accounting_payments_made_applications_parent_id_idx" ON "accounting_payments_made_applications" USING btree ("_parent_id");
  CREATE INDEX "accounting_payments_made_applications_bill_idx" ON "accounting_payments_made_applications" USING btree ("bill_id");
  CREATE UNIQUE INDEX "accounting_payments_made_payment_number_idx" ON "accounting_payments_made" USING btree ("payment_number");
  CREATE INDEX "accounting_payments_made_vendor_idx" ON "accounting_payments_made" USING btree ("vendor_id");
  CREATE INDEX "accounting_payments_made_fiscal_year_idx" ON "accounting_payments_made" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_payments_made_period_idx" ON "accounting_payments_made" USING btree ("period_id");
  CREATE INDEX "accounting_payments_made_bank_account_idx" ON "accounting_payments_made" USING btree ("bank_account_id");
  CREATE INDEX "accounting_payments_made_status_idx" ON "accounting_payments_made" USING btree ("status");
  CREATE INDEX "accounting_payments_made_posted_journal_entry_idx" ON "accounting_payments_made" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_payments_made_created_by_idx" ON "accounting_payments_made" USING btree ("created_by_id");
  CREATE INDEX "accounting_payments_made_updated_by_idx" ON "accounting_payments_made" USING btree ("updated_by_id");
  CREATE INDEX "accounting_payments_made_updated_at_idx" ON "accounting_payments_made" USING btree ("updated_at");
  CREATE INDEX "accounting_payments_made_created_at_idx" ON "accounting_payments_made" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_expenses_expense_number_idx" ON "accounting_expenses" USING btree ("expense_number");
  CREATE INDEX "accounting_expenses_fiscal_year_idx" ON "accounting_expenses" USING btree ("fiscal_year_id");
  CREATE INDEX "accounting_expenses_period_idx" ON "accounting_expenses" USING btree ("period_id");
  CREATE INDEX "accounting_expenses_vendor_idx" ON "accounting_expenses" USING btree ("vendor_id");
  CREATE INDEX "accounting_expenses_status_idx" ON "accounting_expenses" USING btree ("status");
  CREATE INDEX "accounting_expenses_expense_account_idx" ON "accounting_expenses" USING btree ("expense_account_id");
  CREATE INDEX "accounting_expenses_tax_code_idx" ON "accounting_expenses" USING btree ("tax_code_id");
  CREATE INDEX "accounting_expenses_payment_account_idx" ON "accounting_expenses" USING btree ("payment_account_id");
  CREATE INDEX "accounting_expenses_bank_account_idx" ON "accounting_expenses" USING btree ("bank_account_id");
  CREATE INDEX "accounting_expenses_posted_journal_entry_idx" ON "accounting_expenses" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_expenses_created_by_idx" ON "accounting_expenses" USING btree ("created_by_id");
  CREATE INDEX "accounting_expenses_updated_by_idx" ON "accounting_expenses" USING btree ("updated_by_id");
  CREATE INDEX "accounting_expenses_updated_at_idx" ON "accounting_expenses" USING btree ("updated_at");
  CREATE INDEX "accounting_expenses_created_at_idx" ON "accounting_expenses" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_deposits_deposit_number_idx" ON "accounting_deposits" USING btree ("deposit_number");
  CREATE INDEX "accounting_deposits_bank_account_idx" ON "accounting_deposits" USING btree ("bank_account_id");
  CREATE INDEX "accounting_deposits_source_account_idx" ON "accounting_deposits" USING btree ("source_account_id");
  CREATE INDEX "accounting_deposits_status_idx" ON "accounting_deposits" USING btree ("status");
  CREATE INDEX "accounting_deposits_posted_journal_entry_idx" ON "accounting_deposits" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_deposits_created_by_idx" ON "accounting_deposits" USING btree ("created_by_id");
  CREATE INDEX "accounting_deposits_updated_by_idx" ON "accounting_deposits" USING btree ("updated_by_id");
  CREATE INDEX "accounting_deposits_updated_at_idx" ON "accounting_deposits" USING btree ("updated_at");
  CREATE INDEX "accounting_deposits_created_at_idx" ON "accounting_deposits" USING btree ("created_at");
  CREATE UNIQUE INDEX "accounting_transfers_transfer_number_idx" ON "accounting_transfers" USING btree ("transfer_number");
  CREATE INDEX "accounting_transfers_from_bank_account_idx" ON "accounting_transfers" USING btree ("from_bank_account_id");
  CREATE INDEX "accounting_transfers_to_bank_account_idx" ON "accounting_transfers" USING btree ("to_bank_account_id");
  CREATE INDEX "accounting_transfers_status_idx" ON "accounting_transfers" USING btree ("status");
  CREATE INDEX "accounting_transfers_posted_journal_entry_idx" ON "accounting_transfers" USING btree ("posted_journal_entry_id");
  CREATE INDEX "accounting_transfers_created_by_idx" ON "accounting_transfers" USING btree ("created_by_id");
  CREATE INDEX "accounting_transfers_updated_by_idx" ON "accounting_transfers" USING btree ("updated_by_id");
  CREATE INDEX "accounting_transfers_updated_at_idx" ON "accounting_transfers" USING btree ("updated_at");
  CREATE INDEX "accounting_transfers_created_at_idx" ON "accounting_transfers" USING btree ("created_at");
  CREATE INDEX "accounting_bank_transactions_bank_account_idx" ON "accounting_bank_transactions" USING btree ("bank_account_id");
  CREATE INDEX "accounting_bank_transactions_transaction_date_idx" ON "accounting_bank_transactions" USING btree ("transaction_date");
  CREATE INDEX "accounting_bank_transactions_match_status_idx" ON "accounting_bank_transactions" USING btree ("match_status");
  CREATE INDEX "accounting_bank_transactions_created_by_idx" ON "accounting_bank_transactions" USING btree ("created_by_id");
  CREATE INDEX "accounting_bank_transactions_updated_by_idx" ON "accounting_bank_transactions" USING btree ("updated_by_id");
  CREATE INDEX "accounting_bank_transactions_updated_at_idx" ON "accounting_bank_transactions" USING btree ("updated_at");
  CREATE INDEX "accounting_bank_transactions_created_at_idx" ON "accounting_bank_transactions" USING btree ("created_at");
  CREATE INDEX "accounting_bank_reconciliations_bank_account_idx" ON "accounting_bank_reconciliations" USING btree ("bank_account_id");
  CREATE INDEX "accounting_bank_reconciliations_statement_end_date_idx" ON "accounting_bank_reconciliations" USING btree ("statement_end_date");
  CREATE INDEX "accounting_bank_reconciliations_status_idx" ON "accounting_bank_reconciliations" USING btree ("status");
  CREATE INDEX "accounting_bank_reconciliations_completed_by_idx" ON "accounting_bank_reconciliations" USING btree ("completed_by_id");
  CREATE INDEX "accounting_bank_reconciliations_created_by_idx" ON "accounting_bank_reconciliations" USING btree ("created_by_id");
  CREATE INDEX "accounting_bank_reconciliations_updated_by_idx" ON "accounting_bank_reconciliations" USING btree ("updated_by_id");
  CREATE INDEX "accounting_bank_reconciliations_updated_at_idx" ON "accounting_bank_reconciliations" USING btree ("updated_at");
  CREATE INDEX "accounting_bank_reconciliations_created_at_idx" ON "accounting_bank_reconciliations" USING btree ("created_at");
  CREATE INDEX "accounting_document_links_media_idx" ON "accounting_document_links" USING btree ("media_id");
  CREATE INDEX "accounting_document_links_entity_type_idx" ON "accounting_document_links" USING btree ("entity_type");
  CREATE INDEX "accounting_document_links_entity_id_idx" ON "accounting_document_links" USING btree ("entity_id");
  CREATE INDEX "accounting_document_links_uploaded_by_idx" ON "accounting_document_links" USING btree ("uploaded_by_id");
  CREATE INDEX "accounting_document_links_created_by_idx" ON "accounting_document_links" USING btree ("created_by_id");
  CREATE INDEX "accounting_document_links_updated_by_idx" ON "accounting_document_links" USING btree ("updated_by_id");
  CREATE INDEX "accounting_document_links_updated_at_idx" ON "accounting_document_links" USING btree ("updated_at");
  CREATE INDEX "accounting_document_links_created_at_idx" ON "accounting_document_links" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_customers_fk" FOREIGN KEY ("accounting_customers_id") REFERENCES "public"."accounting_customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_vendors_fk" FOREIGN KEY ("accounting_vendors_id") REFERENCES "public"."accounting_vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_bank_accounts_fk" FOREIGN KEY ("accounting_bank_accounts_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_invoices_fk" FOREIGN KEY ("accounting_invoices_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_invoice_line_ite_fk" FOREIGN KEY ("accounting_invoice_line_items_id") REFERENCES "public"."accounting_invoice_line_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_bills_fk" FOREIGN KEY ("accounting_bills_id") REFERENCES "public"."accounting_bills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_bill_line_items_fk" FOREIGN KEY ("accounting_bill_line_items_id") REFERENCES "public"."accounting_bill_line_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_credit_notes_fk" FOREIGN KEY ("accounting_credit_notes_id") REFERENCES "public"."accounting_credit_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_vendor_credits_fk" FOREIGN KEY ("accounting_vendor_credits_id") REFERENCES "public"."accounting_vendor_credits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_payments_receive_fk" FOREIGN KEY ("accounting_payments_received_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_payments_made_fk" FOREIGN KEY ("accounting_payments_made_id") REFERENCES "public"."accounting_payments_made"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_expenses_fk" FOREIGN KEY ("accounting_expenses_id") REFERENCES "public"."accounting_expenses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_deposits_fk" FOREIGN KEY ("accounting_deposits_id") REFERENCES "public"."accounting_deposits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_transfers_fk" FOREIGN KEY ("accounting_transfers_id") REFERENCES "public"."accounting_transfers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_bank_transaction_fk" FOREIGN KEY ("accounting_bank_transactions_id") REFERENCES "public"."accounting_bank_transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_bank_reconciliat_fk" FOREIGN KEY ("accounting_bank_reconciliations_id") REFERENCES "public"."accounting_bank_reconciliations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_document_links_fk" FOREIGN KEY ("accounting_document_links_id") REFERENCES "public"."accounting_document_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_default_receivable_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("default_receivable_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_default_payable_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("default_payable_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_default_undeposited_funds_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("default_undeposited_funds_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_default_output_tax_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("default_output_tax_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_settings" ADD CONSTRAINT "accounting_settings_default_input_tax_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("default_input_tax_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_accounting_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_customers_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_vendors_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_vendors_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_bank_accounts_i_idx" ON "payload_locked_documents_rels" USING btree ("accounting_bank_accounts_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_invoices_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_invoice_line_it_idx" ON "payload_locked_documents_rels" USING btree ("accounting_invoice_line_items_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_bills_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_bills_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_bill_line_items_idx" ON "payload_locked_documents_rels" USING btree ("accounting_bill_line_items_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_credit_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_credit_notes_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_vendor_credits__idx" ON "payload_locked_documents_rels" USING btree ("accounting_vendor_credits_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_payments_receiv_idx" ON "payload_locked_documents_rels" USING btree ("accounting_payments_received_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_payments_made_i_idx" ON "payload_locked_documents_rels" USING btree ("accounting_payments_made_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_expenses_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_expenses_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_deposits_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_deposits_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_transfers_id_idx" ON "payload_locked_documents_rels" USING btree ("accounting_transfers_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_bank_transactio_idx" ON "payload_locked_documents_rels" USING btree ("accounting_bank_transactions_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_bank_reconcilia_idx" ON "payload_locked_documents_rels" USING btree ("accounting_bank_reconciliations_id");
  CREATE INDEX "payload_locked_documents_rels_accounting_document_links__idx" ON "payload_locked_documents_rels" USING btree ("accounting_document_links_id");
  CREATE INDEX "accounting_settings_default_receivable_account_idx" ON "accounting_settings" USING btree ("default_receivable_account_id");
  CREATE INDEX "accounting_settings_default_payable_account_idx" ON "accounting_settings" USING btree ("default_payable_account_id");
  CREATE INDEX "accounting_settings_default_undeposited_funds_account_idx" ON "accounting_settings" USING btree ("default_undeposited_funds_account_id");
  CREATE INDEX "accounting_settings_default_output_tax_account_idx" ON "accounting_settings" USING btree ("default_output_tax_account_id");
  CREATE INDEX "accounting_settings_default_input_tax_account_idx" ON "accounting_settings" USING btree ("default_input_tax_account_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accounting_customers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_vendors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_bank_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_invoices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_invoice_line_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_bills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_bill_line_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_credit_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_vendor_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_payments_received_applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_payments_received" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_payments_made_applications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_payments_made" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_expenses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_deposits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_transfers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_bank_transactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_bank_reconciliations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accounting_document_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "accounting_customers" CASCADE;
  DROP TABLE "accounting_vendors" CASCADE;
  DROP TABLE "accounting_bank_accounts" CASCADE;
  DROP TABLE "accounting_invoices" CASCADE;
  DROP TABLE "accounting_invoice_line_items" CASCADE;
  DROP TABLE "accounting_bills" CASCADE;
  DROP TABLE "accounting_bill_line_items" CASCADE;
  DROP TABLE "accounting_credit_notes" CASCADE;
  DROP TABLE "accounting_vendor_credits" CASCADE;
  DROP TABLE "accounting_payments_received_applications" CASCADE;
  DROP TABLE "accounting_payments_received" CASCADE;
  DROP TABLE "accounting_payments_made_applications" CASCADE;
  DROP TABLE "accounting_payments_made" CASCADE;
  DROP TABLE "accounting_expenses" CASCADE;
  DROP TABLE "accounting_deposits" CASCADE;
  DROP TABLE "accounting_transfers" CASCADE;
  DROP TABLE "accounting_bank_transactions" CASCADE;
  DROP TABLE "accounting_bank_reconciliations" CASCADE;
  DROP TABLE "accounting_document_links" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_customers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_vendors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_bank_accounts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_invoices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_invoice_line_ite_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_bills_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_bill_line_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_credit_notes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_vendor_credits_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_payments_receive_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_payments_made_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_expenses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_deposits_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_transfers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_bank_transaction_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_bank_reconciliat_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_document_links_fk";
  
  ALTER TABLE "accounting_settings" DROP CONSTRAINT "accounting_settings_default_receivable_account_id_accounting_chart_of_accounts_id_fk";
  
  ALTER TABLE "accounting_settings" DROP CONSTRAINT "accounting_settings_default_payable_account_id_accounting_chart_of_accounts_id_fk";
  
  ALTER TABLE "accounting_settings" DROP CONSTRAINT "accounting_settings_default_undeposited_funds_account_id_accounting_chart_of_accounts_id_fk";
  
  ALTER TABLE "accounting_settings" DROP CONSTRAINT "accounting_settings_default_output_tax_account_id_accounting_chart_of_accounts_id_fk";
  
  ALTER TABLE "accounting_settings" DROP CONSTRAINT "accounting_settings_default_input_tax_account_id_accounting_chart_of_accounts_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_accounting_customers_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_vendors_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_bank_accounts_i_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_invoices_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_invoice_line_it_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_bills_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_bill_line_items_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_credit_notes_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_vendor_credits__idx";
  DROP INDEX "payload_locked_documents_rels_accounting_payments_receiv_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_payments_made_i_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_expenses_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_deposits_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_transfers_id_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_bank_transactio_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_bank_reconcilia_idx";
  DROP INDEX "payload_locked_documents_rels_accounting_document_links__idx";
  DROP INDEX "accounting_settings_default_receivable_account_idx";
  DROP INDEX "accounting_settings_default_payable_account_idx";
  DROP INDEX "accounting_settings_default_undeposited_funds_account_idx";
  DROP INDEX "accounting_settings_default_output_tax_account_idx";
  DROP INDEX "accounting_settings_default_input_tax_account_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_customers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_vendors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_bank_accounts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_invoices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_invoice_line_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_bills_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_bill_line_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_credit_notes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_vendor_credits_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_payments_received_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_payments_made_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_expenses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_deposits_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_transfers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_bank_transactions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_bank_reconciliations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "accounting_document_links_id";
  ALTER TABLE "accounting_settings" DROP COLUMN "customer_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "vendor_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "invoice_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "bill_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "payment_received_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "payment_made_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "credit_note_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "vendor_credit_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "deposit_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "transfer_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "default_receivable_account_id";
  ALTER TABLE "accounting_settings" DROP COLUMN "default_payable_account_id";
  ALTER TABLE "accounting_settings" DROP COLUMN "default_undeposited_funds_account_id";
  ALTER TABLE "accounting_settings" DROP COLUMN "default_output_tax_account_id";
  ALTER TABLE "accounting_settings" DROP COLUMN "default_input_tax_account_id";
  DROP TYPE "public"."enum_accounting_customers_customer_type";
  DROP TYPE "public"."enum_accounting_customers_status";
  DROP TYPE "public"."enum_accounting_vendors_vendor_type";
  DROP TYPE "public"."enum_accounting_vendors_status";
  DROP TYPE "public"."enum_accounting_bank_accounts_account_type";
  DROP TYPE "public"."enum_accounting_invoices_status";
  DROP TYPE "public"."enum_accounting_invoices_posting_status";
  DROP TYPE "public"."enum_accounting_invoice_line_items_item_type";
  DROP TYPE "public"."enum_accounting_bills_status";
  DROP TYPE "public"."enum_accounting_bills_posting_status";
  DROP TYPE "public"."enum_accounting_credit_notes_status";
  DROP TYPE "public"."enum_accounting_vendor_credits_status";
  DROP TYPE "public"."enum_accounting_payments_received_payment_method";
  DROP TYPE "public"."enum_accounting_payments_received_status";
  DROP TYPE "public"."enum_accounting_payments_made_payment_method";
  DROP TYPE "public"."enum_accounting_payments_made_status";
  DROP TYPE "public"."enum_accounting_expenses_payment_method";
  DROP TYPE "public"."enum_accounting_expenses_status";
  DROP TYPE "public"."enum_accounting_deposits_status";
  DROP TYPE "public"."enum_accounting_transfers_status";
  DROP TYPE "public"."enum_accounting_bank_transactions_match_status";
  DROP TYPE "public"."enum_accounting_bank_transactions_matched_entity_type";
  DROP TYPE "public"."enum_accounting_bank_reconciliations_status";
  DROP TYPE "public"."enum_accounting_document_links_entity_type";
  DROP TYPE "public"."enum_accounting_document_links_document_category";`)
}
