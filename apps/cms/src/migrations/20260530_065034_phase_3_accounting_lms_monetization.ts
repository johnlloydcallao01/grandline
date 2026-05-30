import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_acct_course_fee_profiles_default_recognition_method" AS ENUM('on_activation', 'straight_line', 'completion_based', 'certificate_based', 'manual');
  CREATE TYPE "public"."enum_acct_scholarship_sponsors_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_corporate_accounts_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_instructor_payout_rules_payout_method" AS ENUM('flat', 'revenue_share', 'per_enrollment', 'hybrid');
  CREATE TYPE "public"."enum_acct_instructor_payout_rules_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_enrollment_billing_links_billing_status" AS ENUM('not_started', 'drafted', 'invoiced', 'partially_paid', 'paid', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_acct_billing_adjustments_adjustment_type" AS ENUM('manual_discount', 'manual_surcharge', 'late_fee', 'certificate_fee', 'retake_fee', 'reassessment_fee', 'renewal_fee');
  CREATE TYPE "public"."enum_acct_billing_adjustments_direction" AS ENUM('increase', 'decrease');
  CREATE TYPE "public"."enum_acct_payment_allocations_allocation_type" AS ENUM('invoice_settlement', 'deposit_application', 'installment_payment', 'refund_reversal', 'manual_adjustment');
  CREATE TYPE "public"."enum_acct_receipts_status" AS ENUM('draft', 'issued', 'voided');
  CREATE TYPE "public"."enum_acct_refunds_refund_type" AS ENUM('full', 'partial', 'credit_only');
  CREATE TYPE "public"."enum_acct_refunds_status" AS ENUM('draft', 'requested', 'approved', 'processed', 'rejected', 'voided');
  CREATE TYPE "public"."enum_acct_rev_rec_schedules_recognition_method" AS ENUM('on_activation', 'straight_line', 'completion_based', 'certificate_based', 'manual');
  CREATE TYPE "public"."enum_acct_rev_rec_schedules_status" AS ENUM('draft', 'scheduled', 'partially_recognized', 'recognized', 'cancelled');
  CREATE TYPE "public"."enum_acct_scholarship_awards_award_type" AS ENUM('full', 'partial', 'contra_revenue', 'third_party_billed');
  CREATE TYPE "public"."enum_acct_scholarship_awards_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_corporate_billing_links_coverage_type" AS ENUM('full_company_pay', 'shared_pay', 'credit_terms');
  CREATE TYPE "public"."enum_acct_corporate_billing_links_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_instructor_payouts_status" AS ENUM('draft', 'calculated', 'approved', 'paid', 'voided');
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'enrollment_billing_link';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'payment_allocation';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'receipt';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'refund';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'revenue_recognition_schedule';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'scholarship_award';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'corporate_billing_link';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'instructor_payout';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'enrollment_billing_link';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'payment_allocation';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'receipt';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'refund';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'revenue_recognition_schedule';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'scholarship_award';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'corporate_billing_link';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'instructor_payout';
  ALTER TYPE "public"."enum_accounting_document_links_document_category" ADD VALUE 'proof_of_payment' BEFORE 'expense_receipt';
  CREATE TABLE "acct_course_fee_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"course_id" integer NOT NULL,
  	"certificate_fee" numeric DEFAULT 0,
  	"retake_fee" numeric DEFAULT 0,
  	"reassessment_fee" numeric DEFAULT 0,
  	"renewal_fee" numeric DEFAULT 0,
  	"late_payment_fee" numeric DEFAULT 0,
  	"manual_adjustment_allowed" boolean DEFAULT true,
  	"default_recognition_method" "enum_acct_course_fee_profiles_default_recognition_method" DEFAULT 'on_activation',
  	"course_revenue_account_id" integer,
  	"deferred_revenue_account_id" integer,
  	"certificate_revenue_account_id" integer,
  	"discount_contra_revenue_account_id" integer,
  	"instructor_expense_account_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_scholarship_sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sponsor_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"contact_name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"billing_address" varchar,
  	"default_customer_id" integer,
  	"status" "enum_acct_scholarship_sponsors_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_corporate_accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"account_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"customer_id" integer NOT NULL,
  	"billing_contact" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"credit_terms" varchar,
  	"payment_terms" varchar,
  	"negotiated_pricing_policy" jsonb,
  	"status" "enum_acct_corporate_accounts_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_instructor_payout_rules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"payout_method" "enum_acct_instructor_payout_rules_payout_method" DEFAULT 'flat' NOT NULL,
  	"flat_amount" numeric DEFAULT 0,
  	"percent_of_revenue" numeric DEFAULT 0,
  	"per_enrollment_amount" numeric DEFAULT 0,
  	"completion_bonus_amount" numeric DEFAULT 0,
  	"status" "enum_acct_instructor_payout_rules_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_enrollment_billing_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enrollment_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"trainee_id" integer NOT NULL,
  	"user_id" integer,
  	"invoice_id" integer,
  	"customer_id" integer,
  	"billing_status" "enum_acct_enrollment_billing_links_billing_status" DEFAULT 'not_started' NOT NULL,
  	"source_type" varchar DEFAULT 'enrollment' NOT NULL,
  	"source_reference" varchar NOT NULL,
  	"list_price_snapshot" numeric DEFAULT 0,
  	"sale_price_snapshot" numeric DEFAULT 0,
  	"coupon_discount_snapshot" numeric DEFAULT 0,
  	"scholarship_discount_snapshot" numeric DEFAULT 0,
  	"corporate_coverage_snapshot" numeric DEFAULT 0,
  	"adjustments_net_snapshot" numeric DEFAULT 0,
  	"final_charge_snapshot" numeric DEFAULT 0,
  	"recognized_revenue_snapshot" numeric DEFAULT 0,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"linked_at" timestamp(3) with time zone,
  	"metadata" jsonb,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_billing_adjustments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enrollment_billing_link_id" integer NOT NULL,
  	"adjustment_type" "enum_acct_billing_adjustments_adjustment_type" NOT NULL,
  	"reason" varchar,
  	"amount" numeric NOT NULL,
  	"direction" "enum_acct_billing_adjustments_direction" DEFAULT 'increase' NOT NULL,
  	"approved_by_id" integer,
  	"applied_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_payment_allocations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"payment_received_id" integer NOT NULL,
  	"invoice_id" integer,
  	"enrollment_billing_link_id" integer,
  	"allocation_date" timestamp(3) with time zone NOT NULL,
  	"allocated_amount" numeric NOT NULL,
  	"allocation_type" "enum_acct_payment_allocations_allocation_type" DEFAULT 'invoice_settlement' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_receipts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"receipt_number" varchar NOT NULL,
  	"payment_received_id" integer NOT NULL,
  	"enrollment_billing_link_id" integer,
  	"customer_id" integer NOT NULL,
  	"receipt_date" timestamp(3) with time zone NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"status" "enum_acct_receipts_status" DEFAULT 'draft' NOT NULL,
  	"proof_document_id" integer,
  	"issued_by_id" integer,
  	"voided_at" timestamp(3) with time zone,
  	"voided_by_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_refunds" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"refund_number" varchar NOT NULL,
  	"enrollment_billing_link_id" integer,
  	"invoice_id" integer,
  	"payment_received_id" integer,
  	"credit_note_id" integer,
  	"refund_date" timestamp(3) with time zone NOT NULL,
  	"refund_reason" varchar,
  	"refund_type" "enum_acct_refunds_refund_type" DEFAULT 'partial' NOT NULL,
  	"requested_amount" numeric NOT NULL,
  	"approved_amount" numeric,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"status" "enum_acct_refunds_status" DEFAULT 'draft' NOT NULL,
  	"processed_by_id" integer,
  	"proof_document_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_rev_rec_schedules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"invoice_id" integer NOT NULL,
  	"enrollment_billing_link_id" integer NOT NULL,
  	"recognition_method" "enum_acct_rev_rec_schedules_recognition_method" DEFAULT 'on_activation' NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"total_deferred_amount" numeric NOT NULL,
  	"recognized_amount" numeric DEFAULT 0 NOT NULL,
  	"remaining_deferred_amount" numeric DEFAULT 0 NOT NULL,
  	"status" "enum_acct_rev_rec_schedules_status" DEFAULT 'draft' NOT NULL,
  	"schedule_data" jsonb,
  	"last_recognition_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_scholarship_awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enrollment_billing_link_id" integer NOT NULL,
  	"scholarship_sponsor_id" integer NOT NULL,
  	"trainee_id" integer NOT NULL,
  	"award_type" "enum_acct_scholarship_awards_award_type" DEFAULT 'partial' NOT NULL,
  	"award_amount" numeric DEFAULT 0,
  	"award_percent" numeric,
  	"trainee_share_amount" numeric DEFAULT 0,
  	"effective_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_acct_scholarship_awards_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_corporate_billing_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"corporate_account_id" integer NOT NULL,
  	"enrollment_billing_link_id" integer NOT NULL,
  	"invoice_id" integer,
  	"coverage_type" "enum_acct_corporate_billing_links_coverage_type" DEFAULT 'full_company_pay' NOT NULL,
  	"covered_amount" numeric DEFAULT 0,
  	"trainee_share_amount" numeric DEFAULT 0,
  	"status" "enum_acct_corporate_billing_links_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_instructor_payouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"period_start" timestamp(3) with time zone NOT NULL,
  	"period_end" timestamp(3) with time zone NOT NULL,
  	"source_type" varchar DEFAULT 'course_activity' NOT NULL,
  	"source_reference" varchar NOT NULL,
  	"calculated_amount" numeric DEFAULT 0 NOT NULL,
  	"approved_amount" numeric,
  	"status" "enum_acct_instructor_payouts_status" DEFAULT 'draft' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_course_fee_profiles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_scholarship_sponsors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_corporate_accounts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_instructor_payout_rules_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_enrollment_billing_links_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_billing_adjustments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_payment_allocations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_receipts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_refunds_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_rev_rec_schedules_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_scholarship_awards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_corporate_billing_links_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_instructor_payouts_id" integer;
  ALTER TABLE "accounting_settings" ADD COLUMN "official_receipt_number_prefix" varchar DEFAULT 'OR' NOT NULL;
  ALTER TABLE "accounting_settings" ADD COLUMN "refund_number_prefix" varchar DEFAULT 'REF' NOT NULL;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_course_revenue_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("course_revenue_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_deferred_revenue_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("deferred_revenue_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_certificate_revenue_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("certificate_revenue_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_discount_contra_revenue_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("discount_contra_revenue_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_instructor_expense_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("instructor_expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_course_fee_profiles" ADD CONSTRAINT "acct_course_fee_profiles_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_sponsors" ADD CONSTRAINT "acct_scholarship_sponsors_default_customer_id_accounting_customers_id_fk" FOREIGN KEY ("default_customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_sponsors" ADD CONSTRAINT "acct_scholarship_sponsors_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_sponsors" ADD CONSTRAINT "acct_scholarship_sponsors_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_accounts" ADD CONSTRAINT "acct_corporate_accounts_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_accounts" ADD CONSTRAINT "acct_corporate_accounts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_accounts" ADD CONSTRAINT "acct_corporate_accounts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payout_rules" ADD CONSTRAINT "acct_instructor_payout_rules_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payout_rules" ADD CONSTRAINT "acct_instructor_payout_rules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payout_rules" ADD CONSTRAINT "acct_instructor_payout_rules_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payout_rules" ADD CONSTRAINT "acct_instructor_payout_rules_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_enrollment_billing_links" ADD CONSTRAINT "acct_enrollment_billing_links_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_billing_adjustments" ADD CONSTRAINT "acct_billing_adjustments_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_billing_adjustments" ADD CONSTRAINT "acct_billing_adjustments_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_billing_adjustments" ADD CONSTRAINT "acct_billing_adjustments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_billing_adjustments" ADD CONSTRAINT "acct_billing_adjustments_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payment_allocations" ADD CONSTRAINT "acct_payment_allocations_payment_received_id_accounting_payments_received_id_fk" FOREIGN KEY ("payment_received_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payment_allocations" ADD CONSTRAINT "acct_payment_allocations_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payment_allocations" ADD CONSTRAINT "acct_payment_allocations_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payment_allocations" ADD CONSTRAINT "acct_payment_allocations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payment_allocations" ADD CONSTRAINT "acct_payment_allocations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_payment_received_id_accounting_payments_received_id_fk" FOREIGN KEY ("payment_received_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_proof_document_id_media_id_fk" FOREIGN KEY ("proof_document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_issued_by_id_users_id_fk" FOREIGN KEY ("issued_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_voided_by_id_users_id_fk" FOREIGN KEY ("voided_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_receipts" ADD CONSTRAINT "acct_receipts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_payment_received_id_accounting_payments_received_id_fk" FOREIGN KEY ("payment_received_id") REFERENCES "public"."accounting_payments_received"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_credit_note_id_accounting_credit_notes_id_fk" FOREIGN KEY ("credit_note_id") REFERENCES "public"."accounting_credit_notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_processed_by_id_users_id_fk" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_proof_document_id_media_id_fk" FOREIGN KEY ("proof_document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_refunds" ADD CONSTRAINT "acct_refunds_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_rev_rec_schedules" ADD CONSTRAINT "acct_rev_rec_schedules_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_rev_rec_schedules" ADD CONSTRAINT "acct_rev_rec_schedules_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_rev_rec_schedules" ADD CONSTRAINT "acct_rev_rec_schedules_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_rev_rec_schedules" ADD CONSTRAINT "acct_rev_rec_schedules_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_awards" ADD CONSTRAINT "acct_scholarship_awards_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_awards" ADD CONSTRAINT "acct_scholarship_awards_scholarship_sponsor_id_acct_scholarship_sponsors_id_fk" FOREIGN KEY ("scholarship_sponsor_id") REFERENCES "public"."acct_scholarship_sponsors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_awards" ADD CONSTRAINT "acct_scholarship_awards_trainee_id_trainees_id_fk" FOREIGN KEY ("trainee_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_awards" ADD CONSTRAINT "acct_scholarship_awards_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_scholarship_awards" ADD CONSTRAINT "acct_scholarship_awards_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_billing_links" ADD CONSTRAINT "acct_corporate_billing_links_corporate_account_id_acct_corporate_accounts_id_fk" FOREIGN KEY ("corporate_account_id") REFERENCES "public"."acct_corporate_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_billing_links" ADD CONSTRAINT "acct_corporate_billing_links_enrollment_billing_link_id_acct_enrollment_billing_links_id_fk" FOREIGN KEY ("enrollment_billing_link_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_billing_links" ADD CONSTRAINT "acct_corporate_billing_links_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_billing_links" ADD CONSTRAINT "acct_corporate_billing_links_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_corporate_billing_links" ADD CONSTRAINT "acct_corporate_billing_links_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payouts" ADD CONSTRAINT "acct_instructor_payouts_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payouts" ADD CONSTRAINT "acct_instructor_payouts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payouts" ADD CONSTRAINT "acct_instructor_payouts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_instructor_payouts" ADD CONSTRAINT "acct_instructor_payouts_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "acct_course_fee_profiles_course_idx" ON "acct_course_fee_profiles" USING btree ("course_id");
  CREATE INDEX "acct_course_fee_profiles_course_revenue_account_idx" ON "acct_course_fee_profiles" USING btree ("course_revenue_account_id");
  CREATE INDEX "acct_course_fee_profiles_deferred_revenue_account_idx" ON "acct_course_fee_profiles" USING btree ("deferred_revenue_account_id");
  CREATE INDEX "acct_course_fee_profiles_certificate_revenue_account_idx" ON "acct_course_fee_profiles" USING btree ("certificate_revenue_account_id");
  CREATE INDEX "acct_course_fee_profiles_discount_contra_revenue_account_idx" ON "acct_course_fee_profiles" USING btree ("discount_contra_revenue_account_id");
  CREATE INDEX "acct_course_fee_profiles_instructor_expense_account_idx" ON "acct_course_fee_profiles" USING btree ("instructor_expense_account_id");
  CREATE INDEX "acct_course_fee_profiles_created_by_idx" ON "acct_course_fee_profiles" USING btree ("created_by_id");
  CREATE INDEX "acct_course_fee_profiles_updated_by_idx" ON "acct_course_fee_profiles" USING btree ("updated_by_id");
  CREATE INDEX "acct_course_fee_profiles_updated_at_idx" ON "acct_course_fee_profiles" USING btree ("updated_at");
  CREATE INDEX "acct_course_fee_profiles_created_at_idx" ON "acct_course_fee_profiles" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_scholarship_sponsors_sponsor_code_idx" ON "acct_scholarship_sponsors" USING btree ("sponsor_code");
  CREATE INDEX "acct_scholarship_sponsors_name_idx" ON "acct_scholarship_sponsors" USING btree ("name");
  CREATE INDEX "acct_scholarship_sponsors_default_customer_idx" ON "acct_scholarship_sponsors" USING btree ("default_customer_id");
  CREATE INDEX "acct_scholarship_sponsors_status_idx" ON "acct_scholarship_sponsors" USING btree ("status");
  CREATE INDEX "acct_scholarship_sponsors_created_by_idx" ON "acct_scholarship_sponsors" USING btree ("created_by_id");
  CREATE INDEX "acct_scholarship_sponsors_updated_by_idx" ON "acct_scholarship_sponsors" USING btree ("updated_by_id");
  CREATE INDEX "acct_scholarship_sponsors_updated_at_idx" ON "acct_scholarship_sponsors" USING btree ("updated_at");
  CREATE INDEX "acct_scholarship_sponsors_created_at_idx" ON "acct_scholarship_sponsors" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_corporate_accounts_account_code_idx" ON "acct_corporate_accounts" USING btree ("account_code");
  CREATE INDEX "acct_corporate_accounts_name_idx" ON "acct_corporate_accounts" USING btree ("name");
  CREATE INDEX "acct_corporate_accounts_customer_idx" ON "acct_corporate_accounts" USING btree ("customer_id");
  CREATE INDEX "acct_corporate_accounts_status_idx" ON "acct_corporate_accounts" USING btree ("status");
  CREATE INDEX "acct_corporate_accounts_created_by_idx" ON "acct_corporate_accounts" USING btree ("created_by_id");
  CREATE INDEX "acct_corporate_accounts_updated_by_idx" ON "acct_corporate_accounts" USING btree ("updated_by_id");
  CREATE INDEX "acct_corporate_accounts_updated_at_idx" ON "acct_corporate_accounts" USING btree ("updated_at");
  CREATE INDEX "acct_corporate_accounts_created_at_idx" ON "acct_corporate_accounts" USING btree ("created_at");
  CREATE INDEX "acct_instructor_payout_rules_instructor_idx" ON "acct_instructor_payout_rules" USING btree ("instructor_id");
  CREATE INDEX "acct_instructor_payout_rules_course_idx" ON "acct_instructor_payout_rules" USING btree ("course_id");
  CREATE INDEX "acct_instructor_payout_rules_status_idx" ON "acct_instructor_payout_rules" USING btree ("status");
  CREATE INDEX "acct_instructor_payout_rules_created_by_idx" ON "acct_instructor_payout_rules" USING btree ("created_by_id");
  CREATE INDEX "acct_instructor_payout_rules_updated_by_idx" ON "acct_instructor_payout_rules" USING btree ("updated_by_id");
  CREATE INDEX "acct_instructor_payout_rules_updated_at_idx" ON "acct_instructor_payout_rules" USING btree ("updated_at");
  CREATE INDEX "acct_instructor_payout_rules_created_at_idx" ON "acct_instructor_payout_rules" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_enrollment_billing_links_enrollment_idx" ON "acct_enrollment_billing_links" USING btree ("enrollment_id");
  CREATE INDEX "acct_enrollment_billing_links_course_idx" ON "acct_enrollment_billing_links" USING btree ("course_id");
  CREATE INDEX "acct_enrollment_billing_links_trainee_idx" ON "acct_enrollment_billing_links" USING btree ("trainee_id");
  CREATE INDEX "acct_enrollment_billing_links_user_idx" ON "acct_enrollment_billing_links" USING btree ("user_id");
  CREATE INDEX "acct_enrollment_billing_links_invoice_idx" ON "acct_enrollment_billing_links" USING btree ("invoice_id");
  CREATE INDEX "acct_enrollment_billing_links_customer_idx" ON "acct_enrollment_billing_links" USING btree ("customer_id");
  CREATE INDEX "acct_enrollment_billing_links_billing_status_idx" ON "acct_enrollment_billing_links" USING btree ("billing_status");
  CREATE INDEX "acct_enrollment_billing_links_source_reference_idx" ON "acct_enrollment_billing_links" USING btree ("source_reference");
  CREATE INDEX "acct_enrollment_billing_links_created_by_idx" ON "acct_enrollment_billing_links" USING btree ("created_by_id");
  CREATE INDEX "acct_enrollment_billing_links_updated_by_idx" ON "acct_enrollment_billing_links" USING btree ("updated_by_id");
  CREATE INDEX "acct_enrollment_billing_links_updated_at_idx" ON "acct_enrollment_billing_links" USING btree ("updated_at");
  CREATE INDEX "acct_enrollment_billing_links_created_at_idx" ON "acct_enrollment_billing_links" USING btree ("created_at");
  CREATE INDEX "acct_billing_adjustments_enrollment_billing_link_idx" ON "acct_billing_adjustments" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_billing_adjustments_approved_by_idx" ON "acct_billing_adjustments" USING btree ("approved_by_id");
  CREATE INDEX "acct_billing_adjustments_created_by_idx" ON "acct_billing_adjustments" USING btree ("created_by_id");
  CREATE INDEX "acct_billing_adjustments_updated_by_idx" ON "acct_billing_adjustments" USING btree ("updated_by_id");
  CREATE INDEX "acct_billing_adjustments_updated_at_idx" ON "acct_billing_adjustments" USING btree ("updated_at");
  CREATE INDEX "acct_billing_adjustments_created_at_idx" ON "acct_billing_adjustments" USING btree ("created_at");
  CREATE INDEX "acct_payment_allocations_payment_received_idx" ON "acct_payment_allocations" USING btree ("payment_received_id");
  CREATE INDEX "acct_payment_allocations_invoice_idx" ON "acct_payment_allocations" USING btree ("invoice_id");
  CREATE INDEX "acct_payment_allocations_enrollment_billing_link_idx" ON "acct_payment_allocations" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_payment_allocations_created_by_idx" ON "acct_payment_allocations" USING btree ("created_by_id");
  CREATE INDEX "acct_payment_allocations_updated_by_idx" ON "acct_payment_allocations" USING btree ("updated_by_id");
  CREATE INDEX "acct_payment_allocations_updated_at_idx" ON "acct_payment_allocations" USING btree ("updated_at");
  CREATE INDEX "acct_payment_allocations_created_at_idx" ON "acct_payment_allocations" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_receipts_receipt_number_idx" ON "acct_receipts" USING btree ("receipt_number");
  CREATE INDEX "acct_receipts_payment_received_idx" ON "acct_receipts" USING btree ("payment_received_id");
  CREATE INDEX "acct_receipts_enrollment_billing_link_idx" ON "acct_receipts" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_receipts_customer_idx" ON "acct_receipts" USING btree ("customer_id");
  CREATE INDEX "acct_receipts_status_idx" ON "acct_receipts" USING btree ("status");
  CREATE INDEX "acct_receipts_proof_document_idx" ON "acct_receipts" USING btree ("proof_document_id");
  CREATE INDEX "acct_receipts_issued_by_idx" ON "acct_receipts" USING btree ("issued_by_id");
  CREATE INDEX "acct_receipts_voided_by_idx" ON "acct_receipts" USING btree ("voided_by_id");
  CREATE INDEX "acct_receipts_created_by_idx" ON "acct_receipts" USING btree ("created_by_id");
  CREATE INDEX "acct_receipts_updated_by_idx" ON "acct_receipts" USING btree ("updated_by_id");
  CREATE INDEX "acct_receipts_updated_at_idx" ON "acct_receipts" USING btree ("updated_at");
  CREATE INDEX "acct_receipts_created_at_idx" ON "acct_receipts" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_refunds_refund_number_idx" ON "acct_refunds" USING btree ("refund_number");
  CREATE INDEX "acct_refunds_enrollment_billing_link_idx" ON "acct_refunds" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_refunds_invoice_idx" ON "acct_refunds" USING btree ("invoice_id");
  CREATE INDEX "acct_refunds_payment_received_idx" ON "acct_refunds" USING btree ("payment_received_id");
  CREATE INDEX "acct_refunds_credit_note_idx" ON "acct_refunds" USING btree ("credit_note_id");
  CREATE INDEX "acct_refunds_status_idx" ON "acct_refunds" USING btree ("status");
  CREATE INDEX "acct_refunds_processed_by_idx" ON "acct_refunds" USING btree ("processed_by_id");
  CREATE INDEX "acct_refunds_proof_document_idx" ON "acct_refunds" USING btree ("proof_document_id");
  CREATE INDEX "acct_refunds_created_by_idx" ON "acct_refunds" USING btree ("created_by_id");
  CREATE INDEX "acct_refunds_updated_by_idx" ON "acct_refunds" USING btree ("updated_by_id");
  CREATE INDEX "acct_refunds_updated_at_idx" ON "acct_refunds" USING btree ("updated_at");
  CREATE INDEX "acct_refunds_created_at_idx" ON "acct_refunds" USING btree ("created_at");
  CREATE INDEX "acct_rev_rec_schedules_invoice_idx" ON "acct_rev_rec_schedules" USING btree ("invoice_id");
  CREATE INDEX "acct_rev_rec_schedules_enrollment_billing_link_idx" ON "acct_rev_rec_schedules" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_rev_rec_schedules_status_idx" ON "acct_rev_rec_schedules" USING btree ("status");
  CREATE INDEX "acct_rev_rec_schedules_created_by_idx" ON "acct_rev_rec_schedules" USING btree ("created_by_id");
  CREATE INDEX "acct_rev_rec_schedules_updated_by_idx" ON "acct_rev_rec_schedules" USING btree ("updated_by_id");
  CREATE INDEX "acct_rev_rec_schedules_updated_at_idx" ON "acct_rev_rec_schedules" USING btree ("updated_at");
  CREATE INDEX "acct_rev_rec_schedules_created_at_idx" ON "acct_rev_rec_schedules" USING btree ("created_at");
  CREATE INDEX "acct_scholarship_awards_enrollment_billing_link_idx" ON "acct_scholarship_awards" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_scholarship_awards_scholarship_sponsor_idx" ON "acct_scholarship_awards" USING btree ("scholarship_sponsor_id");
  CREATE INDEX "acct_scholarship_awards_trainee_idx" ON "acct_scholarship_awards" USING btree ("trainee_id");
  CREATE INDEX "acct_scholarship_awards_status_idx" ON "acct_scholarship_awards" USING btree ("status");
  CREATE INDEX "acct_scholarship_awards_created_by_idx" ON "acct_scholarship_awards" USING btree ("created_by_id");
  CREATE INDEX "acct_scholarship_awards_updated_by_idx" ON "acct_scholarship_awards" USING btree ("updated_by_id");
  CREATE INDEX "acct_scholarship_awards_updated_at_idx" ON "acct_scholarship_awards" USING btree ("updated_at");
  CREATE INDEX "acct_scholarship_awards_created_at_idx" ON "acct_scholarship_awards" USING btree ("created_at");
  CREATE INDEX "acct_corporate_billing_links_corporate_account_idx" ON "acct_corporate_billing_links" USING btree ("corporate_account_id");
  CREATE INDEX "acct_corporate_billing_links_enrollment_billing_link_idx" ON "acct_corporate_billing_links" USING btree ("enrollment_billing_link_id");
  CREATE INDEX "acct_corporate_billing_links_invoice_idx" ON "acct_corporate_billing_links" USING btree ("invoice_id");
  CREATE INDEX "acct_corporate_billing_links_status_idx" ON "acct_corporate_billing_links" USING btree ("status");
  CREATE INDEX "acct_corporate_billing_links_created_by_idx" ON "acct_corporate_billing_links" USING btree ("created_by_id");
  CREATE INDEX "acct_corporate_billing_links_updated_by_idx" ON "acct_corporate_billing_links" USING btree ("updated_by_id");
  CREATE INDEX "acct_corporate_billing_links_updated_at_idx" ON "acct_corporate_billing_links" USING btree ("updated_at");
  CREATE INDEX "acct_corporate_billing_links_created_at_idx" ON "acct_corporate_billing_links" USING btree ("created_at");
  CREATE INDEX "acct_instructor_payouts_instructor_idx" ON "acct_instructor_payouts" USING btree ("instructor_id");
  CREATE INDEX "acct_instructor_payouts_course_idx" ON "acct_instructor_payouts" USING btree ("course_id");
  CREATE INDEX "acct_instructor_payouts_source_reference_idx" ON "acct_instructor_payouts" USING btree ("source_reference");
  CREATE INDEX "acct_instructor_payouts_status_idx" ON "acct_instructor_payouts" USING btree ("status");
  CREATE INDEX "acct_instructor_payouts_created_by_idx" ON "acct_instructor_payouts" USING btree ("created_by_id");
  CREATE INDEX "acct_instructor_payouts_updated_by_idx" ON "acct_instructor_payouts" USING btree ("updated_by_id");
  CREATE INDEX "acct_instructor_payouts_updated_at_idx" ON "acct_instructor_payouts" USING btree ("updated_at");
  CREATE INDEX "acct_instructor_payouts_created_at_idx" ON "acct_instructor_payouts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_course_fee_profi_fk" FOREIGN KEY ("acct_course_fee_profiles_id") REFERENCES "public"."acct_course_fee_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_scholarship_spon_fk" FOREIGN KEY ("acct_scholarship_sponsors_id") REFERENCES "public"."acct_scholarship_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_corporate_accoun_fk" FOREIGN KEY ("acct_corporate_accounts_id") REFERENCES "public"."acct_corporate_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_instructor_payou_fk" FOREIGN KEY ("acct_instructor_payout_rules_id") REFERENCES "public"."acct_instructor_payout_rules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_enrollment_billi_fk" FOREIGN KEY ("acct_enrollment_billing_links_id") REFERENCES "public"."acct_enrollment_billing_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_billing_adjustme_fk" FOREIGN KEY ("acct_billing_adjustments_id") REFERENCES "public"."acct_billing_adjustments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_payment_allocati_fk" FOREIGN KEY ("acct_payment_allocations_id") REFERENCES "public"."acct_payment_allocations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_receipts_fk" FOREIGN KEY ("acct_receipts_id") REFERENCES "public"."acct_receipts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_refunds_fk" FOREIGN KEY ("acct_refunds_id") REFERENCES "public"."acct_refunds"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_revenue_recognit_fk" FOREIGN KEY ("acct_rev_rec_schedules_id") REFERENCES "public"."acct_rev_rec_schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_scholarship_awar_fk" FOREIGN KEY ("acct_scholarship_awards_id") REFERENCES "public"."acct_scholarship_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_corporate_billin_fk" FOREIGN KEY ("acct_corporate_billing_links_id") REFERENCES "public"."acct_corporate_billing_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_instructor_pay_1_fk" FOREIGN KEY ("acct_instructor_payouts_id") REFERENCES "public"."acct_instructor_payouts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_acct_course_fee_profiles_i_idx" ON "payload_locked_documents_rels" USING btree ("acct_course_fee_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_acct_scholarship_sponsors__idx" ON "payload_locked_documents_rels" USING btree ("acct_scholarship_sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_acct_corporate_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_corporate_accounts_id");
  CREATE INDEX "payload_locked_documents_rels_acct_instructor_payout_rul_idx" ON "payload_locked_documents_rels" USING btree ("acct_instructor_payout_rules_id");
  CREATE INDEX "payload_locked_documents_rels_acct_enrollment_billing_li_idx" ON "payload_locked_documents_rels" USING btree ("acct_enrollment_billing_links_id");
  CREATE INDEX "payload_locked_documents_rels_acct_billing_adjustments_i_idx" ON "payload_locked_documents_rels" USING btree ("acct_billing_adjustments_id");
  CREATE INDEX "payload_locked_documents_rels_acct_payment_allocations_i_idx" ON "payload_locked_documents_rels" USING btree ("acct_payment_allocations_id");
  CREATE INDEX "payload_locked_documents_rels_acct_receipts_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_receipts_id");
  CREATE INDEX "payload_locked_documents_rels_acct_refunds_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_refunds_id");
  CREATE INDEX "payload_locked_documents_rels_acct_rev_rec_schedules_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_rev_rec_schedules_id");
  CREATE INDEX "payload_locked_documents_rels_acct_scholarship_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_scholarship_awards_id");
  CREATE INDEX "payload_locked_documents_rels_acct_corporate_billing_lin_idx" ON "payload_locked_documents_rels" USING btree ("acct_corporate_billing_links_id");
  CREATE INDEX "payload_locked_documents_rels_acct_instructor_payouts_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_instructor_payouts_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "acct_course_fee_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_scholarship_sponsors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_corporate_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_instructor_payout_rules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_enrollment_billing_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_billing_adjustments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_payment_allocations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_receipts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_refunds" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_rev_rec_schedules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_scholarship_awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_corporate_billing_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_instructor_payouts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "acct_course_fee_profiles" CASCADE;
  DROP TABLE "acct_scholarship_sponsors" CASCADE;
  DROP TABLE "acct_corporate_accounts" CASCADE;
  DROP TABLE "acct_instructor_payout_rules" CASCADE;
  DROP TABLE "acct_enrollment_billing_links" CASCADE;
  DROP TABLE "acct_billing_adjustments" CASCADE;
  DROP TABLE "acct_payment_allocations" CASCADE;
  DROP TABLE "acct_receipts" CASCADE;
  DROP TABLE "acct_refunds" CASCADE;
  DROP TABLE "acct_rev_rec_schedules" CASCADE;
  DROP TABLE "acct_scholarship_awards" CASCADE;
  DROP TABLE "acct_corporate_billing_links" CASCADE;
  DROP TABLE "acct_instructor_payouts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_course_fee_profi_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_scholarship_spon_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_corporate_accoun_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_instructor_payou_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_enrollment_billi_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_billing_adjustme_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_payment_allocati_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_receipts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_refunds_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_revenue_recognit_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_scholarship_awar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_corporate_billin_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_instructor_pay_1_fk";
  
  ALTER TABLE "accounting_bank_transactions" ALTER COLUMN "matched_entity_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_accounting_bank_transactions_matched_entity_type";
  CREATE TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry');
  ALTER TABLE "accounting_bank_transactions" ALTER COLUMN "matched_entity_type" SET DATA TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" USING "matched_entity_type"::"public"."enum_accounting_bank_transactions_matched_entity_type";
  ALTER TABLE "accounting_document_links" ALTER COLUMN "entity_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_accounting_document_links_entity_type";
  CREATE TYPE "public"."enum_accounting_document_links_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry');
  ALTER TABLE "accounting_document_links" ALTER COLUMN "entity_type" SET DATA TYPE "public"."enum_accounting_document_links_entity_type" USING "entity_type"::"public"."enum_accounting_document_links_entity_type";
  ALTER TABLE "accounting_document_links" ALTER COLUMN "document_category" SET DATA TYPE text;
  ALTER TABLE "accounting_document_links" ALTER COLUMN "document_category" SET DEFAULT 'other'::text;
  DROP TYPE "public"."enum_accounting_document_links_document_category";
  CREATE TYPE "public"."enum_accounting_document_links_document_category" AS ENUM('invoice', 'bill', 'receipt', 'expense_receipt', 'bank_statement', 'contract', 'tax', 'other');
  ALTER TABLE "accounting_document_links" ALTER COLUMN "document_category" SET DEFAULT 'other'::"public"."enum_accounting_document_links_document_category";
  ALTER TABLE "accounting_document_links" ALTER COLUMN "document_category" SET DATA TYPE "public"."enum_accounting_document_links_document_category" USING "document_category"::"public"."enum_accounting_document_links_document_category";
  DROP INDEX "payload_locked_documents_rels_acct_course_fee_profiles_i_idx";
  DROP INDEX "payload_locked_documents_rels_acct_scholarship_sponsors__idx";
  DROP INDEX "payload_locked_documents_rels_acct_corporate_accounts_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_instructor_payout_rul_idx";
  DROP INDEX "payload_locked_documents_rels_acct_enrollment_billing_li_idx";
  DROP INDEX "payload_locked_documents_rels_acct_billing_adjustments_i_idx";
  DROP INDEX "payload_locked_documents_rels_acct_payment_allocations_i_idx";
  DROP INDEX "payload_locked_documents_rels_acct_receipts_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_refunds_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_rev_rec_schedules_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_scholarship_awards_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_corporate_billing_lin_idx";
  DROP INDEX "payload_locked_documents_rels_acct_instructor_payouts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_course_fee_profiles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_scholarship_sponsors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_corporate_accounts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_instructor_payout_rules_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_enrollment_billing_links_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_billing_adjustments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_payment_allocations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_receipts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_refunds_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_rev_rec_schedules_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_scholarship_awards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_corporate_billing_links_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_instructor_payouts_id";
  ALTER TABLE "accounting_settings" DROP COLUMN "official_receipt_number_prefix";
  ALTER TABLE "accounting_settings" DROP COLUMN "refund_number_prefix";
  DROP TYPE "public"."enum_acct_course_fee_profiles_default_recognition_method";
  DROP TYPE "public"."enum_acct_scholarship_sponsors_status";
  DROP TYPE "public"."enum_acct_corporate_accounts_status";
  DROP TYPE "public"."enum_acct_instructor_payout_rules_payout_method";
  DROP TYPE "public"."enum_acct_instructor_payout_rules_status";
  DROP TYPE "public"."enum_acct_enrollment_billing_links_billing_status";
  DROP TYPE "public"."enum_acct_billing_adjustments_adjustment_type";
  DROP TYPE "public"."enum_acct_billing_adjustments_direction";
  DROP TYPE "public"."enum_acct_payment_allocations_allocation_type";
  DROP TYPE "public"."enum_acct_receipts_status";
  DROP TYPE "public"."enum_acct_refunds_refund_type";
  DROP TYPE "public"."enum_acct_refunds_status";
  DROP TYPE "public"."enum_acct_rev_rec_schedules_recognition_method";
  DROP TYPE "public"."enum_acct_rev_rec_schedules_status";
  DROP TYPE "public"."enum_acct_scholarship_awards_award_type";
  DROP TYPE "public"."enum_acct_scholarship_awards_status";
  DROP TYPE "public"."enum_acct_corporate_billing_links_coverage_type";
  DROP TYPE "public"."enum_acct_corporate_billing_links_status";
  DROP TYPE "public"."enum_acct_instructor_payouts_status";`)
}
