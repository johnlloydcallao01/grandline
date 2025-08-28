import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixDuplicateUsernames() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Checking for duplicate usernames...');
    
    // Find all duplicate usernames
    const duplicatesQuery = `
      SELECT username, COUNT(*) as count, array_agg(id) as user_ids
      FROM users 
      WHERE username IS NOT NULL 
      GROUP BY username 
      HAVING COUNT(*) > 1
      ORDER BY username;
    `;
    
    const duplicatesResult = await pool.query(duplicatesQuery);
    
    if (duplicatesResult.rows.length === 0) {
      console.log('✅ No duplicate usernames found!');
      return;
    }
    
    console.log(`❌ Found ${duplicatesResult.rows.length} duplicate username(s):`);
    duplicatesResult.rows.forEach(row => {
      console.log(`  - "${row.username}": ${row.count} users (IDs: ${row.user_ids.join(', ')})`);
    });
    
    console.log('\n🔧 Fixing duplicates by making usernames unique...');
    
    // Fix each duplicate by appending a number to make them unique
    for (const duplicate of duplicatesResult.rows) {
      const { username, user_ids } = duplicate;
      
      // Keep the first user with the original username, modify the others
      for (let i = 1; i < user_ids.length; i++) {
        const userId = user_ids[i];
        const newUsername = `${username}_${i}`;
        
        console.log(`  📝 Updating user ID ${userId}: "${username}" → "${newUsername}"`);
        
        await pool.query(
          'UPDATE users SET username = $1 WHERE id = $2',
          [newUsername, userId]
        );
      }
    }
    
    console.log('\n✅ All duplicate usernames fixed!');
    
    // Verify no duplicates remain
    const verifyResult = await pool.query(duplicatesQuery);
    if (verifyResult.rows.length === 0) {
      console.log('✅ Verification passed: No duplicates remaining');
    } else {
      console.log('❌ Warning: Some duplicates still exist:', verifyResult.rows);
    }
    
    console.log('\n📋 Current usernames:');
    const allUsernamesResult = await pool.query(
      'SELECT id, email, username FROM users WHERE username IS NOT NULL ORDER BY id'
    );
    allUsernamesResult.rows.forEach(user => {
      console.log(`  - ID ${user.id}: ${user.email} → "${user.username}"`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing duplicate usernames:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixDuplicateUsernames();
