import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "recent_searches" DROP CONSTRAINT IF EXISTS "recent_searches_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "recent_searches" ADD CONSTRAINT "recent_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "instructors" DROP CONSTRAINT IF EXISTS "instructors_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "trainees" DROP CONSTRAINT IF EXISTS "trainees_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "trainees" ADD CONSTRAINT "trainees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "admins" DROP CONSTRAINT IF EXISTS "admins_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "user_certifications" DROP CONSTRAINT IF EXISTS "user_certifications_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "user_events" DROP CONSTRAINT IF EXISTS "user_events_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "emergency_contacts" DROP CONSTRAINT IF EXISTS "emergency_contacts_user_id_users_id_fk";
    ALTER TABLE IF EXISTS "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "course_enrollments" DROP CONSTRAINT IF EXISTS "course_enrollments_student_id_trainees_id_fk";
    ALTER TABLE IF EXISTS "course_enrollments" ADD CONSTRAINT "course_enrollments_student_id_trainees_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."trainees"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE IF EXISTS "course_enrollments" DROP CONSTRAINT IF EXISTS "course_enrollments_course_id_courses_id_fk";
    ALTER TABLE IF EXISTS "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "recent_searches" DROP CONSTRAINT "recent_searches_user_id_users_id_fk";
    ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "instructors" DROP CONSTRAINT "instructors_user_id_users_id_fk";
    ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "trainees" DROP CONSTRAINT "trainees_user_id_users_id_fk";
    ALTER TABLE "trainees" ADD CONSTRAINT "trainees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "admins" DROP CONSTRAINT "admins_user_id_users_id_fk";
    ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "user_certifications" DROP CONSTRAINT "user_certifications_user_id_users_id_fk";
    ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "user_events" DROP CONSTRAINT "user_events_user_id_users_id_fk";
    ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "emergency_contacts" DROP CONSTRAINT "emergency_contacts_user_id_users_id_fk";
    ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "course_enrollments" DROP CONSTRAINT "course_enrollments_student_id_trainees_id_fk";
    ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_student_id_trainees_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."trainees"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "course_enrollments" DROP CONSTRAINT "course_enrollments_course_id_courses_id_fk";
    ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  `)
}

