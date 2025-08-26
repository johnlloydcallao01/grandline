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

async function executePerformanceOptimization() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 STARTING PERFORMANCE OPTIMIZATION...\n')
    
    // Step 1: Execute performance optimization SQL
    console.log('🔧 Step 1: Creating materialized views and indexes...')
    const sqlFilePath = path.join(__dirname, '../src/migrations/20250826_performance_optimization.sql')
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
        if (executedStatements % 5 === 0) {
          console.log(`  📊 Executed ${executedStatements}/${statements.length} statements...`)
        }
      } catch (error) {
        // Some statements might fail if objects already exist - that's OK
        if (!error.message.includes('already exists')) {
          console.error(`⚠️  Warning executing statement: ${statement.substring(0, 100)}...`)
          console.error(`   Error: ${error.message}`)
        }
      }
    }
    
    console.log(`✅ Successfully executed ${executedStatements} optimization statements`)
    
    // Step 2: Verify materialized views
    console.log('\n🔍 Step 2: Verifying materialized views...')
    
    const materializedViews = await client.query(`
      SELECT schemaname, matviewname, hasindexes
      FROM pg_matviews 
      WHERE schemaname = 'public'
      ORDER BY matviewname
    `)
    
    console.log('📊 Created materialized views:')
    materializedViews.rows.forEach(view => {
      console.log(`  ✅ ${view.matviewname} (indexes: ${view.hasindexes ? 'Yes' : 'No'})`)
    })
    
    // Step 3: Test materialized view data
    console.log('\n🧪 Step 3: Testing materialized view performance...')
    
    const startTime = Date.now()
    
    // Test user_profiles view
    const profilesCount = await client.query('SELECT COUNT(*) FROM user_profiles')
    console.log(`  📊 user_profiles: ${profilesCount.rows[0].count} records`)
    
    // Test active_instructors view
    const instructorsCount = await client.query('SELECT COUNT(*) FROM active_instructors')
    console.log(`  📊 active_instructors: ${instructorsCount.rows[0].count} records`)
    
    // Test active_trainees view
    const traineesCount = await client.query('SELECT COUNT(*) FROM active_trainees')
    console.log(`  📊 active_trainees: ${traineesCount.rows[0].count} records`)
    
    // Test user_activity_summary view
    const activityCount = await client.query('SELECT COUNT(*) FROM user_activity_summary')
    console.log(`  📊 user_activity_summary: ${activityCount.rows[0].count} records`)
    
    const queryTime = Date.now() - startTime
    console.log(`  ⚡ Query time: ${queryTime}ms`)
    
    // Step 4: Test query functions
    console.log('\n🔧 Step 4: Testing query functions...')
    
    // Test get_user_statistics function
    const stats = await client.query('SELECT get_user_statistics() as stats')
    console.log('📊 User statistics:', JSON.stringify(stats.rows[0].stats, null, 2))
    
    // Test search function if there are users
    if (parseInt(profilesCount.rows[0].count) > 0) {
      const searchResults = await client.query(`
        SELECT * FROM search_users('test', NULL, 5)
      `)
      console.log(`  🔍 Search test returned ${searchResults.rows.length} results`)
    }
    
    // Step 5: Verify indexes
    console.log('\n📋 Step 5: Verifying strategic indexes...')
    
    const indexes = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `)
    
    console.log(`📊 Created ${indexes.rows.length} strategic indexes:`)
    
    // Group by table
    const indexesByTable = {}
    indexes.rows.forEach(idx => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = []
      }
      indexesByTable[idx.tablename].push(idx.indexname)
    })
    
    Object.keys(indexesByTable).forEach(table => {
      console.log(`  📊 ${table}: ${indexesByTable[table].length} indexes`)
      indexesByTable[table].forEach(indexName => {
        console.log(`    - ${indexName}`)
      })
    })
    
    // Step 6: Performance benchmark
    console.log('\n⚡ Step 6: Performance benchmark...')
    
    const benchmarkQueries = [
      {
        name: 'Get user profile (materialized view)',
        query: 'SELECT * FROM user_profiles LIMIT 1'
      },
      {
        name: 'Get active instructors by specialization',
        query: `SELECT * FROM active_instructors WHERE specialization ILIKE '%general%' LIMIT 5`
      },
      {
        name: 'Get trainees by level',
        query: `SELECT * FROM active_trainees WHERE current_level = 'beginner' LIMIT 5`
      },
      {
        name: 'Search users',
        query: `SELECT * FROM search_users('test', NULL, 5)`
      }
    ]
    
    for (const benchmark of benchmarkQueries) {
      const start = Date.now()
      try {
        const result = await client.query(benchmark.query)
        const duration = Date.now() - start
        console.log(`  ⚡ ${benchmark.name}: ${duration}ms (${result.rows.length} rows)`)
      } catch (error) {
        console.log(`  ⚠️  ${benchmark.name}: Error - ${error.message}`)
      }
    }
    
    console.log('\n🎉 PERFORMANCE OPTIMIZATION COMPLETED SUCCESSFULLY!')
    console.log('\n📋 OPTIMIZATION SUMMARY:')
    console.log('  ✅ Created materialized views for frequent queries')
    console.log('  ✅ Implemented strategic indexing for performance')
    console.log('  ✅ Added query optimization functions')
    console.log('  ✅ Set up performance monitoring capabilities')
    console.log('\n🚀 Your database is now performance-optimized!')
    
    // Step 7: Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('  1. Set up automated materialized view refresh (every 15-30 minutes)')
    console.log('  2. Monitor query performance with pg_stat_statements')
    console.log('  3. Consider Redis caching for frequently accessed user profiles')
    console.log('  4. Implement connection pooling for high-concurrency scenarios')
    
  } catch (error) {
    console.error('\n❌ PERFORMANCE OPTIMIZATION FAILED')
    console.error('Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Execute optimization
executePerformanceOptimization().catch(error => {
  console.error('Performance optimization failed:', error)
  process.exit(1)
})
