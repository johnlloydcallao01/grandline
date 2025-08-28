import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function checkUserRelationships() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    const userIds = [31, 32]; // The users that failed to delete
    
    console.log('🔍 Checking relationships for users:', userIds.join(', '));
    
    for (const userId of userIds) {
      console.log(`\n👤 User ID ${userId}:`);
      
      // Check user details
      const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log(`  📧 Email: ${user.email}`);
        console.log(`  🎭 Role: ${user.role}`);
      } else {
        console.log(`  ❌ User not found`);
        continue;
      }
      
      // Check instructors table
      const instructorResult = await pool.query('SELECT id FROM instructors WHERE user_id = $1', [userId]);
      if (instructorResult.rows.length > 0) {
        console.log(`  🎓 Instructor record: ${instructorResult.rows.length} found`);
      }
      
      // Check trainees table
      const traineeResult = await pool.query('SELECT id, srn FROM trainees WHERE user_id = $1', [userId]);
      if (traineeResult.rows.length > 0) {
        console.log(`  📚 Trainee record: ${traineeResult.rows.length} found (SRN: ${traineeResult.rows[0].srn})`);
      }
      
      // Check admins table
      const adminResult = await pool.query('SELECT id FROM admins WHERE user_id = $1', [userId]);
      if (adminResult.rows.length > 0) {
        console.log(`  👑 Admin record: ${adminResult.rows.length} found`);
      }
      
      // Check user_events table
      const eventsResult = await pool.query('SELECT COUNT(*) as count FROM user_events WHERE user_id = $1', [userId]);
      if (eventsResult.rows[0].count > 0) {
        console.log(`  📅 User events: ${eventsResult.rows[0].count} found`);
      }
      
      // Check emergency_contacts table
      const emergencyResult = await pool.query('SELECT COUNT(*) as count FROM emergency_contacts WHERE user_id = $1', [userId]);
      if (emergencyResult.rows[0].count > 0) {
        console.log(`  🚨 Emergency contacts: ${emergencyResult.rows[0].count} found`);
      }
      
      // Check user_certifications table
      const certResult = await pool.query('SELECT COUNT(*) as count FROM user_certifications WHERE user_id = $1', [userId]);
      if (certResult.rows[0].count > 0) {
        console.log(`  🏆 User certifications: ${certResult.rows[0].count} found`);
      }
    }
    
    console.log('\n🔧 Suggested Solutions:');
    console.log('1. Delete related records first, then delete users');
    console.log('2. Add CASCADE delete to foreign key constraints');
    console.log('3. Implement soft delete instead of hard delete');
    
  } catch (error) {
    console.error('❌ Error checking relationships:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkUserRelationships().then(() => {
  console.log('🏁 Check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});
