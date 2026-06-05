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

    ALTER TABLE "accounting_bank_accounts"
      ADD COLUMN IF NOT EXISTS "currency_reference_id" integer;

    CREATE INDEX IF NOT EXISTS "accounting_bank_accounts_currency_reference_idx"
      ON "accounting_bank_accounts" USING btree ("currency_reference_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounting_bank_accounts_currency_reference_id_acct_currencies_id_fk'
      ) THEN
        ALTER TABLE "accounting_bank_accounts"
          ADD CONSTRAINT "accounting_bank_accounts_currency_reference_id_acct_currencies_id_fk"
          FOREIGN KEY ("currency_reference_id") REFERENCES "public"."acct_currencies"("id")
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
    FROM "accounting_bank_accounts"
    WHERE COALESCE(TRIM("currency"), '') <> ''
    ON CONFLICT ("code") DO NOTHING;

    UPDATE "accounting_bank_accounts" AS bank_account
    SET "currency_reference_id" = currency_master."id"
    FROM "acct_currencies" AS currency_master
    WHERE bank_account."currency_reference_id" IS NULL
      AND COALESCE(TRIM(bank_account."currency"), '') <> ''
      AND currency_master."code" = UPPER(TRIM(bank_account."currency"));

    UPDATE "accounting_bank_accounts" AS bank_account
    SET "currency_reference_id" = currency_master."id"
    FROM "acct_currencies" AS currency_master
    WHERE bank_account."currency_reference_id" IS NULL
      AND currency_master."code" = 'PHP';

    ALTER TABLE "accounting_bank_accounts"
      ALTER COLUMN "currency_reference_id" SET NOT NULL;

    ALTER TABLE "accounting_bank_accounts"
      DROP COLUMN IF EXISTS "currency";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "accounting_bank_accounts"
      ADD COLUMN IF NOT EXISTS "currency" varchar DEFAULT 'PHP' NOT NULL;

    UPDATE "accounting_bank_accounts" AS bank_account
    SET "currency" = COALESCE(currency_master."code", 'PHP')
    FROM "acct_currencies" AS currency_master
    WHERE bank_account."currency_reference_id" = currency_master."id";

    ALTER TABLE "accounting_bank_accounts"
      ALTER COLUMN "currency_reference_id" DROP NOT NULL;

    ALTER TABLE "accounting_bank_accounts"
      DROP CONSTRAINT IF EXISTS "accounting_bank_accounts_currency_reference_id_acct_currencies_id_fk";

    DROP INDEX IF EXISTS "accounting_bank_accounts_currency_reference_idx";

    ALTER TABLE "accounting_bank_accounts"
      DROP COLUMN IF EXISTS "currency_reference_id";
  `)
}
