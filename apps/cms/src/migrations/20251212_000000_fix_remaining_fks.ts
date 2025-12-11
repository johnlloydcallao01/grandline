import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Fix remaining Foreign Key constraints that were causing transaction aborts during user deletion
  // These specific relationships (triggered_by, enrolled_by) should just be unlinked (SET NULL) rather than cascading the delete
  
  await db.execute(sql`
    -- User Events: When a user who triggered an event is deleted, keep the event but nullify the trigger
    ALTER TABLE "user_events" DROP CONSTRAINT IF EXISTS "user_events_triggered_by_id_users_id_fk";
    ALTER TABLE "user_events" ADD CONSTRAINT "user_events_triggered_by_id_users_id_fk" 
    FOREIGN KEY ("triggered_by_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    -- Course Enrollments: When the admin/instructor who enrolled a student is deleted, keep the enrollment
    ALTER TABLE "course_enrollments" DROP CONSTRAINT IF EXISTS "course_enrollments_enrolled_by_id_users_id_fk";
    ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_enrolled_by_id_users_id_fk" 
    FOREIGN KEY ("enrolled_by_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;
    
    -- Ensure Posts author is SET NULL (just in case it wasn't)
    ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_author_id_users_id_fk";
    ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" 
    FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert to default behavior (likely RESTRICT or NO ACTION depending on previous state)
  await db.execute(sql`
    ALTER TABLE "user_events" DROP CONSTRAINT IF EXISTS "user_events_triggered_by_id_users_id_fk";
    ALTER TABLE "user_events" ADD CONSTRAINT "user_events_triggered_by_id_users_id_fk" 
    FOREIGN KEY ("triggered_by_id") REFERENCES "public"."users"("id") 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

    ALTER TABLE "course_enrollments" DROP CONSTRAINT IF EXISTS "course_enrollments_enrolled_by_id_users_id_fk";
    ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_enrolled_by_id_users_id_fk" 
    FOREIGN KEY ("enrolled_by_id") REFERENCES "public"."users"("id") 
    ON DELETE NO ACTION ON UPDATE NO ACTION;

    ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_author_id_users_id_fk";
    ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" 
    FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") 
    ON DELETE NO ACTION ON UPDATE NO ACTION;
  `)
}
