import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_acct_branches_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_departments_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_locations_status" AS ENUM('active', 'inactive', 'archived');
  CREATE TYPE "public"."enum_acct_projects_status" AS ENUM('draft', 'active', 'on_hold', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_acct_projects_project_type" AS ENUM('internal', 'customer_project', 'training_delivery', 'implementation');
  CREATE TYPE "public"."enum_acct_project_tasks_status" AS ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_acct_budgets_status" AS ENUM('draft', 'approved', 'locked', 'archived');
  CREATE TYPE "public"."enum_acct_budgets_budget_type" AS ENUM('annual', 'monthly', 'project', 'department', 'course_category');
  CREATE TYPE "public"."enum_acct_forecast_scenarios_scenario_type" AS ENUM('base_case', 'best_case', 'worst_case', 'custom');
  CREATE TYPE "public"."enum_acct_forecast_scenarios_status" AS ENUM('draft', 'approved', 'archived');
  CREATE TYPE "public"."enum_acct_time_entries_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'posted');
  CREATE TYPE "public"."enum_acct_time_entries_source_type" AS ENUM('manual', 'timer', 'course_delivery', 'project_work', 'support', 'other');
  CREATE TYPE "public"."enum_acct_timesheets_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'locked');
  CREATE TYPE "public"."enum_acct_fixed_assets_asset_category" AS ENUM('equipment', 'furniture', 'it_infrastructure', 'vehicle', 'leasehold_improvement', 'other');
  CREATE TYPE "public"."enum_acct_fixed_assets_depreciation_method" AS ENUM('straight_line', 'manual');
  CREATE TYPE "public"."enum_acct_fixed_assets_status" AS ENUM('draft', 'active', 'fully_depreciated', 'disposed', 'written_off');
  CREATE TYPE "public"."enum_acct_depr_entries_status" AS ENUM('scheduled', 'posted', 'reversed');
  CREATE TYPE "public"."enum_acct_asset_disposals_disposal_type" AS ENUM('sale', 'write_off', 'scrap', 'transfer');
  CREATE TYPE "public"."enum_acct_asset_disposals_status" AS ENUM('draft', 'approved', 'posted', 'voided');
  CREATE TYPE "public"."enum_acct_payroll_runs_status" AS ENUM('draft', 'review', 'approved', 'posted', 'voided');
  CREATE TYPE "public"."enum_acct_payroll_entries_entry_type" AS ENUM('salary', 'contractor', 'reimbursement', 'adjustment');
  CREATE TYPE "public"."enum_acct_payroll_entries_status" AS ENUM('draft', 'approved', 'posted', 'voided');
  CREATE TYPE "public"."enum_acct_approval_workflows_entity_type" AS ENUM('invoice', 'bill', 'expense', 'journal', 'budget', 'asset_disposal', 'timesheet', 'payroll_run');
  CREATE TYPE "public"."enum_acct_approval_requests_entity_type" AS ENUM('invoice', 'bill', 'expense', 'journal', 'budget', 'asset_disposal', 'timesheet', 'payroll_run');
  CREATE TYPE "public"."enum_acct_approval_requests_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');
  CREATE TYPE "public"."enum_acct_audit_logs_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry', 'enrollment_billing_link', 'payment_allocation', 'receipt', 'refund', 'revenue_recognition_schedule', 'scholarship_award', 'corporate_billing_link', 'instructor_payout', 'branch', 'department', 'location', 'project', 'project_task', 'time_entry', 'timesheet', 'budget', 'forecast_scenario', 'fixed_asset', 'depreciation_entry', 'asset_disposal', 'payroll_run', 'payroll_entry', 'approval_workflow', 'approval_request', 'audit_log');
  CREATE TYPE "public"."enum_acct_audit_logs_action_type" AS ENUM('created', 'updated', 'submitted', 'approved', 'posted', 'reversed', 'voided', 'exported');
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'branch';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'department';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'location';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'project';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'project_task';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'time_entry';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'timesheet';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'budget';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'forecast_scenario';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'fixed_asset';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'depreciation_entry';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'asset_disposal';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'payroll_run';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'payroll_entry';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'approval_workflow';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'approval_request';
  ALTER TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" ADD VALUE 'audit_log';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'branch';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'department';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'location';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'project';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'project_task';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'time_entry';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'timesheet';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'budget';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'forecast_scenario';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'fixed_asset';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'depreciation_entry';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'asset_disposal';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'payroll_run';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'payroll_entry';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'approval_workflow';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'approval_request';
  ALTER TYPE "public"."enum_accounting_document_links_entity_type" ADD VALUE 'audit_log';
  CREATE TABLE "acct_branches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"branch_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_acct_branches_status" DEFAULT 'active' NOT NULL,
  	"address" varchar,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"department_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_acct_departments_status" DEFAULT 'active' NOT NULL,
  	"branch_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"location_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_acct_locations_status" DEFAULT 'active' NOT NULL,
  	"branch_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_acct_projects_status" DEFAULT 'draft' NOT NULL,
  	"customer_id" integer,
  	"manager_user_id" integer,
  	"project_type" "enum_acct_projects_project_type" DEFAULT 'internal' NOT NULL,
  	"course_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"branch_id" integer,
  	"department_id" integer,
  	"location_id" integer,
  	"budget_amount" numeric DEFAULT 0,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_project_tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer NOT NULL,
  	"task_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_acct_project_tasks_status" DEFAULT 'draft' NOT NULL,
  	"assigned_to_id" integer,
  	"billable" boolean DEFAULT true,
  	"start_date" timestamp(3) with time zone,
  	"due_date" timestamp(3) with time zone,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_budgets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"budget_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"fiscal_year_id" integer NOT NULL,
  	"status" "enum_acct_budgets_status" DEFAULT 'draft' NOT NULL,
  	"budget_type" "enum_acct_budgets_budget_type" DEFAULT 'annual' NOT NULL,
  	"branch_id" integer,
  	"department_id" integer,
  	"location_id" integer,
  	"project_id" integer,
  	"course_category_id" integer,
  	"scenario_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_budget_lines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"budget_id" integer NOT NULL,
  	"account_id" integer NOT NULL,
  	"period_id" integer,
  	"planned_amount" numeric DEFAULT 0 NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_forecast_scenarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"scenario_type" "enum_acct_forecast_scenarios_scenario_type" DEFAULT 'base_case' NOT NULL,
  	"fiscal_year_id" integer NOT NULL,
  	"status" "enum_acct_forecast_scenarios_status" DEFAULT 'draft' NOT NULL,
  	"assumptions" jsonb,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_time_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entry_date" timestamp(3) with time zone NOT NULL,
  	"user_id" integer NOT NULL,
  	"timesheet_id" integer,
  	"project_id" integer,
  	"project_task_id" integer,
  	"course_id" integer,
  	"instructor_id" integer,
  	"hours" numeric DEFAULT 0,
  	"minutes" numeric DEFAULT 0,
  	"billable" boolean DEFAULT true,
  	"billing_rate" numeric DEFAULT 0,
  	"cost_rate" numeric DEFAULT 0,
  	"status" "enum_acct_time_entries_status" DEFAULT 'draft' NOT NULL,
  	"source_type" "enum_acct_time_entries_source_type" DEFAULT 'manual' NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"ended_at" timestamp(3) with time zone,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_timesheets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"period_start" timestamp(3) with time zone NOT NULL,
  	"period_end" timestamp(3) with time zone NOT NULL,
  	"status" "enum_acct_timesheets_status" DEFAULT 'draft' NOT NULL,
  	"total_hours" numeric DEFAULT 0,
  	"approved_by_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_fixed_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"asset_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"asset_category" "enum_acct_fixed_assets_asset_category" DEFAULT 'equipment' NOT NULL,
  	"purchase_date" timestamp(3) with time zone NOT NULL,
  	"in_service_date" timestamp(3) with time zone,
  	"cost" numeric NOT NULL,
  	"salvage_value" numeric DEFAULT 0,
  	"useful_life_months" numeric NOT NULL,
  	"depreciation_method" "enum_acct_fixed_assets_depreciation_method" DEFAULT 'straight_line' NOT NULL,
  	"expense_account_id" integer NOT NULL,
  	"asset_account_id" integer NOT NULL,
  	"accumulated_depreciation_account_id" integer NOT NULL,
  	"branch_id" integer,
  	"department_id" integer,
  	"location_id" integer,
  	"status" "enum_acct_fixed_assets_status" DEFAULT 'draft' NOT NULL,
  	"supporting_document_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_depr_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fixed_asset_id" integer NOT NULL,
  	"fiscal_year_id" integer NOT NULL,
  	"period_id" integer NOT NULL,
  	"depreciation_date" timestamp(3) with time zone NOT NULL,
  	"amount" numeric NOT NULL,
  	"status" "enum_acct_depr_entries_status" DEFAULT 'scheduled' NOT NULL,
  	"posted_journal_entry_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_asset_disposals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fixed_asset_id" integer NOT NULL,
  	"disposal_date" timestamp(3) with time zone NOT NULL,
  	"disposal_type" "enum_acct_asset_disposals_disposal_type" DEFAULT 'sale' NOT NULL,
  	"proceeds_amount" numeric DEFAULT 0,
  	"book_value_at_disposal" numeric DEFAULT 0,
  	"gain_or_loss_amount" numeric DEFAULT 0,
  	"proceeds_account_id" integer,
  	"gain_account_id" integer,
  	"loss_account_id" integer,
  	"status" "enum_acct_asset_disposals_status" DEFAULT 'draft' NOT NULL,
  	"posted_journal_entry_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_payroll_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"payroll_code" varchar NOT NULL,
  	"period_start" timestamp(3) with time zone NOT NULL,
  	"period_end" timestamp(3) with time zone NOT NULL,
  	"payment_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_acct_payroll_runs_status" DEFAULT 'draft' NOT NULL,
  	"branch_id" integer,
  	"department_id" integer,
  	"approval_request_id" integer,
  	"posted_journal_entry_id" integer,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_payroll_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"payroll_run_id" integer NOT NULL,
  	"user_id" integer,
  	"instructor_id" integer,
  	"project_id" integer,
  	"entry_type" "enum_acct_payroll_entries_entry_type" DEFAULT 'salary' NOT NULL,
  	"gross_amount" numeric DEFAULT 0 NOT NULL,
  	"deduction_amount" numeric DEFAULT 0,
  	"net_amount" numeric DEFAULT 0 NOT NULL,
  	"expense_account_id" integer NOT NULL,
  	"payable_account_id" integer NOT NULL,
  	"status" "enum_acct_payroll_entries_status" DEFAULT 'draft' NOT NULL,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_approval_workflows_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step_number" numeric NOT NULL,
  	"label" varchar,
  	"approver_user_id" integer,
  	"approver_role" varchar
  );
  
  CREATE TABLE "acct_approval_workflows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"entity_type" "enum_acct_approval_workflows_entity_type" NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_approval_requests_approval_trail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step_number" numeric,
  	"approver_id" integer,
  	"decision" varchar,
  	"notes" varchar,
  	"acted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "acct_approval_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_id" integer NOT NULL,
  	"entity_type" "enum_acct_approval_requests_entity_type" NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"status" "enum_acct_approval_requests_status" DEFAULT 'pending' NOT NULL,
  	"requested_by_id" integer,
  	"current_approver_id" integer,
  	"requested_at" timestamp(3) with time zone NOT NULL,
  	"resolved_at" timestamp(3) with time zone,
  	"resolution_notes" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acct_audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entity_type" "enum_acct_audit_logs_entity_type" NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"action_type" "enum_acct_audit_logs_action_type" NOT NULL,
  	"performed_by_id" integer,
  	"performed_at" timestamp(3) with time zone NOT NULL,
  	"before_data" jsonb,
  	"after_data" jsonb,
  	"reason" varchar,
  	"metadata" jsonb,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "accounting_invoices" ADD COLUMN "project_id" integer;
  ALTER TABLE "accounting_expenses" ADD COLUMN "project_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_branches_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_departments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_locations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_project_tasks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_budgets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_budget_lines_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_forecast_scenarios_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_time_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_timesheets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_fixed_assets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_depr_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_asset_disposals_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_payroll_runs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_payroll_entries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_approval_workflows_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_approval_requests_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acct_audit_logs_id" integer;
  ALTER TABLE "acct_branches" ADD CONSTRAINT "acct_branches_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_branches" ADD CONSTRAINT "acct_branches_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_departments" ADD CONSTRAINT "acct_departments_branch_id_acct_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."acct_branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_departments" ADD CONSTRAINT "acct_departments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_departments" ADD CONSTRAINT "acct_departments_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_locations" ADD CONSTRAINT "acct_locations_branch_id_acct_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."acct_branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_locations" ADD CONSTRAINT "acct_locations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_locations" ADD CONSTRAINT "acct_locations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_customer_id_accounting_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."accounting_customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_branch_id_acct_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."acct_branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_department_id_acct_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."acct_departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_location_id_acct_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."acct_locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_projects" ADD CONSTRAINT "acct_projects_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_project_tasks" ADD CONSTRAINT "acct_project_tasks_project_id_acct_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."acct_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_project_tasks" ADD CONSTRAINT "acct_project_tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_project_tasks" ADD CONSTRAINT "acct_project_tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_project_tasks" ADD CONSTRAINT "acct_project_tasks_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_branch_id_acct_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."acct_branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_department_id_acct_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."acct_departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_location_id_acct_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."acct_locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_project_id_acct_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."acct_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_course_category_id_course_categories_id_fk" FOREIGN KEY ("course_category_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_scenario_id_acct_forecast_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."acct_forecast_scenarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budgets" ADD CONSTRAINT "acct_budgets_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budget_lines" ADD CONSTRAINT "acct_budget_lines_budget_id_acct_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."acct_budgets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budget_lines" ADD CONSTRAINT "acct_budget_lines_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budget_lines" ADD CONSTRAINT "acct_budget_lines_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budget_lines" ADD CONSTRAINT "acct_budget_lines_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_budget_lines" ADD CONSTRAINT "acct_budget_lines_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_forecast_scenarios" ADD CONSTRAINT "acct_forecast_scenarios_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_forecast_scenarios" ADD CONSTRAINT "acct_forecast_scenarios_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_forecast_scenarios" ADD CONSTRAINT "acct_forecast_scenarios_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_timesheet_id_acct_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."acct_timesheets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_project_id_acct_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."acct_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_project_task_id_acct_project_tasks_id_fk" FOREIGN KEY ("project_task_id") REFERENCES "public"."acct_project_tasks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_time_entries" ADD CONSTRAINT "acct_time_entries_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_timesheets" ADD CONSTRAINT "acct_timesheets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_timesheets" ADD CONSTRAINT "acct_timesheets_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_timesheets" ADD CONSTRAINT "acct_timesheets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_timesheets" ADD CONSTRAINT "acct_timesheets_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_expense_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_asset_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("asset_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_accumulated_depreciation_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("accumulated_depreciation_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_branch_id_acct_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."acct_branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_department_id_acct_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."acct_departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_location_id_acct_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."acct_locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_supporting_document_id_media_id_fk" FOREIGN KEY ("supporting_document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_fixed_assets" ADD CONSTRAINT "acct_fixed_assets_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_depr_entries" ADD CONSTRAINT "acct_depr_entries_fixed_asset_id_acct_fixed_assets_id_fk" FOREIGN KEY ("fixed_asset_id") REFERENCES "public"."acct_fixed_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_depr_entries" ADD CONSTRAINT "acct_depr_entries_fiscal_year_id_accounting_fiscal_years_id_fk" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."accounting_fiscal_years"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_depr_entries" ADD CONSTRAINT "acct_depr_entries_period_id_accounting_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."accounting_periods"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_depr_entries" ADD CONSTRAINT "acct_depr_entries_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_depr_entries" ADD CONSTRAINT "acct_depr_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_depr_entries" ADD CONSTRAINT "acct_depr_entries_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_fixed_asset_id_acct_fixed_assets_id_fk" FOREIGN KEY ("fixed_asset_id") REFERENCES "public"."acct_fixed_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_proceeds_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("proceeds_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_gain_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("gain_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_loss_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("loss_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_asset_disposals" ADD CONSTRAINT "acct_asset_disposals_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_runs" ADD CONSTRAINT "acct_payroll_runs_branch_id_acct_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."acct_branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_runs" ADD CONSTRAINT "acct_payroll_runs_department_id_acct_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."acct_departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_runs" ADD CONSTRAINT "acct_payroll_runs_approval_request_id_acct_approval_requests_id_fk" FOREIGN KEY ("approval_request_id") REFERENCES "public"."acct_approval_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_runs" ADD CONSTRAINT "acct_payroll_runs_posted_journal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("posted_journal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_runs" ADD CONSTRAINT "acct_payroll_runs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_runs" ADD CONSTRAINT "acct_payroll_runs_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_payroll_run_id_acct_payroll_runs_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."acct_payroll_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_project_id_acct_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."acct_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_expense_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_payable_account_id_accounting_chart_of_accounts_id_fk" FOREIGN KEY ("payable_account_id") REFERENCES "public"."accounting_chart_of_accounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_payroll_entries" ADD CONSTRAINT "acct_payroll_entries_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_workflows_steps" ADD CONSTRAINT "acct_approval_workflows_steps_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_workflows_steps" ADD CONSTRAINT "acct_approval_workflows_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."acct_approval_workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "acct_approval_workflows" ADD CONSTRAINT "acct_approval_workflows_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_workflows" ADD CONSTRAINT "acct_approval_workflows_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_requests_approval_trail" ADD CONSTRAINT "acct_approval_requests_approval_trail_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_requests_approval_trail" ADD CONSTRAINT "acct_approval_requests_approval_trail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."acct_approval_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "acct_approval_requests" ADD CONSTRAINT "acct_approval_requests_workflow_id_acct_approval_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."acct_approval_workflows"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_requests" ADD CONSTRAINT "acct_approval_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_requests" ADD CONSTRAINT "acct_approval_requests_current_approver_id_users_id_fk" FOREIGN KEY ("current_approver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_requests" ADD CONSTRAINT "acct_approval_requests_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_approval_requests" ADD CONSTRAINT "acct_approval_requests_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_audit_logs" ADD CONSTRAINT "acct_audit_logs_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_audit_logs" ADD CONSTRAINT "acct_audit_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acct_audit_logs" ADD CONSTRAINT "acct_audit_logs_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "acct_branches_branch_code_idx" ON "acct_branches" USING btree ("branch_code");
  CREATE INDEX "acct_branches_created_by_idx" ON "acct_branches" USING btree ("created_by_id");
  CREATE INDEX "acct_branches_updated_by_idx" ON "acct_branches" USING btree ("updated_by_id");
  CREATE INDEX "acct_branches_updated_at_idx" ON "acct_branches" USING btree ("updated_at");
  CREATE INDEX "acct_branches_created_at_idx" ON "acct_branches" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_departments_department_code_idx" ON "acct_departments" USING btree ("department_code");
  CREATE INDEX "acct_departments_branch_idx" ON "acct_departments" USING btree ("branch_id");
  CREATE INDEX "acct_departments_created_by_idx" ON "acct_departments" USING btree ("created_by_id");
  CREATE INDEX "acct_departments_updated_by_idx" ON "acct_departments" USING btree ("updated_by_id");
  CREATE INDEX "acct_departments_updated_at_idx" ON "acct_departments" USING btree ("updated_at");
  CREATE INDEX "acct_departments_created_at_idx" ON "acct_departments" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_locations_location_code_idx" ON "acct_locations" USING btree ("location_code");
  CREATE INDEX "acct_locations_branch_idx" ON "acct_locations" USING btree ("branch_id");
  CREATE INDEX "acct_locations_created_by_idx" ON "acct_locations" USING btree ("created_by_id");
  CREATE INDEX "acct_locations_updated_by_idx" ON "acct_locations" USING btree ("updated_by_id");
  CREATE INDEX "acct_locations_updated_at_idx" ON "acct_locations" USING btree ("updated_at");
  CREATE INDEX "acct_locations_created_at_idx" ON "acct_locations" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_projects_project_code_idx" ON "acct_projects" USING btree ("project_code");
  CREATE INDEX "acct_projects_customer_idx" ON "acct_projects" USING btree ("customer_id");
  CREATE INDEX "acct_projects_manager_user_idx" ON "acct_projects" USING btree ("manager_user_id");
  CREATE INDEX "acct_projects_course_idx" ON "acct_projects" USING btree ("course_id");
  CREATE INDEX "acct_projects_branch_idx" ON "acct_projects" USING btree ("branch_id");
  CREATE INDEX "acct_projects_department_idx" ON "acct_projects" USING btree ("department_id");
  CREATE INDEX "acct_projects_location_idx" ON "acct_projects" USING btree ("location_id");
  CREATE INDEX "acct_projects_created_by_idx" ON "acct_projects" USING btree ("created_by_id");
  CREATE INDEX "acct_projects_updated_by_idx" ON "acct_projects" USING btree ("updated_by_id");
  CREATE INDEX "acct_projects_updated_at_idx" ON "acct_projects" USING btree ("updated_at");
  CREATE INDEX "acct_projects_created_at_idx" ON "acct_projects" USING btree ("created_at");
  CREATE INDEX "acct_project_tasks_project_idx" ON "acct_project_tasks" USING btree ("project_id");
  CREATE INDEX "acct_project_tasks_task_code_idx" ON "acct_project_tasks" USING btree ("task_code");
  CREATE INDEX "acct_project_tasks_assigned_to_idx" ON "acct_project_tasks" USING btree ("assigned_to_id");
  CREATE INDEX "acct_project_tasks_created_by_idx" ON "acct_project_tasks" USING btree ("created_by_id");
  CREATE INDEX "acct_project_tasks_updated_by_idx" ON "acct_project_tasks" USING btree ("updated_by_id");
  CREATE INDEX "acct_project_tasks_updated_at_idx" ON "acct_project_tasks" USING btree ("updated_at");
  CREATE INDEX "acct_project_tasks_created_at_idx" ON "acct_project_tasks" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_budgets_budget_code_idx" ON "acct_budgets" USING btree ("budget_code");
  CREATE INDEX "acct_budgets_fiscal_year_idx" ON "acct_budgets" USING btree ("fiscal_year_id");
  CREATE INDEX "acct_budgets_branch_idx" ON "acct_budgets" USING btree ("branch_id");
  CREATE INDEX "acct_budgets_department_idx" ON "acct_budgets" USING btree ("department_id");
  CREATE INDEX "acct_budgets_location_idx" ON "acct_budgets" USING btree ("location_id");
  CREATE INDEX "acct_budgets_project_idx" ON "acct_budgets" USING btree ("project_id");
  CREATE INDEX "acct_budgets_course_category_idx" ON "acct_budgets" USING btree ("course_category_id");
  CREATE INDEX "acct_budgets_scenario_idx" ON "acct_budgets" USING btree ("scenario_id");
  CREATE INDEX "acct_budgets_created_by_idx" ON "acct_budgets" USING btree ("created_by_id");
  CREATE INDEX "acct_budgets_updated_by_idx" ON "acct_budgets" USING btree ("updated_by_id");
  CREATE INDEX "acct_budgets_updated_at_idx" ON "acct_budgets" USING btree ("updated_at");
  CREATE INDEX "acct_budgets_created_at_idx" ON "acct_budgets" USING btree ("created_at");
  CREATE INDEX "acct_budget_lines_budget_idx" ON "acct_budget_lines" USING btree ("budget_id");
  CREATE INDEX "acct_budget_lines_account_idx" ON "acct_budget_lines" USING btree ("account_id");
  CREATE INDEX "acct_budget_lines_period_idx" ON "acct_budget_lines" USING btree ("period_id");
  CREATE INDEX "acct_budget_lines_created_by_idx" ON "acct_budget_lines" USING btree ("created_by_id");
  CREATE INDEX "acct_budget_lines_updated_by_idx" ON "acct_budget_lines" USING btree ("updated_by_id");
  CREATE INDEX "acct_budget_lines_updated_at_idx" ON "acct_budget_lines" USING btree ("updated_at");
  CREATE INDEX "acct_budget_lines_created_at_idx" ON "acct_budget_lines" USING btree ("created_at");
  CREATE INDEX "acct_forecast_scenarios_fiscal_year_idx" ON "acct_forecast_scenarios" USING btree ("fiscal_year_id");
  CREATE INDEX "acct_forecast_scenarios_created_by_idx" ON "acct_forecast_scenarios" USING btree ("created_by_id");
  CREATE INDEX "acct_forecast_scenarios_updated_by_idx" ON "acct_forecast_scenarios" USING btree ("updated_by_id");
  CREATE INDEX "acct_forecast_scenarios_updated_at_idx" ON "acct_forecast_scenarios" USING btree ("updated_at");
  CREATE INDEX "acct_forecast_scenarios_created_at_idx" ON "acct_forecast_scenarios" USING btree ("created_at");
  CREATE INDEX "acct_time_entries_entry_date_idx" ON "acct_time_entries" USING btree ("entry_date");
  CREATE INDEX "acct_time_entries_user_idx" ON "acct_time_entries" USING btree ("user_id");
  CREATE INDEX "acct_time_entries_timesheet_idx" ON "acct_time_entries" USING btree ("timesheet_id");
  CREATE INDEX "acct_time_entries_project_idx" ON "acct_time_entries" USING btree ("project_id");
  CREATE INDEX "acct_time_entries_project_task_idx" ON "acct_time_entries" USING btree ("project_task_id");
  CREATE INDEX "acct_time_entries_course_idx" ON "acct_time_entries" USING btree ("course_id");
  CREATE INDEX "acct_time_entries_instructor_idx" ON "acct_time_entries" USING btree ("instructor_id");
  CREATE INDEX "acct_time_entries_approved_by_idx" ON "acct_time_entries" USING btree ("approved_by_id");
  CREATE INDEX "acct_time_entries_created_by_idx" ON "acct_time_entries" USING btree ("created_by_id");
  CREATE INDEX "acct_time_entries_updated_by_idx" ON "acct_time_entries" USING btree ("updated_by_id");
  CREATE INDEX "acct_time_entries_updated_at_idx" ON "acct_time_entries" USING btree ("updated_at");
  CREATE INDEX "acct_time_entries_created_at_idx" ON "acct_time_entries" USING btree ("created_at");
  CREATE INDEX "acct_timesheets_user_idx" ON "acct_timesheets" USING btree ("user_id");
  CREATE INDEX "acct_timesheets_period_start_idx" ON "acct_timesheets" USING btree ("period_start");
  CREATE INDEX "acct_timesheets_period_end_idx" ON "acct_timesheets" USING btree ("period_end");
  CREATE INDEX "acct_timesheets_approved_by_idx" ON "acct_timesheets" USING btree ("approved_by_id");
  CREATE INDEX "acct_timesheets_created_by_idx" ON "acct_timesheets" USING btree ("created_by_id");
  CREATE INDEX "acct_timesheets_updated_by_idx" ON "acct_timesheets" USING btree ("updated_by_id");
  CREATE INDEX "acct_timesheets_updated_at_idx" ON "acct_timesheets" USING btree ("updated_at");
  CREATE INDEX "acct_timesheets_created_at_idx" ON "acct_timesheets" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_fixed_assets_asset_code_idx" ON "acct_fixed_assets" USING btree ("asset_code");
  CREATE INDEX "acct_fixed_assets_expense_account_idx" ON "acct_fixed_assets" USING btree ("expense_account_id");
  CREATE INDEX "acct_fixed_assets_asset_account_idx" ON "acct_fixed_assets" USING btree ("asset_account_id");
  CREATE INDEX "acct_fixed_assets_accumulated_depreciation_account_idx" ON "acct_fixed_assets" USING btree ("accumulated_depreciation_account_id");
  CREATE INDEX "acct_fixed_assets_branch_idx" ON "acct_fixed_assets" USING btree ("branch_id");
  CREATE INDEX "acct_fixed_assets_department_idx" ON "acct_fixed_assets" USING btree ("department_id");
  CREATE INDEX "acct_fixed_assets_location_idx" ON "acct_fixed_assets" USING btree ("location_id");
  CREATE INDEX "acct_fixed_assets_supporting_document_idx" ON "acct_fixed_assets" USING btree ("supporting_document_id");
  CREATE INDEX "acct_fixed_assets_created_by_idx" ON "acct_fixed_assets" USING btree ("created_by_id");
  CREATE INDEX "acct_fixed_assets_updated_by_idx" ON "acct_fixed_assets" USING btree ("updated_by_id");
  CREATE INDEX "acct_fixed_assets_updated_at_idx" ON "acct_fixed_assets" USING btree ("updated_at");
  CREATE INDEX "acct_fixed_assets_created_at_idx" ON "acct_fixed_assets" USING btree ("created_at");
  CREATE INDEX "acct_depr_entries_fixed_asset_idx" ON "acct_depr_entries" USING btree ("fixed_asset_id");
  CREATE INDEX "acct_depr_entries_fiscal_year_idx" ON "acct_depr_entries" USING btree ("fiscal_year_id");
  CREATE INDEX "acct_depr_entries_period_idx" ON "acct_depr_entries" USING btree ("period_id");
  CREATE INDEX "acct_depr_entries_depreciation_date_idx" ON "acct_depr_entries" USING btree ("depreciation_date");
  CREATE INDEX "acct_depr_entries_posted_journal_entry_idx" ON "acct_depr_entries" USING btree ("posted_journal_entry_id");
  CREATE INDEX "acct_depr_entries_created_by_idx" ON "acct_depr_entries" USING btree ("created_by_id");
  CREATE INDEX "acct_depr_entries_updated_by_idx" ON "acct_depr_entries" USING btree ("updated_by_id");
  CREATE INDEX "acct_depr_entries_updated_at_idx" ON "acct_depr_entries" USING btree ("updated_at");
  CREATE INDEX "acct_depr_entries_created_at_idx" ON "acct_depr_entries" USING btree ("created_at");
  CREATE INDEX "acct_asset_disposals_fixed_asset_idx" ON "acct_asset_disposals" USING btree ("fixed_asset_id");
  CREATE INDEX "acct_asset_disposals_disposal_date_idx" ON "acct_asset_disposals" USING btree ("disposal_date");
  CREATE INDEX "acct_asset_disposals_proceeds_account_idx" ON "acct_asset_disposals" USING btree ("proceeds_account_id");
  CREATE INDEX "acct_asset_disposals_gain_account_idx" ON "acct_asset_disposals" USING btree ("gain_account_id");
  CREATE INDEX "acct_asset_disposals_loss_account_idx" ON "acct_asset_disposals" USING btree ("loss_account_id");
  CREATE INDEX "acct_asset_disposals_posted_journal_entry_idx" ON "acct_asset_disposals" USING btree ("posted_journal_entry_id");
  CREATE INDEX "acct_asset_disposals_created_by_idx" ON "acct_asset_disposals" USING btree ("created_by_id");
  CREATE INDEX "acct_asset_disposals_updated_by_idx" ON "acct_asset_disposals" USING btree ("updated_by_id");
  CREATE INDEX "acct_asset_disposals_updated_at_idx" ON "acct_asset_disposals" USING btree ("updated_at");
  CREATE INDEX "acct_asset_disposals_created_at_idx" ON "acct_asset_disposals" USING btree ("created_at");
  CREATE UNIQUE INDEX "acct_payroll_runs_payroll_code_idx" ON "acct_payroll_runs" USING btree ("payroll_code");
  CREATE INDEX "acct_payroll_runs_period_start_idx" ON "acct_payroll_runs" USING btree ("period_start");
  CREATE INDEX "acct_payroll_runs_period_end_idx" ON "acct_payroll_runs" USING btree ("period_end");
  CREATE INDEX "acct_payroll_runs_payment_date_idx" ON "acct_payroll_runs" USING btree ("payment_date");
  CREATE INDEX "acct_payroll_runs_branch_idx" ON "acct_payroll_runs" USING btree ("branch_id");
  CREATE INDEX "acct_payroll_runs_department_idx" ON "acct_payroll_runs" USING btree ("department_id");
  CREATE INDEX "acct_payroll_runs_approval_request_idx" ON "acct_payroll_runs" USING btree ("approval_request_id");
  CREATE INDEX "acct_payroll_runs_posted_journal_entry_idx" ON "acct_payroll_runs" USING btree ("posted_journal_entry_id");
  CREATE INDEX "acct_payroll_runs_created_by_idx" ON "acct_payroll_runs" USING btree ("created_by_id");
  CREATE INDEX "acct_payroll_runs_updated_by_idx" ON "acct_payroll_runs" USING btree ("updated_by_id");
  CREATE INDEX "acct_payroll_runs_updated_at_idx" ON "acct_payroll_runs" USING btree ("updated_at");
  CREATE INDEX "acct_payroll_runs_created_at_idx" ON "acct_payroll_runs" USING btree ("created_at");
  CREATE INDEX "acct_payroll_entries_payroll_run_idx" ON "acct_payroll_entries" USING btree ("payroll_run_id");
  CREATE INDEX "acct_payroll_entries_user_idx" ON "acct_payroll_entries" USING btree ("user_id");
  CREATE INDEX "acct_payroll_entries_instructor_idx" ON "acct_payroll_entries" USING btree ("instructor_id");
  CREATE INDEX "acct_payroll_entries_project_idx" ON "acct_payroll_entries" USING btree ("project_id");
  CREATE INDEX "acct_payroll_entries_expense_account_idx" ON "acct_payroll_entries" USING btree ("expense_account_id");
  CREATE INDEX "acct_payroll_entries_payable_account_idx" ON "acct_payroll_entries" USING btree ("payable_account_id");
  CREATE INDEX "acct_payroll_entries_created_by_idx" ON "acct_payroll_entries" USING btree ("created_by_id");
  CREATE INDEX "acct_payroll_entries_updated_by_idx" ON "acct_payroll_entries" USING btree ("updated_by_id");
  CREATE INDEX "acct_payroll_entries_updated_at_idx" ON "acct_payroll_entries" USING btree ("updated_at");
  CREATE INDEX "acct_payroll_entries_created_at_idx" ON "acct_payroll_entries" USING btree ("created_at");
  CREATE INDEX "acct_approval_workflows_steps_order_idx" ON "acct_approval_workflows_steps" USING btree ("_order");
  CREATE INDEX "acct_approval_workflows_steps_parent_id_idx" ON "acct_approval_workflows_steps" USING btree ("_parent_id");
  CREATE INDEX "acct_approval_workflows_steps_approver_user_idx" ON "acct_approval_workflows_steps" USING btree ("approver_user_id");
  CREATE UNIQUE INDEX "acct_approval_workflows_workflow_code_idx" ON "acct_approval_workflows" USING btree ("workflow_code");
  CREATE INDEX "acct_approval_workflows_created_by_idx" ON "acct_approval_workflows" USING btree ("created_by_id");
  CREATE INDEX "acct_approval_workflows_updated_by_idx" ON "acct_approval_workflows" USING btree ("updated_by_id");
  CREATE INDEX "acct_approval_workflows_updated_at_idx" ON "acct_approval_workflows" USING btree ("updated_at");
  CREATE INDEX "acct_approval_workflows_created_at_idx" ON "acct_approval_workflows" USING btree ("created_at");
  CREATE INDEX "acct_approval_requests_approval_trail_order_idx" ON "acct_approval_requests_approval_trail" USING btree ("_order");
  CREATE INDEX "acct_approval_requests_approval_trail_parent_id_idx" ON "acct_approval_requests_approval_trail" USING btree ("_parent_id");
  CREATE INDEX "acct_approval_requests_approval_trail_approver_idx" ON "acct_approval_requests_approval_trail" USING btree ("approver_id");
  CREATE INDEX "acct_approval_requests_workflow_idx" ON "acct_approval_requests" USING btree ("workflow_id");
  CREATE INDEX "acct_approval_requests_entity_id_idx" ON "acct_approval_requests" USING btree ("entity_id");
  CREATE INDEX "acct_approval_requests_requested_by_idx" ON "acct_approval_requests" USING btree ("requested_by_id");
  CREATE INDEX "acct_approval_requests_current_approver_idx" ON "acct_approval_requests" USING btree ("current_approver_id");
  CREATE INDEX "acct_approval_requests_created_by_idx" ON "acct_approval_requests" USING btree ("created_by_id");
  CREATE INDEX "acct_approval_requests_updated_by_idx" ON "acct_approval_requests" USING btree ("updated_by_id");
  CREATE INDEX "acct_approval_requests_updated_at_idx" ON "acct_approval_requests" USING btree ("updated_at");
  CREATE INDEX "acct_approval_requests_created_at_idx" ON "acct_approval_requests" USING btree ("created_at");
  CREATE INDEX "acct_audit_logs_entity_id_idx" ON "acct_audit_logs" USING btree ("entity_id");
  CREATE INDEX "acct_audit_logs_performed_by_idx" ON "acct_audit_logs" USING btree ("performed_by_id");
  CREATE INDEX "acct_audit_logs_performed_at_idx" ON "acct_audit_logs" USING btree ("performed_at");
  CREATE INDEX "acct_audit_logs_created_by_idx" ON "acct_audit_logs" USING btree ("created_by_id");
  CREATE INDEX "acct_audit_logs_updated_by_idx" ON "acct_audit_logs" USING btree ("updated_by_id");
  CREATE INDEX "acct_audit_logs_updated_at_idx" ON "acct_audit_logs" USING btree ("updated_at");
  CREATE INDEX "acct_audit_logs_created_at_idx" ON "acct_audit_logs" USING btree ("created_at");
  ALTER TABLE "accounting_invoices" ADD CONSTRAINT "accounting_invoices_project_id_acct_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."acct_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_expenses" ADD CONSTRAINT "accounting_expenses_project_id_acct_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."acct_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_branches_fk" FOREIGN KEY ("acct_branches_id") REFERENCES "public"."acct_branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_departments_fk" FOREIGN KEY ("acct_departments_id") REFERENCES "public"."acct_departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_locations_fk" FOREIGN KEY ("acct_locations_id") REFERENCES "public"."acct_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_projects_fk" FOREIGN KEY ("acct_projects_id") REFERENCES "public"."acct_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_project_tasks_fk" FOREIGN KEY ("acct_project_tasks_id") REFERENCES "public"."acct_project_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_budgets_fk" FOREIGN KEY ("acct_budgets_id") REFERENCES "public"."acct_budgets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_budget_lines_fk" FOREIGN KEY ("acct_budget_lines_id") REFERENCES "public"."acct_budget_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_forecast_scenari_fk" FOREIGN KEY ("acct_forecast_scenarios_id") REFERENCES "public"."acct_forecast_scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_time_entries_fk" FOREIGN KEY ("acct_time_entries_id") REFERENCES "public"."acct_time_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_timesheets_fk" FOREIGN KEY ("acct_timesheets_id") REFERENCES "public"."acct_timesheets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_fixed_assets_fk" FOREIGN KEY ("acct_fixed_assets_id") REFERENCES "public"."acct_fixed_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_depreciation_ent_fk" FOREIGN KEY ("acct_depr_entries_id") REFERENCES "public"."acct_depr_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_asset_disposals_fk" FOREIGN KEY ("acct_asset_disposals_id") REFERENCES "public"."acct_asset_disposals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_payroll_runs_fk" FOREIGN KEY ("acct_payroll_runs_id") REFERENCES "public"."acct_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_payroll_entries_fk" FOREIGN KEY ("acct_payroll_entries_id") REFERENCES "public"."acct_payroll_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_approval_workflo_fk" FOREIGN KEY ("acct_approval_workflows_id") REFERENCES "public"."acct_approval_workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_approval_request_fk" FOREIGN KEY ("acct_approval_requests_id") REFERENCES "public"."acct_approval_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounting_audit_logs_fk" FOREIGN KEY ("acct_audit_logs_id") REFERENCES "public"."acct_audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "accounting_invoices_project_idx" ON "accounting_invoices" USING btree ("project_id");
  CREATE INDEX "accounting_expenses_project_idx" ON "accounting_expenses" USING btree ("project_id");
  CREATE INDEX "payload_locked_documents_rels_acct_branches_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_branches_id");
  CREATE INDEX "payload_locked_documents_rels_acct_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_departments_id");
  CREATE INDEX "payload_locked_documents_rels_acct_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_locations_id");
  CREATE INDEX "payload_locked_documents_rels_acct_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_projects_id");
  CREATE INDEX "payload_locked_documents_rels_acct_project_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_project_tasks_id");
  CREATE INDEX "payload_locked_documents_rels_acct_budgets_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_budgets_id");
  CREATE INDEX "payload_locked_documents_rels_acct_budget_lines_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_budget_lines_id");
  CREATE INDEX "payload_locked_documents_rels_acct_forecast_scenarios_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_forecast_scenarios_id");
  CREATE INDEX "payload_locked_documents_rels_acct_time_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_time_entries_id");
  CREATE INDEX "payload_locked_documents_rels_acct_timesheets_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_timesheets_id");
  CREATE INDEX "payload_locked_documents_rels_acct_fixed_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_fixed_assets_id");
  CREATE INDEX "payload_locked_documents_rels_acct_depr_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_depr_entries_id");
  CREATE INDEX "payload_locked_documents_rels_acct_asset_disposals_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_asset_disposals_id");
  CREATE INDEX "payload_locked_documents_rels_acct_payroll_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_payroll_runs_id");
  CREATE INDEX "payload_locked_documents_rels_acct_payroll_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_payroll_entries_id");
  CREATE INDEX "payload_locked_documents_rels_acct_approval_workflows_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_approval_workflows_id");
  CREATE INDEX "payload_locked_documents_rels_acct_approval_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_approval_requests_id");
  CREATE INDEX "payload_locked_documents_rels_acct_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("acct_audit_logs_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "acct_branches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_departments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_locations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_project_tasks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_budgets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_budget_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_forecast_scenarios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_time_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_timesheets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_fixed_assets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_depr_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_asset_disposals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_payroll_runs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_payroll_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_approval_workflows_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_approval_workflows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_approval_requests_approval_trail" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_approval_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acct_audit_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "acct_branches" CASCADE;
  DROP TABLE "acct_departments" CASCADE;
  DROP TABLE "acct_locations" CASCADE;
  DROP TABLE "acct_projects" CASCADE;
  DROP TABLE "acct_project_tasks" CASCADE;
  DROP TABLE "acct_budgets" CASCADE;
  DROP TABLE "acct_budget_lines" CASCADE;
  DROP TABLE "acct_forecast_scenarios" CASCADE;
  DROP TABLE "acct_time_entries" CASCADE;
  DROP TABLE "acct_timesheets" CASCADE;
  DROP TABLE "acct_fixed_assets" CASCADE;
  DROP TABLE "acct_depr_entries" CASCADE;
  DROP TABLE "acct_asset_disposals" CASCADE;
  DROP TABLE "acct_payroll_runs" CASCADE;
  DROP TABLE "acct_payroll_entries" CASCADE;
  DROP TABLE "acct_approval_workflows_steps" CASCADE;
  DROP TABLE "acct_approval_workflows" CASCADE;
  DROP TABLE "acct_approval_requests_approval_trail" CASCADE;
  DROP TABLE "acct_approval_requests" CASCADE;
  DROP TABLE "acct_audit_logs" CASCADE;
  ALTER TABLE "accounting_invoices" DROP CONSTRAINT "accounting_invoices_project_id_acct_projects_id_fk";
  
  ALTER TABLE "accounting_expenses" DROP CONSTRAINT "accounting_expenses_project_id_acct_projects_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_branches_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_departments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_locations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_project_tasks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_budgets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_budget_lines_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_forecast_scenari_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_time_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_timesheets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_fixed_assets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_depreciation_ent_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_asset_disposals_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_payroll_runs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_payroll_entries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_approval_workflo_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_approval_request_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_accounting_audit_logs_fk";
  
  ALTER TABLE "accounting_bank_transactions" ALTER COLUMN "matched_entity_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_accounting_bank_transactions_matched_entity_type";
  CREATE TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry', 'enrollment_billing_link', 'payment_allocation', 'receipt', 'refund', 'revenue_recognition_schedule', 'scholarship_award', 'corporate_billing_link', 'instructor_payout');
  ALTER TABLE "accounting_bank_transactions" ALTER COLUMN "matched_entity_type" SET DATA TYPE "public"."enum_accounting_bank_transactions_matched_entity_type" USING "matched_entity_type"::"public"."enum_accounting_bank_transactions_matched_entity_type";
  ALTER TABLE "accounting_document_links" ALTER COLUMN "entity_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_accounting_document_links_entity_type";
  CREATE TYPE "public"."enum_accounting_document_links_entity_type" AS ENUM('customer', 'vendor', 'invoice', 'bill', 'payment_received', 'payment_made', 'expense', 'credit_note', 'vendor_credit', 'bank_transaction', 'bank_reconciliation', 'deposit', 'transfer', 'journal_entry', 'enrollment_billing_link', 'payment_allocation', 'receipt', 'refund', 'revenue_recognition_schedule', 'scholarship_award', 'corporate_billing_link', 'instructor_payout');
  ALTER TABLE "accounting_document_links" ALTER COLUMN "entity_type" SET DATA TYPE "public"."enum_accounting_document_links_entity_type" USING "entity_type"::"public"."enum_accounting_document_links_entity_type";
  DROP INDEX "accounting_invoices_project_idx";
  DROP INDEX "accounting_expenses_project_idx";
  DROP INDEX "payload_locked_documents_rels_acct_branches_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_departments_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_locations_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_project_tasks_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_budgets_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_budget_lines_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_forecast_scenarios_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_time_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_timesheets_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_fixed_assets_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_depr_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_asset_disposals_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_payroll_runs_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_payroll_entries_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_approval_workflows_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_approval_requests_id_idx";
  DROP INDEX "payload_locked_documents_rels_acct_audit_logs_id_idx";
  ALTER TABLE "accounting_invoices" DROP COLUMN "project_id";
  ALTER TABLE "accounting_expenses" DROP COLUMN "project_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_branches_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_departments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_locations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_project_tasks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_budgets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_budget_lines_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_forecast_scenarios_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_time_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_timesheets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_fixed_assets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_depr_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_asset_disposals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_payroll_runs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_payroll_entries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_approval_workflows_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_approval_requests_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acct_audit_logs_id";
  DROP TYPE "public"."enum_acct_branches_status";
  DROP TYPE "public"."enum_acct_departments_status";
  DROP TYPE "public"."enum_acct_locations_status";
  DROP TYPE "public"."enum_acct_projects_status";
  DROP TYPE "public"."enum_acct_projects_project_type";
  DROP TYPE "public"."enum_acct_project_tasks_status";
  DROP TYPE "public"."enum_acct_budgets_status";
  DROP TYPE "public"."enum_acct_budgets_budget_type";
  DROP TYPE "public"."enum_acct_forecast_scenarios_scenario_type";
  DROP TYPE "public"."enum_acct_forecast_scenarios_status";
  DROP TYPE "public"."enum_acct_time_entries_status";
  DROP TYPE "public"."enum_acct_time_entries_source_type";
  DROP TYPE "public"."enum_acct_timesheets_status";
  DROP TYPE "public"."enum_acct_fixed_assets_asset_category";
  DROP TYPE "public"."enum_acct_fixed_assets_depreciation_method";
  DROP TYPE "public"."enum_acct_fixed_assets_status";
  DROP TYPE "public"."enum_acct_depr_entries_status";
  DROP TYPE "public"."enum_acct_asset_disposals_disposal_type";
  DROP TYPE "public"."enum_acct_asset_disposals_status";
  DROP TYPE "public"."enum_acct_payroll_runs_status";
  DROP TYPE "public"."enum_acct_payroll_entries_entry_type";
  DROP TYPE "public"."enum_acct_payroll_entries_status";
  DROP TYPE "public"."enum_acct_approval_workflows_entity_type";
  DROP TYPE "public"."enum_acct_approval_requests_entity_type";
  DROP TYPE "public"."enum_acct_approval_requests_status";
  DROP TYPE "public"."enum_acct_audit_logs_entity_type";
  DROP TYPE "public"."enum_acct_audit_logs_action_type";`)
}
