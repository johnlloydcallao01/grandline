import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "course_modules_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"course_lessons_id" integer,
  	"assessments_id" integer
  );
  
  ALTER TABLE "course_modules_rels" ADD CONSTRAINT "course_modules_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_modules_rels" ADD CONSTRAINT "course_modules_rels_course_lessons_fk" FOREIGN KEY ("course_lessons_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "course_modules_rels" ADD CONSTRAINT "course_modules_rels_assessments_fk" FOREIGN KEY ("assessments_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_modules_rels_order_idx" ON "course_modules_rels" USING btree ("order");
  CREATE INDEX "course_modules_rels_parent_idx" ON "course_modules_rels" USING btree ("parent_id");
  CREATE INDEX "course_modules_rels_path_idx" ON "course_modules_rels" USING btree ("path");
  CREATE INDEX "course_modules_rels_course_lessons_id_idx" ON "course_modules_rels" USING btree ("course_lessons_id");
  CREATE INDEX "course_modules_rels_assessments_id_idx" ON "course_modules_rels" USING btree ("assessments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "course_modules_rels" CASCADE;`)
}
