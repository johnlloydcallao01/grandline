import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "acct_currencies" ("code", "name", "symbol", "is_base_currency", "is_active")
    SELECT DISTINCT
      UPPER(TRIM("currency")) AS "code",
      UPPER(TRIM("currency")) AS "name",
      UPPER(TRIM("currency")) AS "symbol",
      false,
      true
    FROM "accounting_customers"
    WHERE COALESCE(TRIM("currency"), '') <> ''
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "acct_payment_terms" ("code", "name", "due_in_days", "description", "is_active")
    SELECT DISTINCT
      UPPER(REGEXP_REPLACE(TRIM("payment_terms"), '[^A-Za-z0-9]+', '_', 'g')) AS "code",
      TRIM("payment_terms") AS "name",
      0,
      'Backfilled from legacy accounting customer payment terms before column removal.',
      true
    FROM "accounting_customers"
    WHERE COALESCE(TRIM("payment_terms"), '') <> ''
    ON CONFLICT ("code") DO NOTHING;

    UPDATE "accounting_customers" AS customer
    SET "currency_reference_id" = currency_master."id"
    FROM "acct_currencies" AS currency_master
    WHERE customer."currency_reference_id" IS NULL
      AND COALESCE(TRIM(customer."currency"), '') <> ''
      AND currency_master."code" = UPPER(TRIM(customer."currency"));

    UPDATE "accounting_customers" AS customer
    SET "payment_term_reference_id" = payment_term_master."id"
    FROM "acct_payment_terms" AS payment_term_master
    WHERE customer."payment_term_reference_id" IS NULL
      AND COALESCE(TRIM(customer."payment_terms"), '') <> ''
      AND payment_term_master."name" = TRIM(customer."payment_terms");

    ALTER TABLE "accounting_customers"
      DROP COLUMN IF EXISTS "currency",
      DROP COLUMN IF EXISTS "payment_terms";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "accounting_customers"
      ADD COLUMN IF NOT EXISTS "currency" varchar DEFAULT 'PHP' NOT NULL,
      ADD COLUMN IF NOT EXISTS "payment_terms" varchar;

    UPDATE "accounting_customers" AS customer
    SET "currency" = COALESCE(currency_master."code", 'PHP')
    FROM "acct_currencies" AS currency_master
    WHERE customer."currency_reference_id" = currency_master."id";

    UPDATE "accounting_customers" AS customer
    SET "payment_terms" = payment_term_master."name"
    FROM "acct_payment_terms" AS payment_term_master
    WHERE customer."payment_term_reference_id" = payment_term_master."id";
  `)
}
