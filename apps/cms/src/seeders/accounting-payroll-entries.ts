import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type SeedEntry = {
  payrollRunIdx: number
  entryType: 'salary' | 'contractor' | 'reimbursement' | 'adjustment'
  grossAmount: number
  deductionAmount: number
  expenseAccountId: number
  payableAccountId: number
  status: 'draft' | 'approved' | 'posted'
  notes: string
}

const sampleEntries: SeedEntry[] = [
  {
    payrollRunIdx: 0,
    entryType: 'salary',
    grossAmount: 48500,
    deductionAmount: 5200,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'posted',
    notes: 'Regular salary for Maria Santos — May 1-15 period.',
  },
  {
    payrollRunIdx: 0,
    entryType: 'contractor',
    grossAmount: 18000,
    deductionAmount: 0,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'posted',
    notes: 'Contractor payout for Joel Reyes — Radar Observer Course.',
  },
  {
    payrollRunIdx: 0,
    entryType: 'salary',
    grossAmount: 52300,
    deductionAmount: 6100,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'posted',
    notes: 'Regular salary for Ana Cruz — May 1-15 period.',
  },
  {
    payrollRunIdx: 1,
    entryType: 'reimbursement',
    grossAmount: 3600,
    deductionAmount: 0,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'approved',
    notes: 'Travel reimbursement for BST Internal Refresh.',
  },
  {
    payrollRunIdx: 1,
    entryType: 'salary',
    grossAmount: 48500,
    deductionAmount: 5200,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'approved',
    notes: 'Regular salary for Paolo Ramos — May 16-31 period.',
  },
  {
    payrollRunIdx: 2,
    entryType: 'adjustment',
    grossAmount: 2150,
    deductionAmount: 0,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'draft',
    notes: 'Adjustment entry for Oceanic Fleet Upskilling — under review.',
  },
  {
    payrollRunIdx: 2,
    entryType: 'salary',
    grossAmount: 39800,
    deductionAmount: 4300,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'draft',
    notes: 'Salary entry for Cebu branch employee — June 1-15.',
  },
  {
    payrollRunIdx: 3,
    entryType: 'contractor',
    grossAmount: 25000,
    deductionAmount: 0,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'draft',
    notes: 'Contractor payout for Davao-based trainer — June 16-30.',
  },
  {
    payrollRunIdx: 4,
    entryType: 'salary',
    grossAmount: 45200,
    deductionAmount: 4800,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'draft',
    notes: 'Salary entry for Manila North employee — July 1-15.',
  },
  {
    payrollRunIdx: 6,
    entryType: 'reimbursement',
    grossAmount: 5800,
    deductionAmount: 0,
    expenseAccountId: 32,
    payableAccountId: 28,
    status: 'draft',
    notes: 'Travel and meal reimbursement for unassigned branch — August 1-15.',
  },
]

async function seedPayrollEntries() {
  console.log('[seed:payroll-entries] Connecting...')
  const payload = await getPayload({ config })
  console.log('[seed:payroll-entries] Connected.')

  const allRuns = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.payrollRuns,
    limit: 100,
    depth: 0,
    sort: '-periodStart',
    overrideAccess: true,
  })
  const runs = allRuns.docs as unknown as Record<string, unknown>[]
  console.log(`[seed:payroll-entries] Found ${runs.length} payroll runs.`)

  const adminUsers = await payload.find({
    collection: 'users',
    limit: 1,
    where: { role: { equals: 'admin' } } as never,
    depth: 0,
    overrideAccess: true,
  })
  const adminId = adminUsers.docs[0]?.id ?? null

  let created = 0
  let updated = 0

  for (const entry of sampleEntries) {
    const run = runs[entry.payrollRunIdx]
    if (!run) {
      console.warn(`[seed:payroll-entries] Skipping entry ${entry.notes.slice(0, 40)}... — no payroll run at index ${entry.payrollRunIdx}.`)
      continue
    }
    const expenseId = entry.expenseAccountId
    const payableId = entry.payableAccountId

    const runCode = String(run.payrollCode || '')
    const label = `${runCode} / ${entry.entryType} / ${entry.grossAmount}`
    console.log(`[seed:payroll-entries] Processing ${label}...`)

    const data: Record<string, unknown> = {
      payrollRun: run.id,
      entryType: entry.entryType,
      grossAmount: entry.grossAmount,
      deductionAmount: entry.deductionAmount,
      expenseAccount: expenseId,
      payableAccount: payableId,
      status: entry.status,
      notes: entry.notes,
      createdBy: adminId,
      updatedBy: adminId,
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
      overrideAccess: true,
      data: data as never,
    })
    created++
    console.log(`[seed:payroll-entries] Created ${label}`)
  }

  console.log(`[seed:payroll-entries] Done. Created: ${created}, Updated: ${updated}`)
  process.exit(0)
}

seedPayrollEntries().catch((error) => {
  console.error('[seed:payroll-entries] Fatal error:', error)
  process.exit(1)
})
