
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URI,
})

async function killLocks() {
  try {
    // First, list the locks again to be sure
    const locksRes = await pool.query(`
      SELECT l.pid
      FROM pg_locks l
      JOIN pg_class c ON l.relation = c.oid
      JOIN pg_stat_activity a ON l.pid = a.pid
      WHERE c.relname = 'submission_answers'
      AND a.state = 'idle in transaction'
    `)
    
    const pids = locksRes.rows.map(r => r.pid)
    console.log(`Found ${pids.length} idle transactions holding locks on submission_answers.`)

    if (pids.length > 0) {
      console.log('Terminating them...')
      for (const pid of pids) {
        try {
          await pool.query('SELECT pg_terminate_backend($1)', [pid])
          console.log(`Terminated PID ${pid}`)
        } catch (e) {
          console.error(`Failed to terminate PID ${pid}:`, e)
        }
      }
    } else {
      console.log('No blocking locks found.')
    }

  } catch (err) {
    console.error(err)
  } finally {
    await pool.end()
  }
}

killLocks()
