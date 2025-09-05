#!/usr/bin/env node

/**
 * VERIFY ALL TABLE CONNECTIONS
 * 
 * This script verifies that all user role tables are properly connected.
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URI
})

async function verifyConnections() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 VERIFYING ALL TABLE CONNECTIONS')
    console.log('=' .repeat(60))
    
    // Check all trainee users and their connections
    const traineeConnections = await client.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        t.id as trainee_id,
        t.srn,
        COUNT(ec.id) as emergency_contact_count,
        ec.first_name as emergency_first_name,
        ec.last_name as emergency_last_name,
        ec.relationship
      FROM users u
      LEFT JOIN trainees t ON u.id = t.user_id
      LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
      WHERE u.role = 'trainee'
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, t.id, t.srn, ec.first_name, ec.last_name, ec.relationship
      ORDER BY u.created_at DESC
    `)
    
    console.log('📋 TRAINEE USER CONNECTIONS:')
    traineeConnections.rows.forEach(row => {
      const traineeStatus = row.trainee_id ? '✅ HAS TRAINEE RECORD' : '❌ NO TRAINEE RECORD'
      const emergencyStatus = parseInt(row.emergency_contact_count) > 0 ? 
        `✅ HAS EMERGENCY CONTACT (${row.emergency_first_name} ${row.emergency_last_name} - ${row.relationship})` : 
        '❌ NO EMERGENCY CONTACT'
      
      console.log(`\n👤 ${row.email} (${row.first_name} ${row.last_name})`)
      console.log(`   ${traineeStatus} ${row.srn ? `(SRN: ${row.srn})` : ''}`)
      console.log(`   ${emergencyStatus}`)
    })
    
    // Summary statistics
    const stats = await client.query(`
      SELECT 
        COUNT(CASE WHEN u.role = 'trainee' THEN 1 END) as total_trainees,
        COUNT(CASE WHEN u.role = 'trainee' AND t.id IS NOT NULL THEN 1 END) as connected_trainees,
        COUNT(CASE WHEN u.role = 'trainee' AND ec.id IS NOT NULL THEN 1 END) as trainees_with_emergency_contacts
      FROM users u
      LEFT JOIN trainees t ON u.id = t.user_id
      LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
    `)
    
    const stat = stats.rows[0]
    console.log('\n📊 CONNECTION STATISTICS:')
    console.log(`   Total trainee users: ${stat.total_trainees}`)
    console.log(`   Connected to trainees table: ${stat.connected_trainees}/${stat.total_trainees}`)
    console.log(`   Have emergency contacts: ${stat.trainees_with_emergency_contacts}/${stat.total_trainees}`)
    
    const traineeConnectionRate = stat.total_trainees > 0 ? (stat.connected_trainees / stat.total_trainees * 100).toFixed(1) : '0'
    const emergencyConnectionRate = stat.total_trainees > 0 ? (stat.trainees_with_emergency_contacts / stat.total_trainees * 100).toFixed(1) : '0'
    
    console.log(`   Trainee connection rate: ${traineeConnectionRate}%`)
    console.log(`   Emergency contact rate: ${emergencyConnectionRate}%`)
    
    console.log('\n🎯 VERIFICATION COMPLETE!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

verifyConnections().catch(console.error)
