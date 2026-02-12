
import { getPayload } from 'payload'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Load env BEFORE importing payload config
dotenv.config({ path: path.resolve(dirname, '../.env') })

// Now import config
// @ts-ignore - Top-level await is handled by the runtime (tsx/node)
const { default: configPromise } = await import('../src/payload.config')

async function debug() {
  const payload = await getPayload({ config: configPromise })


  console.log('--- Debugging Support Ticket 1 ---')
  try {
    const ticket = await payload.findByID({
      collection: 'support-tickets',
      id: 1,
      showHiddenFields: true,
      depth: 1,
    })
    console.log('Ticket 1 found:')
    console.log('- ID:', ticket.id)
    console.log('- Subject:', ticket.subject)
    console.log('- Status:', ticket.status)
    // @ts-ignore
    console.log('- Owner (User):', ticket.user?.id || ticket.user, ticket.user?.email)
  } catch (e: any) {
    console.log('Ticket 1 NOT found or error:', e.message)
  }

  console.log('\n--- Checking Users ---')
  const users = await payload.find({
    collection: 'users',
    limit: 10,
    showHiddenFields: true,
  })

  users.docs.forEach(u => {
    console.log(`User ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, API Key Enabled: ${u.enableAPIKey}`)
  })
}

debug().catch(console.error).finally(() => process.exit(0))
