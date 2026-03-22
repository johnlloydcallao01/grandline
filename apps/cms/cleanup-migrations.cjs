const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URI });

async function run() {
  await client.connect();
  const res2 = await client.query("DELETE FROM payload_migrations WHERE batch = -1");
  console.log('Deleted dev migrations (batch = -1):', res2.rowCount);
  
  // Let's also check if there's any other indicator
  const all = await client.query('SELECT * FROM payload_migrations ORDER BY updated_at DESC LIMIT 5');
  console.log('Recent migrations:', all.rows);
  
  await client.end();
}

run().catch(console.error);
