import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function fixNullUsernames() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Finding users with NULL usernames...');
    
    // Find users with NULL usernames
    const nullUsersQuery = `
      SELECT id, email
      FROM users 
      WHERE username IS NULL
      ORDER BY id;
    `;
    
    const nullUsersResult = await pool.query(nullUsersQuery);
    
    if (nullUsersResult.rows.length === 0) {
      console.log('✅ No users with NULL usernames found!');
      return;
    }
    
    console.log(`❌ Found ${nullUsersResult.rows.length} users with NULL usernames:`);
    nullUsersResult.rows.forEach(user => {
      console.log(`  - ID ${user.id}: ${user.email}`);
    });
    
    console.log('\n🔧 Generating unique usernames...');
    
    // Generate unique usernames for NULL users
    for (const user of nullUsersResult.rows) {
      // Create username from email (before @) + user ID to ensure uniqueness
      const emailPrefix = user.email.split('@')[0].toLowerCase();
      const newUsername = `${emailPrefix}_${user.id}`;
      
      console.log(`  📝 Updating user ID ${user.id}: NULL → "${newUsername}"`);
      
      await pool.query(
        'UPDATE users SET username = $1 WHERE id = $2',
        [newUsername, user.id]
      );
    }
    
    console.log('\n✅ All NULL usernames fixed!');
    
    // Verify no NULL usernames remain
    const verifyResult = await pool.query(nullUsersQuery);
    if (verifyResult.rows.length === 0) {
      console.log('✅ Verification passed: No NULL usernames remaining');
    } else {
      console.log('❌ Warning: Some NULL usernames still exist:', verifyResult.rows);
    }
    
    // Show final state
    console.log('\n📋 Final username state:');
    const finalResult = await pool.query('SELECT id, email, username FROM users ORDER BY id');
    finalResult.rows.forEach(user => {
      console.log(`  - ID ${user.id}: ${user.email} → "${user.username}"`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing NULL usernames:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixNullUsernames().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
