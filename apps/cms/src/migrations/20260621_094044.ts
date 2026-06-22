import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_accounting_bank_statement_imports_source_format" AS ENUM('csv', 'xlsx', 'ofx', 'pdf', 'other');
    CREATE TYPE "public"."enum_accounting_bank_statement_imports_import_status" AS ENUM('queued', 'imported', 'partial_import', 'parse_error', 'reupload_required');

    CREATE TABLE "accounting_bank_statement_imports" (
      "id" serial PRIMARY KEY NOT NULL,
      "import_batch_number" varchar NOT NULL,
      "bank_account_id" integer NOT NULL,
      "statement_file_id" integer NOT NULL,
      "statement_date_from" timestamp(3) with time zone,
      "statement_date_to" timestamp(3) with time zone,
      "source_format" "enum_accounting_bank_statement_imports_source_format" DEFAULT 'csv' NOT NULL,
      "import_status" "enum_accounting_bank_statement_imports_import_status" DEFAULT 'queued' NOT NULL,
      "total_lines" numeric DEFAULT 0,
      "imported_lines" numeric DEFAULT 0,
      "failed_lines" numeric DEFAULT 0,
      "duplicate_lines" numeric DEFAULT 0,
      "imported_transaction_count" numeric DEFAULT 0,
      "uploaded_by_id" integer,
      "imported_by_id" integer,
      "imported_at" timestamp(3) with time zone,
      "parse_error_summary" varchar,
      "notes" varchar,
      "metadata" jsonb,
      "created_by_id" integer,
      "updated_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "accounting_bank_statement_imports"
      ADD CONSTRAINT "accounting_bank_statement_imports_bank_account_id_accounting_bank_accounts_id_fk"
      FOREIGN KEY ("bank_account_id") REFERENCES "public"."accounting_bank_accounts"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_statement_imports"
      ADD CONSTRAINT "accounting_bank_statement_imports_statement_file_id_media_id_fk"
      FOREIGN KEY ("statement_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_statement_imports"
      ADD CONSTRAINT "accounting_bank_statement_imports_uploaded_by_id_users_id_fk"
      FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_statement_imports"
      ADD CONSTRAINT "accounting_bank_statement_imports_imported_by_id_users_id_fk"
      FOREIGN KEY ("imported_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_statement_imports"
      ADD CONSTRAINT "accounting_bank_statement_imports_created_by_id_users_id_fk"
      FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "accounting_bank_statement_imports"
      ADD CONSTRAINT "accounting_bank_statement_imports_updated_by_id_users_id_fk"
      FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "accounting_bank_statement_imports_import_batch_number_idx"
      ON "accounting_bank_statement_imports" USING btree ("import_batch_number");
    CREATE INDEX "accounting_bank_statement_imports_bank_account_idx"
      ON "accounting_bank_statement_imports" USING btree ("bank_account_id");
    CREATE INDEX "accounting_bank_statement_imports_statement_file_idx"
      ON "accounting_bank_statement_imports" USING btree ("statement_file_id");
    CREATE INDEX "accounting_bank_statement_imports_source_format_idx"
      ON "accounting_bank_statement_imports" USING btree ("source_format");
    CREATE INDEX "accounting_bank_statement_imports_import_status_idx"
      ON "accounting_bank_statement_imports" USING btree ("import_status");
    CREATE INDEX "accounting_bank_statement_imports_uploaded_by_idx"
      ON "accounting_bank_statement_imports" USING btree ("uploaded_by_id");
    CREATE INDEX "accounting_bank_statement_imports_imported_by_idx"
      ON "accounting_bank_statement_imports" USING btree ("imported_by_id");
    CREATE INDEX "accounting_bank_statement_imports_created_by_idx"
      ON "accounting_bank_statement_imports" USING btree ("created_by_id");
    CREATE INDEX "accounting_bank_statement_imports_updated_by_idx"
      ON "accounting_bank_statement_imports" USING btree ("updated_by_id");
    CREATE INDEX "accounting_bank_statement_imports_updated_at_idx"
      ON "accounting_bank_statement_imports" USING btree ("updated_at");
    CREATE INDEX "accounting_bank_statement_imports_created_at_idx"
      ON "accounting_bank_statement_imports" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_import_batch_number_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_bank_account_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_statement_file_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_source_format_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_import_status_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_uploaded_by_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_imported_by_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_created_by_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_updated_by_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_updated_at_idx";
    DROP INDEX IF EXISTS "accounting_bank_statement_imports_created_at_idx";

    DROP TABLE IF EXISTS "accounting_bank_statement_imports" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_accounting_bank_statement_imports_source_format";
    DROP TYPE IF EXISTS "public"."enum_accounting_bank_statement_imports_import_status";
  `)
}
