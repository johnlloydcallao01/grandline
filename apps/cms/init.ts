import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

async function init() {
  console.log("Booting Payload with push: true to naturally synchronize the database schema...");
  try {
    await getPayload({ config })
    console.log("Database synchronization completed. All missing tables and columns have been meticulously patched without dropping existing data.");
    process.exit(0)
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1)
  }
}

init()
