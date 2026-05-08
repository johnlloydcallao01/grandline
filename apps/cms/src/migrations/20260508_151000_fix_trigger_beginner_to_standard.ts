import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION public.create_role_record()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                VALUES (NEW.id, 'content', NOW(), NOW());

            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at)
                VALUES (NEW.id, 'General', NOW(), NOW());

            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, srn, current_level, created_at, updated_at)
                VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'standard', NOW(), NOW());

            WHEN 'service' THEN
                -- Service accounts don't need role-specific records
                -- They are used for API key authentication only
                NULL;
        END CASE;

        RETURN NEW;
    END;
    $function$;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION public.create_role_record()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                VALUES (NEW.id, 'content', NOW(), NOW());

            WHEN 'instructor' THEN
                INSERT INTO instructors (user_id, specialization, created_at, updated_at)
                VALUES (NEW.id, 'General', NOW(), NOW());

            WHEN 'trainee' THEN
                INSERT INTO trainees (user_id, srn, current_level, created_at, updated_at)
                VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());

            WHEN 'service' THEN
                -- Service accounts don't need role-specific records
                -- They are used for API key authentication only
                NULL;
        END CASE;

        RETURN NEW;
    END;
    $function$;
  `)
}
