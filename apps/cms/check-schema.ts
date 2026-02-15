
import config from './src/payload.config'
import { getPayload } from 'payload'

async function checkSchema() {
  const payloadClient = await getPayload({ config })
  
  const result = await payloadClient.db.drizzle.execute(
    `SELECT column_name, column_default, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'submission_answers' AND column_name = 'points_earned'`
  ) as any
  
  console.log('Column info:', result.rows)
  process.exit(0)
}

checkSchema()
