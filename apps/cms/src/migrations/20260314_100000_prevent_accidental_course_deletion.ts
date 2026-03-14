import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Prevent accidental course deletion when an instructor is deleted
  // Change ON DELETE CASCADE to ON DELETE RESTRICT
  await db.execute(sql`
    ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_instructor_id_instructors_id_fk";
    ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" 
    FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") 
    ON DELETE RESTRICT ON UPDATE NO ACTION;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert to the previous behavior (CASCADE)
  // WARNING: This allows deleting instructors to delete their courses
  await db.execute(sql`
    ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_instructor_id_instructors_id_fk";
    ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" 
    FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;
  `)
}
