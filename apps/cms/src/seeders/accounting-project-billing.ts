import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type Seed = { invoiceNumber: string; invoiceDate: string; dueDate: string; sub: number; status: string; memo: string | null; projectIdx: number; custIdx: number }

const entries: Seed[] = [
  { invoiceNumber: 'INV-2026-0151', invoiceDate: '2026-03-15', dueDate: '2026-04-15', sub: 320000, status: 'partially_paid', memo: 'Cadet cohort 1 — batch 7 training delivery phase 1.', projectIdx: 0, custIdx: 0 },
  { invoiceNumber: 'INV-2026-0167', invoiceDate: '2026-04-10', dueDate: '2026-05-10', sub: 450000, status: 'paid', memo: 'Fleet upskilling program — full course delivery.', projectIdx: 3, custIdx: 1 },
  { invoiceNumber: 'INV-2026-0182', invoiceDate: '2026-05-05', dueDate: '2026-06-05', sub: 168000, status: 'posted', memo: 'Simulator hardware install milestone 1.', projectIdx: 2, custIdx: 2 },
  { invoiceNumber: 'INV-2026-0191', invoiceDate: '2026-05-20', dueDate: '2026-06-20', sub: 280000, status: 'partially_paid', memo: 'Corporate cadet program — assessment phase.', projectIdx: 3, custIdx: 0 },
  { invoiceNumber: 'INV-2026-0203', invoiceDate: '2026-06-01', dueDate: '2026-07-01', sub: 180000, status: 'posted', memo: 'LMS migration consulting — phase 2.', projectIdx: 5, custIdx: 3 },
  { invoiceNumber: 'INV-2026-0215', invoiceDate: '2026-06-15', dueDate: '2026-07-15', sub: 92000, status: 'draft', memo: 'Safety certification program delivery.', projectIdx: 6, custIdx: 4 },
  { invoiceNumber: 'INV-2026-0228', invoiceDate: '2026-07-01', dueDate: '2026-08-01', sub: 195000, status: 'posted', memo: 'Finance system integration — API layer.', projectIdx: 7, custIdx: 5 },
  { invoiceNumber: 'INV-2026-0234', invoiceDate: '2026-07-10', dueDate: '2026-08-10', sub: 350000, status: 'paid', memo: 'Maritime Batch 7 — final delivery phase.', projectIdx: 0, custIdx: 0 },
  { invoiceNumber: 'INV-2026-0240', invoiceDate: '2026-07-20', dueDate: '2026-08-20', sub: 76000, status: 'draft', memo: 'IT infrastructure refresh — hardware.', projectIdx: 4, custIdx: 6 },
  { invoiceNumber: 'INV-2026-0251', invoiceDate: '2026-08-01', dueDate: '2026-09-01', sub: 215000, status: 'voided', memo: 'Voided — duplicate invoice for harbor expansion.', projectIdx: 1, custIdx: 1 },
]

async function seed(): Promise<void> {
  console.log('[seed:project-billing] Connecting...')
  const payload = await getPayload({ config })
  const [projectRes, customerRes] = await Promise.all([
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.projects, limit: 20, depth: 0, overrideAccess: true, sort: 'projectCode' }),
    payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.customers, limit: 20, depth: 0, overrideAccess: true }),
  ])
  const projects = projectRes.docs; const customers = customerRes.docs.filter((c: any) => c.status === 'active')
  if (!projects.length || !customers.length) { console.error('[seed:project-billing] Need projects and customers.'); process.exit(1) }
  console.log(`[seed:project-billing] ${projects.length} projects, ${customers.length} customers`)

  let created = 0; let updated = 0
  for (const e of entries) {
    const project = projects[e.projectIdx % projects.length]; const customer = customers[e.custIdx % customers.length]
    const existing = await payload.find({ collection: ACCOUNTING_COLLECTION_SLUGS.invoices, where: { invoiceNumber: { equals: e.invoiceNumber } as any }, limit: 1, depth: 0, overrideAccess: true })
    const data = { invoiceNumber: e.invoiceNumber, invoiceDate: e.invoiceDate, dueDate: e.dueDate, subtotal: e.sub, status: e.status, memo: e.memo, customer: customer.id, project: project.id, currency: 'PHP' } as never
    if (existing.docs.length > 0) { await payload.update({ collection: ACCOUNTING_COLLECTION_SLUGS.invoices, id: existing.docs[0].id, overrideAccess: true, data }); updated++; console.log(`  UPDATED ${e.invoiceNumber}`) }
    else { await payload.create({ collection: ACCOUNTING_COLLECTION_SLUGS.invoices, overrideAccess: true, data }); created++; console.log(`  CREATED ${e.invoiceNumber} → ${(project as any).projectCode}`) }
  }
  console.log(`[seed:project-billing] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}
seed().catch((e) => { console.error('[seed:project-billing] Fatal:', e); process.exit(1) })
