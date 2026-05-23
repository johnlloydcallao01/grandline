import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accounting_journal_entries" DROP CONSTRAINT "accounting_journal_entries_reversed_by_id_accounting_journal_entries_id_fk";
  
  DROP INDEX "accounting_journal_entries_reversed_by_idx";
  ALTER TABLE "accounting_journal_entries" ADD COLUMN "reversal_entry_id" integer;
  ALTER TABLE "accounting_journal_entries" ADD COLUMN "reversed_by_user_id" integer;
  ALTER TABLE "accounting_journal_entries" ADD COLUMN "reversed_at" timestamp(3) with time zone;
  UPDATE "accounting_journal_entries"
  SET
    "reversal_entry_id" = "reversed_by_id",
    "reversed_by_user_id" = CASE
      WHEN "reversed_by_id" IS NOT NULL AND "status" = 'reversed' THEN "updated_by_id"
      ELSE "reversed_by_user_id"
    END,
    "reversed_at" = CASE
      WHEN "reversed_by_id" IS NOT NULL AND "status" = 'reversed' THEN "updated_at"
      ELSE "reversed_at"
    END;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_reversal_entry_id_accounting_journal_entries_id_fk" FOREIGN KEY ("reversal_entry_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_reversed_by_user_id_users_id_fk" FOREIGN KEY ("reversed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "accounting_journal_entries_reversal_entry_idx" ON "accounting_journal_entries" USING btree ("reversal_entry_id");
  CREATE INDEX "accounting_journal_entries_reversed_by_user_idx" ON "accounting_journal_entries" USING btree ("reversed_by_user_id");
  ALTER TABLE "accounting_journal_entries" DROP COLUMN "reversed_by_id";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "accounting_journal_entries" DROP CONSTRAINT "accounting_journal_entries_reversal_entry_id_accounting_journal_entries_id_fk";
  
  ALTER TABLE "accounting_journal_entries" DROP CONSTRAINT "accounting_journal_entries_reversed_by_user_id_users_id_fk";
  
  DROP INDEX "accounting_journal_entries_reversal_entry_idx";
  DROP INDEX "accounting_journal_entries_reversed_by_user_idx";
  ALTER TABLE "accounting_journal_entries" ADD COLUMN "reversed_by_id" integer;
  UPDATE "accounting_journal_entries"
  SET "reversed_by_id" = "reversal_entry_id";
  ALTER TABLE "accounting_journal_entries" ADD CONSTRAINT "accounting_journal_entries_reversed_by_id_accounting_journal_entries_id_fk" FOREIGN KEY ("reversed_by_id") REFERENCES "public"."accounting_journal_entries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "accounting_journal_entries_reversed_by_idx" ON "accounting_journal_entries" USING btree ("reversed_by_id");
  ALTER TABLE "accounting_journal_entries" DROP COLUMN "reversal_entry_id";
  ALTER TABLE "accounting_journal_entries" DROP COLUMN "reversed_by_user_id";
  ALTER TABLE "accounting_journal_entries" DROP COLUMN "reversed_at";`)
}
