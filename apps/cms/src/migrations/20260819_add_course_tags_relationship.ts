import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- 1. Add the new column to the relationship join table
   ALTER TABLE "courses_rels" ADD COLUMN "course_tags_id" integer;
   ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_course_tags_fk" FOREIGN KEY ("course_tags_id") REFERENCES "public"."course_tags"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "courses_rels_course_tags_id_idx" ON "courses_rels" USING btree ("course_tags_id");
   `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_course_tags_fk";
   DROP INDEX "courses_rels_course_tags_id_idx";
   ALTER TABLE "courses_rels" DROP COLUMN "course_tags_id";
   `)
}