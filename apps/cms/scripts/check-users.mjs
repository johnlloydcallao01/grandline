import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function checkUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Checking users table...');
    
    // Check all users and their usernames
    const allUsersQuery = `
      SELECT id, email, username, created_at
      FROM users 
      ORDER BY id;
    `;
    
    const allUsersResult = await pool.query(allUsersQuery);
    
    console.log(`📊 Total users: ${allUsersResult.rows.length}`);
    console.log('\n👥 All users:');
    allUsersResult.rows.forEach(user => {
      console.log(`  - ID ${user.id}: ${user.email} | username: "${user.username || 'NULL'}"`);
    });
    
    // Check for duplicates including NULLs
    const duplicatesQuery = `
      SELECT username, COUNT(*) as count, array_agg(id) as user_ids
      FROM users 
      GROUP BY username 
      HAVING COUNT(*) > 1
      ORDER BY username;
    `;
    
    const duplicatesResult = await pool.query(duplicatesQuery);
    
    if (duplicatesResult.rows.length > 0) {
      console.log('\n❌ Found duplicates (including NULLs):');
      duplicatesResult.rows.forEach(row => {
        console.log(`  - "${row.username || 'NULL'}": ${row.count} users (IDs: ${row.user_ids.join(', ')})`);
      });
    }
    
    // Check existing indexes
    const indexQuery = `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname LIKE '%username%';
    `;
    
    const indexResult = await pool.query(indexQuery);
    
    console.log('\n🔍 Existing username indexes:');
    if (indexResult.rows.length === 0) {
      console.log('  - No username indexes found');
    } else {
      indexResult.rows.forEach(index => {
        console.log(`  - ${index.indexname}: ${index.indexdef}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkUsers().then(() => {
  console.log('🏁 Check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});
