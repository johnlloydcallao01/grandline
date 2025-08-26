import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URI
})

async function analyzeSchema() {
  try {
    console.log('🔍 ANALYZING CURRENT DATABASE SCHEMA...\n')
    
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('📋 EXISTING TABLES:')
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`))
    
    // Analyze users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)
    
    console.log('\n👤 USERS TABLE STRUCTURE:')
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
    })
    
    // Check for role tables
    const roleTables = ['admins', 'instructors', 'trainees']
    for (const table of roleTables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '${table}'
        )
      `)
      
      if (exists.rows[0].exists) {
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          ORDER BY ordinal_position
        `)
        
        console.log(`\n📊 ${table.toUpperCase()} TABLE STRUCTURE:`)
        columns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
        })
      } else {
        console.log(`\n❌ ${table.toUpperCase()} TABLE: NOT FOUND`)
      }
    }
    
    // Check triggers
    const triggers = await pool.query(`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers 
      WHERE event_object_table = 'users'
    `)
    
    console.log('\n🔧 DATABASE TRIGGERS:')
    if (triggers.rows.length > 0) {
      triggers.rows.forEach(row => {
        console.log(`  - ${row.trigger_name} (${row.event_manipulation} on ${row.event_object_table})`)
      })
    } else {
      console.log('  - No triggers found')
    }
    
    // Check for field duplication issues
    console.log('\n🚨 FIELD DUPLICATION ANALYSIS:')
    
    const duplicatedFields = []
    
    // Check isActive field
    const isActiveInUsers = usersColumns.rows.find(col => col.column_name === 'is_active')
    if (isActiveInUsers) {
      console.log('  ✅ is_active found in users table')
      
      // Check if it exists in role tables
      for (const table of roleTables) {
        const exists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = '${table}'
          )
        `)
        
        if (exists.rows[0].exists) {
          const hasIsActive = await pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = '${table}' AND column_name = 'is_active'
            )
          `)
          
          if (hasIsActive.rows[0].exists) {
            console.log(`  ❌ DUPLICATE: is_active also found in ${table} table`)
            duplicatedFields.push({ field: 'is_active', tables: ['users', table] })
          }
        }
      }
    }
    
    // Check bio field
    const bioInUsers = usersColumns.rows.find(col => col.column_name === 'bio')
    if (!bioInUsers) {
      console.log('  ❌ MISSING: bio field not found in users table')
      
      // Check if it exists in role tables
      for (const table of roleTables) {
        const exists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = '${table}'
          )
        `)
        
        if (exists.rows[0].exists) {
          const hasBio = await pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = '${table}' AND column_name = 'bio'
            )
          `)
          
          if (hasBio.rows[0].exists) {
            console.log(`  ⚠️  SUBOPTIMAL: bio found in ${table} table (should be in users)`)
          }
        }
      }
    } else {
      console.log('  ✅ bio found in users table')
    }
    
    // Summary
    console.log('\n📊 SCHEMA ANALYSIS SUMMARY:')
    if (duplicatedFields.length > 0) {
      console.log('  ❌ CRITICAL ISSUES FOUND:')
      duplicatedFields.forEach(dup => {
        console.log(`    - Field "${dup.field}" duplicated across: ${dup.tables.join(', ')}`)
      })
      console.log('  🚨 RECOMMENDATION: Immediate schema refactoring required')
    } else {
      console.log('  ✅ No critical field duplication detected')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

analyzeSchema()
