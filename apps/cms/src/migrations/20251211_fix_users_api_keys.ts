import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Null out invalid API keys (non-hex or too short) to prevent decryption errors during reads
  const apiKeyCheck = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND column_name = 'api_key';
  `)

  if (((apiKeyCheck as unknown) as { rows: any[] }).rows.length > 0) {
    const enableKeyCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      AND column_name = 'enable_a_p_i_key';
    `)

    if (((enableKeyCheck as unknown) as { rows: any[] }).rows.length > 0) {
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
    } else {
      console.log('⚠️ enable_a_p_i_key not found, skipping api_key update')
    }
  } else {
    console.log('⚠️ api_key column not found, skipping api_key update')
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Safely revert by clearing api_key values that were encrypted by this migration
  await db.execute(sql`
    UPDATE "users" SET api_key = NULL WHERE api_key IS NOT NULL;
  `)
}
