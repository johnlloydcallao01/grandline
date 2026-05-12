import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM emergency_contacts ec
    USING emergency_contacts newer
    WHERE ec.user_id = newer.user_id
      AND ec.id < newer.id;
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS emergency_contacts_user_id_unique_idx
    ON emergency_contacts(user_id);
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS emergency_contacts_user_id_unique_idx;
  `)
}
