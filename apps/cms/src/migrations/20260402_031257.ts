import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_recent_searches_fk";
  
  DROP INDEX "questions_texts_order_parent_idx";
  DROP INDEX "payload_locked_documents_rels_recent_searches_id_idx";
  ALTER TABLE "users" ADD COLUMN "biography" varchar;
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "questions_texts_order_parent" ON "questions_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "recent_searches_id";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_kv" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_kv" CASCADE;
  DROP INDEX "questions_texts_order_parent";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "recent_searches_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recent_searches_fk" FOREIGN KEY ("recent_searches_id") REFERENCES "public"."recent_searches"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "questions_texts_order_parent_idx" ON "questions_texts" USING btree ("order","parent_id");
  CREATE INDEX "payload_locked_documents_rels_recent_searches_id_idx" ON "payload_locked_documents_rels" USING btree ("recent_searches_id");
  ALTER TABLE "users" DROP COLUMN "biography";`)
}
