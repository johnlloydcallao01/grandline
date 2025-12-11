import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Update cleanup function to handle 'service' role safely
    DROP TRIGGER IF EXISTS "user_cleanup_trigger" ON "users";
    DROP FUNCTION IF EXISTS cleanup_role_record();

    CREATE OR REPLACE FUNCTION cleanup_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        CASE OLD.role
            WHEN 'admin' THEN
                DELETE FROM admins WHERE user_id = OLD.id;
            WHEN 'instructor' THEN
                DELETE FROM instructors WHERE user_id = OLD.id;
            WHEN 'trainee' THEN
                DELETE FROM trainees WHERE user_id = OLD.id;
            WHEN 'service' THEN
                NULL;
            ELSE
                NULL;
        END CASE;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER user_cleanup_trigger
        BEFORE DELETE ON users
        FOR EACH ROW
        EXECUTE FUNCTION cleanup_role_record();
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TRIGGER IF EXISTS "user_cleanup_trigger" ON "users";
    DROP FUNCTION IF EXISTS cleanup_role_record();

    CREATE OR REPLACE FUNCTION cleanup_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        CASE OLD.role
            WHEN 'admin' THEN
                DELETE FROM admins WHERE user_id = OLD.id;
            WHEN 'instructor' THEN
                DELETE FROM instructors WHERE user_id = OLD.id;
            WHEN 'trainee' THEN
                DELETE FROM trainees WHERE user_id = OLD.id;
        END CASE;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER user_cleanup_trigger
        BEFORE DELETE ON users
        FOR EACH ROW
        EXECUTE FUNCTION cleanup_role_record();
  `)
}

