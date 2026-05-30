import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "accounting_credit_notes_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"invoice_id" integer NOT NULL,
  	"amount_applied" numeric NOT NULL
  );
  
  CREATE TABLE "accounting_vendor_credits_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"bill_id" integer NOT NULL,
  	"amount_applied" numeric NOT NULL
  );
  
  ALTER TABLE "accounting_credit_notes_applications" ADD CONSTRAINT "accounting_credit_notes_applications_invoice_id_accounting_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."accounting_invoices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_credit_notes_applications" ADD CONSTRAINT "accounting_credit_notes_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accounting_credit_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits_applications" ADD CONSTRAINT "accounting_vendor_credits_applications_bill_id_accounting_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."accounting_bills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounting_vendor_credits_applications" ADD CONSTRAINT "accounting_vendor_credits_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accounting_vendor_credits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "accounting_credit_notes_applications_order_idx" ON "accounting_credit_notes_applications" USING btree ("_order");
  CREATE INDEX "accounting_credit_notes_applications_parent_id_idx" ON "accounting_credit_notes_applications" USING btree ("_parent_id");
  CREATE INDEX "accounting_credit_notes_applications_invoice_idx" ON "accounting_credit_notes_applications" USING btree ("invoice_id");
  CREATE INDEX "accounting_vendor_credits_applications_order_idx" ON "accounting_vendor_credits_applications" USING btree ("_order");
  CREATE INDEX "accounting_vendor_credits_applications_parent_id_idx" ON "accounting_vendor_credits_applications" USING btree ("_parent_id");
  CREATE INDEX "accounting_vendor_credits_applications_bill_idx" ON "accounting_vendor_credits_applications" USING btree ("bill_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "accounting_credit_notes_applications" CASCADE;
  DROP TABLE "accounting_vendor_credits_applications" CASCADE;`)
}
