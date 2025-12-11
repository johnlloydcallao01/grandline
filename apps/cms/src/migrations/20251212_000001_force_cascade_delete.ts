import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // We need to change ON DELETE SET NULL to ON DELETE CASCADE for strict relationships
  // where the child record cannot exist without the parent user.
  // The previous state was 'SET NULL', which fails for NOT NULL columns.

  await db.execute(sql`
    -- 1. Admins
    ALTER TABLE "admins" DROP CONSTRAINT IF EXISTS "admins_user_id_users_id_fk";
    ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- 2. Trainees
    ALTER TABLE "trainees" DROP CONSTRAINT IF EXISTS "trainees_user_id_users_id_fk";
    ALTER TABLE "trainees" ADD CONSTRAINT "trainees_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- 3. Instructors
    ALTER TABLE "instructors" DROP CONSTRAINT IF EXISTS "instructors_user_id_users_id_fk";
    ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- 4. User Certifications
    ALTER TABLE "user_certifications" DROP CONSTRAINT IF EXISTS "user_certifications_user_id_users_id_fk";
    ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- 5. Emergency Contacts
    ALTER TABLE "emergency_contacts" DROP CONSTRAINT IF EXISTS "emergency_contacts_user_id_users_id_fk";
    ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- 6. Recent Searches
    ALTER TABLE "recent_searches" DROP CONSTRAINT IF EXISTS "recent_searches_user_id_users_id_fk";
    ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- 7. User Events (Owner)
    ALTER TABLE "user_events" DROP CONSTRAINT IF EXISTS "user_events_user_id_users_id_fk";
    ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert back to SET NULL (the problematic state, but strictly correct for a down migration)
  await db.execute(sql`
    ALTER TABLE "admins" DROP CONSTRAINT IF EXISTS "admins_user_id_users_id_fk";
    ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    ALTER TABLE "trainees" DROP CONSTRAINT IF EXISTS "trainees_user_id_users_id_fk";
    ALTER TABLE "trainees" ADD CONSTRAINT "trainees_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    ALTER TABLE "instructors" DROP CONSTRAINT IF EXISTS "instructors_user_id_users_id_fk";
    ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    ALTER TABLE "user_certifications" DROP CONSTRAINT IF EXISTS "user_certifications_user_id_users_id_fk";
    ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    ALTER TABLE "emergency_contacts" DROP CONSTRAINT IF EXISTS "emergency_contacts_user_id_users_id_fk";
    ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    ALTER TABLE "recent_searches" DROP CONSTRAINT IF EXISTS "recent_searches_user_id_users_id_fk";
    ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;

    ALTER TABLE "user_events" DROP CONSTRAINT IF EXISTS "user_events_user_id_users_id_fk";
    ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE SET NULL ON UPDATE NO ACTION;
  `)
}
