import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedRun = {
  payrollCode: string
  periodStart: string
  periodEnd: string
  paymentDate: string
  status: 'draft' | 'review' | 'approved' | 'posted'
  branchCode: string | null
  notes: string
}

const sampleRuns: SeedRun[] = [
  {
    payrollCode: 'PAYRUN-20260530001',
    periodStart: '2026-05-01',
    periodEnd: '2026-05-15',
    paymentDate: '2026-05-20',
    status: 'posted',
    branchCode: 'MNL-MAIN',
    notes: 'First half May 2026 payroll for Manila Main Office — all regular salary entries posted.',
  },
  {
    payrollCode: 'PAYRUN-20260530002',
    periodStart: '2026-05-16',
    periodEnd: '2026-05-31',
    paymentDate: '2026-06-05',
    status: 'approved',
    branchCode: 'MNL-MAIN',
    notes: 'Second half May 2026 payroll — approved and awaiting posting.',
  },
  {
    payrollCode: 'PAYRUN-20260630001',
    periodStart: '2026-06-01',
    periodEnd: '2026-06-15',
    paymentDate: '2026-06-20',
    status: 'review',
    branchCode: 'CEBU-CITY',
    notes: 'First half June 2026 payroll for Cebu branch — under review.',
  },
  {
    payrollCode: 'PAYRUN-20260630002',
    periodStart: '2026-06-16',
    periodEnd: '2026-06-30',
    paymentDate: '2026-07-05',
    status: 'draft',
    branchCode: 'CEBU-CITY',
    notes: 'Second half June 2026 payroll for Cebu branch — still in draft.',
  },
  {
    payrollCode: 'PAYRUN-20260730001',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-15',
    paymentDate: '2026-07-20',
    status: 'draft',
    branchCode: 'DAVAO-MAIN',
    notes: 'First half July 2026 payroll for Davao branch — draft entry.',
  },
  {
    payrollCode: 'PAYRUN-20260730002',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    paymentDate: '2026-08-05',
    status: 'approved',
    branchCode: 'MNL-NORTH',
    notes: 'Monthly July 2026 payroll for Manila North QC — approved.',
  },
  {
    payrollCode: 'PAYRUN-20260830001',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-15',
    paymentDate: '2026-08-20',
    status: 'review',
    branchCode: null,
    notes: 'First half August 2026 payroll — no branch assigned, under review.',
  },
  {
    payrollCode: 'PAYRUN-20260830002',
    periodStart: '2026-08-16',
    periodEnd: '2026-08-31',
    paymentDate: '2026-09-05',
    status: 'draft',
    branchCode: 'DAVAO-MAIN',
    notes: 'Second half August 2026 payroll for Davao — draft.',
  },
  {
    payrollCode: 'PAYRUN-20260930001',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-15',
    paymentDate: '2026-09-20',
    status: 'draft',
    branchCode: 'CEBU-CITY',
    notes: 'First half September 2026 payroll for Cebu branch — draft.',
  },
  {
    payrollCode: 'PAYRUN-20260930002',
    periodStart: '2026-09-16',
    periodEnd: '2026-09-30',
    paymentDate: '2026-10-05',
    status: 'draft',
    branchCode: 'MNL-MAIN',
    notes: 'Second half September 2026 payroll for Manila Main — draft.',
  },
]

async function seedPayrollRuns() {
  console.log('[seed:payroll-runs] Connecting...')
  const payload = await getPayload({ config })
  console.log('[seed:payroll-runs] Connected.')

  const allBranches = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.branches,
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const branchMap = new Map<string, number | string>()
  for (const b of allBranches.docs) {
    const r = b as unknown as Record<string, unknown>
    const code = r.branchCode as string | undefined
    if (code) branchMap.set(code, b.id)
  }
  console.log(`[seed:payroll-runs] Found ${branchMap.size} branches.`)

  const adminUsers = await payload.find({
    collection: 'users',
    limit: 1,
    where: { role: { equals: 'admin' } } as never,
    depth: 0,
    overrideAccess: true,
  })
  const adminId = adminUsers.docs[0]?.id ?? null
  if (!adminId) {
    console.warn('[seed:payroll-runs] No admin user found; createdBy/updatedBy will be null.')
  }

  let created = 0
  let updated = 0

  for (const run of sampleRuns) {
    console.log(`[seed:payroll-runs] Processing ${run.payrollCode}...`)

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
      where: { payrollCode: { equals: run.payrollCode } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data: Record<string, unknown> = {
      payrollCode: run.payrollCode,
      periodStart: run.periodStart,
      periodEnd: run.periodEnd,
      paymentDate: run.paymentDate,
      status: run.status,
      branch: run.branchCode ? (branchMap.get(run.branchCode) ?? null) : null,
      notes: run.notes,
      createdBy: adminId,
      updatedBy: adminId,
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
        id: existing.docs[0].id,
        overrideAccess: true,
        data: data as never,
      })
      updated++
      console.log(`[seed:payroll-runs] Updated ${run.payrollCode}`)
    } else {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
        overrideAccess: true,
        data: data as never,
      })
      created++
      console.log(`[seed:payroll-runs] Created ${run.payrollCode}`)
    }
  }

  console.log(`[seed:payroll-runs] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedPayrollRuns().catch((error) => {
  console.error('[seed:payroll-runs] Fatal error:', error)
  process.exit(1)
})
