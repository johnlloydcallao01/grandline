import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- 1. Add the new column to the relationship table
   ALTER TABLE "courses_rels" ADD COLUMN "course_categories_id" integer;
   ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "courses_rels_course_categories_id_idx" ON "courses_rels" USING btree ("course_categories_id");

   -- 2. Migrate existing data
   INSERT INTO "courses_rels" ("parent_id", "path", "course_categories_id", "order")
   SELECT "id", 'category', "category_id", 1
   FROM "courses"
   WHERE "category_id" IS NOT NULL;

   -- 3. Drop the old column and constraints
   ALTER TABLE "courses" DROP CONSTRAINT "courses_category_id_course_categories_id_fk";
   DROP INDEX "courses_category_idx";
   ALTER TABLE "courses" DROP COLUMN "category_id";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- 1. Add the old column back
   ALTER TABLE "courses" ADD COLUMN "category_id" integer;
   ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category_id");

   -- 2. Restore data (taking the first category if multiple)
   UPDATE "courses" c
   SET "category_id" = (
       SELECT "course_categories_id"
       FROM "courses_rels" r
       WHERE r."parent_id" = c."id" AND r."path" = 'category'
       ORDER BY r."order" ASC, r."id" ASC
       LIMIT 1
   );

   -- 3. Remove column from relationship table
   ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_course_categories_fk";
   DROP INDEX "courses_rels_course_categories_id_idx";
   ALTER TABLE "courses_rels" DROP COLUMN "course_categories_id";`)
}
