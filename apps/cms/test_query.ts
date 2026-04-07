import 'dotenv/config'
import pg from 'pg'
const { Client } = pg

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()
  
  // Check latest media rows to see if cloudinary fields are being populated
  const rows = await client.query(`
    SELECT id, filename, cloudinary_public_id, cloudinary_u_r_l, url
    FROM media 
    ORDER BY created_at DESC 
    LIMIT 5
  `)
  console.log('Latest media rows:')
  rows.rows.forEach(r => console.log(JSON.stringify(r, null, 2)))
  
  await client.end()
}
check().catch(console.error)
