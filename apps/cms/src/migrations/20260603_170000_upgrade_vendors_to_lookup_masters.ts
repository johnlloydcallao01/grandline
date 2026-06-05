import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "acct_currencies" (
      "id" serial PRIMARY KEY NOT NULL,
      "code" varchar NOT NULL UNIQUE,
      "name" varchar NOT NULL,
      "symbol" varchar,
      "is_base_currency" boolean DEFAULT false,
      "is_active" boolean DEFAULT true,
      "notes" varchar,
      "created_by_id" integer,
      "updated_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "acct_payment_terms" (
      "id" serial PRIMARY KEY NOT NULL,
      "code" varchar NOT NULL UNIQUE,
      "name" varchar NOT NULL,
      "due_in_days" numeric DEFAULT 0,
      "description" varchar,
      "is_active" boolean DEFAULT true,
      "created_by_id" integer,
      "updated_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "accounting_vendors"
      ADD COLUMN IF NOT EXISTS "currency_reference_id" integer,
      ADD COLUMN IF NOT EXISTS "payment_term_reference_id" integer;

    CREATE INDEX IF NOT EXISTS "accounting_vendors_currency_reference_idx" ON "accounting_vendors" USING btree ("currency_reference_id");
    CREATE INDEX IF NOT EXISTS "accounting_vendors_payment_term_reference_idx" ON "accounting_vendors" USING btree ("payment_term_reference_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounting_vendors_currency_reference_id_acct_currencies_id_fk'
      ) THEN
        ALTER TABLE "accounting_vendors"
          ADD CONSTRAINT "accounting_vendors_currency_reference_id_acct_currencies_id_fk"
          FOREIGN KEY ("currency_reference_id") REFERENCES "public"."acct_currencies"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounting_vendors_payment_term_reference_id_acct_payment_terms_id_fk'
      ) THEN
        ALTER TABLE "accounting_vendors"
          ADD CONSTRAINT "accounting_vendors_payment_term_reference_id_acct_payment_terms_id_fk"
          FOREIGN KEY ("payment_term_reference_id") REFERENCES "public"."acct_payment_terms"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    INSERT INTO "acct_currencies" ("code", "name", "symbol", "is_base_currency", "is_active")
    VALUES
      ('PHP', 'Philippine Peso', 'PHP', true, true),
      ('USD', 'US Dollar', 'USD', false, true),
      ('EUR', 'Euro', 'EUR', false, true),
      ('GBP', 'British Pound', 'GBP', false, true)
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "acct_currencies" ("code", "name", "symbol", "is_base_currency", "is_active")
    SELECT DISTINCT
      UPPER(TRIM("currency")) AS "code",
      UPPER(TRIM("currency")) AS "name",
      UPPER(TRIM("currency")) AS "symbol",
      false,
      true
    FROM "accounting_vendors"
    WHERE COALESCE(TRIM("currency"), '') <> ''
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "acct_payment_terms" ("code", "name", "due_in_days", "description", "is_active")
    VALUES
      ('CASH', 'Cash', 0, 'Immediate payment due.', true),
      ('NET7', '7 days', 7, 'Payment due in 7 days.', true),
      ('NET15', '15 days', 15, 'Payment due in 15 days.', true),
      ('NET30', '30 days', 30, 'Payment due in 30 days.', true),
      ('NET45', '45 days', 45, 'Payment due in 45 days.', true),
      ('NET60', '60 days', 60, 'Payment due in 60 days.', true)
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "acct_payment_terms" ("code", "name", "due_in_days", "description", "is_active")
    SELECT DISTINCT
      UPPER(REGEXP_REPLACE(TRIM("payment_terms"), '[^A-Za-z0-9]+', '_', 'g')) AS "code",
      TRIM("payment_terms") AS "name",
      0,
      'Backfilled from legacy accounting vendor payment terms before column removal.',
      true
    FROM "accounting_vendors"
    WHERE COALESCE(TRIM("payment_terms"), '') <> ''
    ON CONFLICT ("code") DO NOTHING;

    UPDATE "accounting_vendors" AS vendor
    SET "currency_reference_id" = currency_master."id"
    FROM "acct_currencies" AS currency_master
    WHERE vendor."currency_reference_id" IS NULL
      AND COALESCE(TRIM(vendor."currency"), '') <> ''
      AND currency_master."code" = UPPER(TRIM(vendor."currency"));

    UPDATE "accounting_vendors" AS vendor
    SET "payment_term_reference_id" = payment_term_master."id"
    FROM "acct_payment_terms" AS payment_term_master
    WHERE vendor."payment_term_reference_id" IS NULL
      AND COALESCE(TRIM(vendor."payment_terms"), '') <> ''
      AND payment_term_master."name" = TRIM(vendor."payment_terms");

    ALTER TABLE "accounting_vendors"
      DROP COLUMN IF EXISTS "currency",
      DROP COLUMN IF EXISTS "payment_terms";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "accounting_vendors"
      ADD COLUMN IF NOT EXISTS "currency" varchar DEFAULT 'PHP' NOT NULL,
      ADD COLUMN IF NOT EXISTS "payment_terms" varchar;

    UPDATE "accounting_vendors" AS vendor
    SET "currency" = COALESCE(currency_master."code", 'PHP')
    FROM "acct_currencies" AS currency_master
    WHERE vendor."currency_reference_id" = currency_master."id";

    UPDATE "accounting_vendors" AS vendor
    SET "payment_terms" = payment_term_master."name"
    FROM "acct_payment_terms" AS payment_term_master
    WHERE vendor."payment_term_reference_id" = payment_term_master."id";

    ALTER TABLE "accounting_vendors"
      DROP CONSTRAINT IF EXISTS "accounting_vendors_currency_reference_id_acct_currencies_id_fk";
    ALTER TABLE "accounting_vendors"
      DROP CONSTRAINT IF EXISTS "accounting_vendors_payment_term_reference_id_acct_payment_terms_id_fk";

    DROP INDEX IF EXISTS "accounting_vendors_currency_reference_idx";
    DROP INDEX IF EXISTS "accounting_vendors_payment_term_reference_idx";

    ALTER TABLE "accounting_vendors"
      DROP COLUMN IF EXISTS "currency_reference_id",
      DROP COLUMN IF EXISTS "payment_term_reference_id";
  `)
}
