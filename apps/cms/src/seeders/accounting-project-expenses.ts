import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type Seed = { expenseNumber: string; expenseDate: string; postingDate: string; sub: number; status: string; category: string; notes: string | null; projectIdx: number; vendorIdx: number }

const entries: Seed[] = [
  { expenseNumber: 'EXP-2026-0511', expenseDate: '2026-05-10', postingDate: '2026-05-12', sub: 84000, status: 'posted', category: 'Uniforms & Safety Gear', notes: 'Harbor uniform supplies for batch 7 trainees.', projectIdx: 0, vendorIdx: 0 },
  { expenseNumber: 'EXP-2026-0524', expenseDate: '2026-05-16', postingDate: '2026-05-18', sub: 112500, status: 'posted', category: 'Venue & Facilities', notes: 'Ocean View venue rental for fleet upskilling session.', projectIdx: 3, vendorIdx: 1 },
  { expenseNumber: 'EXP-2026-0533', expenseDate: '2026-05-22', postingDate: '2026-05-24', sub: 168000, status: 'posted', category: 'Equipment Installation', notes: 'Marine simulator hardware installation.', projectIdx: 2, vendorIdx: 2 },
  { expenseNumber: 'EXP-2026-0541', expenseDate: '2026-05-25', postingDate: '2026-05-27', sub: 36400, status: 'posted', category: 'Training Materials', notes: 'Printed syllabus and assessment booklets.', projectIdx: 1, vendorIdx: 3 },
  { expenseNumber: 'EXP-2026-0603', expenseDate: '2026-06-01', postingDate: '2026-06-03', sub: 52000, status: 'posted', category: 'IT Hardware', notes: 'Server rack components for LMS migration.', projectIdx: 5, vendorIdx: 4 },
  { expenseNumber: 'EXP-2026-0612', expenseDate: '2026-06-10', postingDate: '2026-06-12', sub: 27500, status: 'posted', category: 'Office Supplies', notes: 'Certification exam printing and binding.', projectIdx: 6, vendorIdx: 3 },
  { expenseNumber: 'EXP-2026-0620', expenseDate: '2026-06-18', postingDate: '2026-06-20', sub: 91500, status: 'posted', category: 'Consulting', notes: 'Third-party API integration consultant fees.', projectIdx: 7, vendorIdx: 5 },
  { expenseNumber: 'EXP-2026-0701', expenseDate: '2026-07-01', postingDate: '2026-07-03', sub: 43000, status: 'draft', category: 'Travel & Transport', notes: 'Cebu branch inspection travel costs.', projectIdx: 1, vendorIdx: 6 },
  { expenseNumber: 'EXP-2026-0710', expenseDate: '2026-07-08', postingDate: '2026-07-10', sub: 156000, status: 'posted', category: 'Equipment Rental', notes: 'Simulator unit rental for cadet assessment week.', projectIdx: 0, vendorIdx: 2 },
  { expenseNumber: 'EXP-2026-0718', expenseDate: '2026-07-16', postingDate: '2026-07-18', sub: 18500, status: 'voided', category: 'Miscellaneous', notes: 'Duplicate charge — voided by finance lead.', projectIdx: 4, vendorIdx: 7 },
]

async function seed(): Promise<void> {
  console.log('[seed:project-expenses] Connecting...')
  const payload = await getPayload({ config })

  const [projectRes, vendorRes, accountRes] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, limit: 20, depth: 0, overrideAccess: true, sort: 'projectCode' }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.vendors, limit: 20, depth: 0, overrideAccess: true }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts, limit: 10, depth: 0, overrideAccess: true }),
  ])

  const projects = projectRes.docs
  const vendors = vendorRes.docs.filter((v: any) => v.status === 'active')
  const accounts = accountRes.docs.filter((a: any) => a.isActive !== false)
  if (!projects.length || !vendors.length || !accounts.length) { console.error('[seed:project-expenses] Need projects, vendors, and COA.'); process.exit(1) }
  console.log(`[seed:project-expenses] ${projects.length} projects, ${vendors.length} vendors, ${accounts.length} accounts`)

  let created = 0; let updated = 0
  for (const e of entries) {
    const project = projects[e.projectIdx % projects.length]
    const vendor = vendors[e.vendorIdx % vendors.length]
    const account = accounts[0]

    const existing = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.expenses, where: { expenseNumber: { equals: e.expenseNumber } as any }, limit: 1, depth: 0, overrideAccess: true })
    const data = { expenseNumber: e.expenseNumber, expenseDate: e.expenseDate, postingDate: e.postingDate, subtotal: e.sub, status: e.status, expenseCategory: e.category, notes: e.notes, project: project.id, vendor: vendor.id, expenseAccount: account.id, currency: 'PHP', paymentMethod: 'bank' } as never

    if (existing.docs.length > 0) { await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.expenses, id: existing.docs[0].id, overrideAccess: true, data }); updated++; console.log(`  UPDATED ${e.expenseNumber}`) }
    else { await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.expenses, overrideAccess: true, data }); created++; console.log(`  CREATED ${e.expenseNumber} → ${(project as any).projectCode}`) }
  }
  console.log(`[seed:project-expenses] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}
seed().catch((e) => { console.error('[seed:project-expenses] Fatal:', e); process.exit(1) })
