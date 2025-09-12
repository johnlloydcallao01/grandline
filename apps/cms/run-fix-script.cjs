const fs = require('fs');
const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URI);

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');
    
    const sql = fs.readFileSync('fix-api-key-issue.sql', 'utf8');
    const queries = sql.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        const result = await client.query(query);
        console.log('Executed:', query.trim().substring(0, 50) + '...', result.rowCount ? `(rowCount: ${result.rowCount})` : '');
      }
    }
    
    console.log('✅ SQL script executed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();