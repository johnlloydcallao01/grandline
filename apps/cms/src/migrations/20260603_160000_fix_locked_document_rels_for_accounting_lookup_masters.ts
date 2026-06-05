import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "acct_currencies_id" integer,
      ADD COLUMN IF NOT EXISTS "acct_payment_terms_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_acct_currencies_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_acct_currencies_fk"
          FOREIGN KEY ("acct_currencies_id") REFERENCES "public"."acct_currencies"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_acct_payment_terms_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_acct_payment_terms_fk"
          FOREIGN KEY ("acct_payment_terms_id") REFERENCES "public"."acct_payment_terms"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_acct_currencies_id_idx"
      ON "payload_locked_documents_rels" USING btree ("acct_currencies_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_acct_payment_terms_id_idx"
      ON "payload_locked_documents_rels" USING btree ("acct_payment_terms_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_acct_currencies_fk";
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_acct_payment_terms_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_acct_currencies_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_acct_payment_terms_id_idx";

    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "acct_currencies_id",
      DROP COLUMN IF EXISTS "acct_payment_terms_id";
  `)
}
