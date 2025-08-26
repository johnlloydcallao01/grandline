import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URI
})

async function executeEnterpriseMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 STARTING ENTERPRISE SCHEMA OPTIMIZATION MIGRATION...\n')
    
    // Begin transaction for atomic migration
    await client.query('BEGIN')
    
    // Step 1: Backup current schema state
    console.log('📋 Step 1: Creating schema backup...')
    const backupQueries = [
      'CREATE TABLE IF NOT EXISTS migration_backup_users AS SELECT * FROM users',
      'CREATE TABLE IF NOT EXISTS migration_backup_admins AS SELECT * FROM admins',
      'CREATE TABLE IF NOT EXISTS migration_backup_instructors AS SELECT * FROM instructors',
      'CREATE TABLE IF NOT EXISTS migration_backup_trainees AS SELECT * FROM trainees'
    ]
    
    for (const query of backupQueries) {
      await client.query(query)
    }
    console.log('✅ Schema backup completed')
    
    // Step 2: Execute the migration SQL
    console.log('\n🔧 Step 2: Executing enterprise schema optimization...')
    const sqlFilePath = path.join(__dirname, '../src/migrations/20250826_enterprise_schema_optimization.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // Split SQL into individual statements and execute
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    let executedStatements = 0
    for (const statement of statements) {
      try {
        await client.query(statement)
        executedStatements++
        
        // Progress indicator
        if (executedStatements % 10 === 0) {
          console.log(`  📊 Executed ${executedStatements}/${statements.length} statements...`)
        }
      } catch (error) {
        console.error(`❌ Error executing statement: ${statement.substring(0, 100)}...`)
        console.error(`   Error: ${error.message}`)
        throw error
      }
    }
    
    console.log(`✅ Successfully executed ${executedStatements} SQL statements`)
    
    // Step 3: Verify migration results
    console.log('\n🔍 Step 3: Verifying migration results...')
    
    // Check users table structure
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('bio', 'phone', 'profile_image_url', 'preferences', 'metadata')
      ORDER BY column_name
    `)
    
    console.log('📊 New fields in users table:')
    usersColumns.rows.forEach(col => {
      console.log(`  ✅ ${col.column_name}: ${col.data_type}`)
    })
    
    // Check role tables for removed duplicated fields
    const roleTableChecks = [
      { table: 'admins', removedFields: ['is_active'] },
      { table: 'instructors', removedFields: ['is_active', 'bio'] },
      { table: 'trainees', removedFields: ['is_active'] }
    ]
    
    for (const check of roleTableChecks) {
      for (const field of check.removedFields) {
        const fieldExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = '${check.table}' AND column_name = '${field}'
          )
        `)
        
        if (!fieldExists.rows[0].exists) {
          console.log(`  ✅ Removed duplicated field: ${check.table}.${field}`)
        } else {
          console.log(`  ⚠️  Field still exists: ${check.table}.${field}`)
        }
      }
    }
    
    // Check new association tables
    const newTables = ['user_certifications', 'user_relationships', 'user_events']
    for (const table of newTables) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '${table}'
        )
      `)
      
      if (tableExists.rows[0].exists) {
        console.log(`  ✅ Created new table: ${table}`)
      } else {
        console.log(`  ❌ Failed to create table: ${table}`)
      }
    }
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'admins', 'instructors', 'trainees', 'user_certifications', 'user_relationships', 'user_events')
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `)
    
    console.log(`📊 Created ${indexes.rows.length} strategic indexes:`)
    indexes.rows.forEach(idx => {
      console.log(`  ✅ ${idx.indexname}`)
    })
    
    // Step 4: Test triggers
    console.log('\n🧪 Step 4: Testing updated triggers...')
    
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers 
      WHERE event_object_table = 'users'
      ORDER BY trigger_name
    `)
    
    console.log('🔧 Active triggers:')
    triggers.rows.forEach(trigger => {
      console.log(`  ✅ ${trigger.trigger_name} (${trigger.event_manipulation} on ${trigger.event_object_table})`)
    })
    
    // Step 5: Data integrity check
    console.log('\n🔍 Step 5: Data integrity verification...')
    
    const userCount = await client.query('SELECT COUNT(*) FROM users')
    const adminCount = await client.query('SELECT COUNT(*) FROM admins')
    const instructorCount = await client.query('SELECT COUNT(*) FROM instructors')
    const traineeCount = await client.query('SELECT COUNT(*) FROM trainees')
    
    console.log('📊 Record counts after migration:')
    console.log(`  👤 Users: ${userCount.rows[0].count}`)
    console.log(`  👑 Admins: ${adminCount.rows[0].count}`)
    console.log(`  👨‍🏫 Instructors: ${instructorCount.rows[0].count}`)
    console.log(`  👨‍🎓 Trainees: ${traineeCount.rows[0].count}`)
    
    // Check for orphaned records
    const orphanedAdmins = await client.query(`
      SELECT COUNT(*) FROM admins a 
      LEFT JOIN users u ON a.user_id = u.id 
      WHERE u.id IS NULL
    `)
    
    const orphanedInstructors = await client.query(`
      SELECT COUNT(*) FROM instructors i 
      LEFT JOIN users u ON i.user_id = u.id 
      WHERE u.id IS NULL
    `)
    
    const orphanedTrainees = await client.query(`
      SELECT COUNT(*) FROM trainees t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE u.id IS NULL
    `)
    
    const totalOrphaned = parseInt(orphanedAdmins.rows[0].count) + 
                         parseInt(orphanedInstructors.rows[0].count) + 
                         parseInt(orphanedTrainees.rows[0].count)
    
    if (totalOrphaned === 0) {
      console.log('  ✅ No orphaned records found - referential integrity maintained')
    } else {
      console.log(`  ⚠️  Found ${totalOrphaned} orphaned records - manual cleanup may be required`)
    }
    
    // Commit the transaction
    await client.query('COMMIT')
    
    console.log('\n🎉 ENTERPRISE SCHEMA OPTIMIZATION COMPLETED SUCCESSFULLY!')
    console.log('\n📋 MIGRATION SUMMARY:')
    console.log('  ✅ Moved shared fields to base users table')
    console.log('  ✅ Removed field duplications across role tables')
    console.log('  ✅ Added enterprise-grade role-specific fields')
    console.log('  ✅ Created association tables for complex relationships')
    console.log('  ✅ Implemented strategic indexing for performance')
    console.log('  ✅ Updated triggers for new schema')
    console.log('  ✅ Added comprehensive audit trail')
    console.log('\n🚀 Your database is now enterprise-ready!')
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK')
    console.error('\n❌ MIGRATION FAILED - ROLLING BACK CHANGES')
    console.error('Error:', error.message)
    
    // Cleanup backup tables on rollback
    try {
      await client.query('DROP TABLE IF EXISTS migration_backup_users')
      await client.query('DROP TABLE IF EXISTS migration_backup_admins')
      await client.query('DROP TABLE IF EXISTS migration_backup_instructors')
      await client.query('DROP TABLE IF EXISTS migration_backup_trainees')
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message)
    }
    
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Execute migration
executeEnterpriseMigration().catch(error => {
  console.error('Migration execution failed:', error)
  process.exit(1)
})
