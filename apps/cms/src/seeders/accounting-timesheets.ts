import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedTimesheet = { periodStart: string; periodEnd: string; status: string; notes: string | null; userIdx: number }

const entries: SeedTimesheet[] = [
  { periodStart: '2026-01-01', periodEnd: '2026-01-15', status: 'approved', notes: 'January first-half payroll period.', userIdx: 0 },
  { periodStart: '2026-01-16', periodEnd: '2026-01-31', status: 'approved', notes: 'January second-half payroll period.', userIdx: 0 },
  { periodStart: '2026-02-01', periodEnd: '2026-02-15', status: 'submitted', notes: null, userIdx: 1 },
  { periodStart: '2026-02-16', periodEnd: '2026-02-28', status: 'approved', notes: 'Includes harbor expansion training hours.', userIdx: 1 },
  { periodStart: '2026-03-01', periodEnd: '2026-03-15', status: 'draft', notes: null, userIdx: 2 },
  { periodStart: '2026-03-16', periodEnd: '2026-03-31', status: 'submitted', notes: 'Pending review.', userIdx: 2 },
  { periodStart: '2026-04-01', periodEnd: '2026-04-15', status: 'approved', notes: 'Cadet billing period.', userIdx: 3 },
  { periodStart: '2026-04-16', periodEnd: '2026-04-30', status: 'draft', notes: null, userIdx: 3 },
  { periodStart: '2026-05-01', periodEnd: '2026-05-15', status: 'approved', notes: 'Safety certification delivery period.', userIdx: 4 },
  { periodStart: '2026-05-16', periodEnd: '2026-05-31', status: 'locked', notes: 'Final payroll cycle — locked after posting.', userIdx: 5 },
]

async function seed(): Promise<void> {
  console.log('[seed:timesheets] Connecting...')
  const payload = await getPayload({ config })
  const userResult = await payload.find({ collection: 'users', limit: 20, depth: 0, overrideAccess: true })
  const users = userResult.docs.filter((u: any) => u.role !== 'service' && u.isActive !== false)
  if (!users.length) { console.error('[seed:timesheets] No users.'); process.exit(1) }
  console.log(`[seed:timesheets] ${users.length} users`)

  let created = 0; let updated = 0
  for (const e of entries) {
    const user = users[e.userIdx % users.length]
    const existing = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, where: { and: [{ periodStart: { equals: e.periodStart } as any }, { user: { equals: user.id } as any }] }, limit: 1, depth: 0, overrideAccess: true })
    const data = { user: user.id, periodStart: e.periodStart, periodEnd: e.periodEnd, status: e.status, notes: e.notes } as never
    if (existing.docs.length > 0) { await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, id: existing.docs[0].id, overrideAccess: true, data }); updated++; console.log(`  UPDATED ${e.periodStart}`) }
    else { await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.timesheets, overrideAccess: true, data }); created++; console.log(`  CREATED ${e.periodStart}`) }
  }
  console.log(`[seed:timesheets] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}
seed().catch((e) => { console.error('[seed:timesheets] Fatal:', e); process.exit(1) })
