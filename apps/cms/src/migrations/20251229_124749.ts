import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"post_categories_id" integer
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"post_categories_id" integer
  );
  
  CREATE TABLE "post_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"icon_id" integer,
  	"color_code" varchar,
  	"display_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "post_categories_id" integer;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_post_categories_id_idx" ON "posts_rels" USING btree ("post_categories_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_post_categories_id_idx" ON "_posts_v_rels" USING btree ("post_categories_id");
  CREATE UNIQUE INDEX "post_categories_slug_idx" ON "post_categories" USING btree ("slug");
  CREATE INDEX "post_categories_icon_idx" ON "post_categories" USING btree ("icon_id");
  CREATE INDEX "post_categories_updated_at_idx" ON "post_categories" USING btree ("updated_at");
  CREATE INDEX "post_categories_created_at_idx" ON "post_categories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_post_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("post_categories_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "post_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "post_categories" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_post_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_post_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "post_categories_id";`)
}
