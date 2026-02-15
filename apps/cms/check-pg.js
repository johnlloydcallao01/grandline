
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env') })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URI,
})

async function check() {
  try {
    const res = await pool.query(`
      SELECT 
        l.pid, 
        l.mode, 
        l.granted,
        a.query, 
        a.state,
        now() - a.query_start as duration
      FROM pg_locks l
      JOIN pg_stat_activity a ON l.pid = a.pid
      JOIN pg_class c ON l.relation = c.oid
      WHERE c.relname = 'submission_answers';
    `)
    console.log('Locks on submission_answers:', res.rows)
  } catch (err) {
    console.error(err)
  } finally {
    await pool.end()
  }
}

check()
