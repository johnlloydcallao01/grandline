import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_modules" ALTER COLUMN "order" DROP NOT NULL;
  ALTER TABLE "courses_rels" ADD COLUMN "course_modules_id" integer;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_course_modules_fk" FOREIGN KEY ("course_modules_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_rels_course_modules_id_idx" ON "courses_rels" USING btree ("course_modules_id");`)

  // Migrate data using raw SQL for performance and to avoid timeouts
  // We assume 'course_id' exists on 'course_modules' and maps to the parent course
  // We insert into 'courses_rels' to populate the new 'modules' relationship
  await db.execute(sql`
    INSERT INTO "courses_rels" ("parent_id", "path", "course_modules_id", "order")
    SELECT
      cm."course_id",
      'modules',
      cm."id",
      row_number() OVER (PARTITION BY cm."course_id" ORDER BY cm."order" ASC)
    FROM "course_modules" cm
    WHERE cm."course_id" IS NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_course_modules_fk";
  
  DROP INDEX "courses_rels_course_modules_id_idx";
  ALTER TABLE "course_modules" ALTER COLUMN "order" SET NOT NULL;
  ALTER TABLE "courses_rels" DROP COLUMN "course_modules_id";`)
}
