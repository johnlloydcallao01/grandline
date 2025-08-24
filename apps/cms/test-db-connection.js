// Simple database connection test
import { Client } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    console.log('🔄 Testing database connection...')
    console.log('Connection string:', process.env.DATABASE_URI?.replace(/:[^:@]*@/, ':****@'))
    
    await client.connect()
    console.log('✅ Successfully connected to Supabase!')
    
    // Test a simple query
    const result = await client.query('SELECT version()')
    console.log('📊 PostgreSQL version:', result.rows[0].version)
    
    await client.end()
    console.log('🔌 Connection closed')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('🔍 Check your DATABASE_URI in .env file')
    process.exit(1)
  }
}

testConnection()
