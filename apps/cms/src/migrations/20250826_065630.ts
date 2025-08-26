import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import * as fs from 'fs'
import * as path from 'path'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    console.log('🚀 Creating database triggers for automatic role record creation...')

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '20250826_create_role_triggers.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

    // Execute the SQL
    await db.execute(sql.raw(sqlContent))

    console.log('✅ Database triggers created successfully!')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    console.log('🔄 Removing database triggers...')

    // Remove triggers and functions
    await db.execute(sql`
        DROP TRIGGER IF EXISTS user_role_trigger ON users;
        DROP TRIGGER IF EXISTS user_role_change_trigger ON users;
        DROP TRIGGER IF EXISTS user_cleanup_trigger ON users;
        DROP FUNCTION IF EXISTS create_role_record();
        DROP FUNCTION IF EXISTS handle_role_change();
        DROP FUNCTION IF EXISTS cleanup_role_record();
    `)

    console.log('✅ Database triggers removed successfully!')
}
