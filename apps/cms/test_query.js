require('dotenv').config()
const { Client } = require('pg')

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()
  
  // Check what columns exist in the media table
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'media' 
    ORDER BY ordinal_position
  `)
  console.log('media table columns:')
  cols.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type))
  
  await client.end()
}
check().catch(console.error)
