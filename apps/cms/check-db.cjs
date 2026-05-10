const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.yotcxtzfkevumoziwugx:%40Iamachessgrandmaster23@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
});
client.connect()
  .then(() => client.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 3'))
  .then(res => { 
    console.log("DB rows:", res.rows.map(r => ({
      id: r.id,
      first_name: r.first_name,
      last_name: r.last_name,
      gender: r.gender,
      civil_status: r.civil_status,
      nationality: r.nationality
    }))); 
    client.end(); 
  })
  .catch(e => console.error(e));