import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "course_feedbacks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"rating" numeric,
  	"comment" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_feedbacks_id" integer;
  ALTER TABLE "course_feedbacks" ADD CONSTRAINT "course_feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_feedbacks" ADD CONSTRAINT "course_feedbacks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "course_feedbacks_user_idx" ON "course_feedbacks" USING btree ("user_id");
  CREATE INDEX "course_feedbacks_course_idx" ON "course_feedbacks" USING btree ("course_id");
  CREATE INDEX "course_feedbacks_updated_at_idx" ON "course_feedbacks" USING btree ("updated_at");
  CREATE INDEX "course_feedbacks_created_at_idx" ON "course_feedbacks" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_feedbacks_fk" FOREIGN KEY ("course_feedbacks_id") REFERENCES "public"."course_feedbacks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_course_feedbacks_id_idx" ON "payload_locked_documents_rels" USING btree ("course_feedbacks_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "course_feedbacks" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "course_feedbacks" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_feedbacks_fk";
  
  DROP INDEX "payload_locked_documents_rels_course_feedbacks_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_feedbacks_id";`)
}
