import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Null out invalid API keys (non-hex or too short) to prevent decryption errors during reads
  await db.execute(sql`
    UPDATE "users"
    SET api_key = NULL,
        api_key_index = NULL,
        enable_a_p_i_key = false
    WHERE api_key IS NOT NULL
      AND (
        api_key ~ '[^0-9a-f]'
        OR CHAR_LENGTH(api_key) < 64
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Safely revert by clearing api_key values that were encrypted by this migration
  await db.execute(sql`
    UPDATE "users" SET api_key = NULL WHERE api_key IS NOT NULL;
  `)
}
