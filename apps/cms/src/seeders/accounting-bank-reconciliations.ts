import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  isActive?: boolean | null
}

type UserDoc = {
  id: number | string
}

type SeedReconciliationRecord = {
  seedKey: string
  bankAccount: number | string
  statementStartDate: string
  statementEndDate: string
  statementClosingBalance: number
  bookClosingBalance: number
  differenceAmount: number
  status: 'draft' | 'in_progress' | 'completed' | 'locked'
  completedAt?: string
  completedBy?: number | string | null
  notes: string
  createdBy?: number | string | null
  updatedBy?: number | string | null
}

const sampleWindows = [
  {
    seedKey: 'control-history-recon-001',
    statementStartDate: '2026-03-01T00:00:00.000Z',
    statementEndDate: '2026-03-31T23:59:59.999Z',
    statementClosingBalance: 582340.25,
    bookClosingBalance: 582340.25,
    differenceAmount: 0,
    status: 'completed' as const,
    completedAt: '2026-04-02T09:30:00.000Z',
    noteSuffix: 'Completed month-end reconciliation with zero variance.',
  },
  {
    seedKey: 'control-history-recon-002',
    statementStartDate: '2026-04-01T00:00:00.000Z',
    statementEndDate: '2026-04-30T23:59:59.999Z',
    statementClosingBalance: 411280.8,
    bookClosingBalance: 408950.8,
    differenceAmount: 2330,
    status: 'in_progress' as const,
    noteSuffix: 'In-progress reconciliation with outstanding reconciling items.',
  },
  {
    seedKey: 'control-history-recon-003',
    statementStartDate: '2026-05-01T00:00:00.000Z',
    statementEndDate: '2026-05-31T23:59:59.999Z',
    statementClosingBalance: 915000,
    bookClosingBalance: 915000,
    differenceAmount: 0,
    status: 'locked' as const,
    completedAt: '2026-06-02T15:00:00.000Z',
    noteSuffix: 'Locked after review for control-history-exports verification.',
  },
  {
    seedKey: 'control-history-recon-004',
    statementStartDate: '2026-06-01T00:00:00.000Z',
    statementEndDate: '2026-06-30T23:59:59.999Z',
    statementClosingBalance: 268455.12,
    bookClosingBalance: 265955.12,
    differenceAmount: 2500,
    status: 'draft' as const,
    noteSuffix: 'Draft reconciliation prepared to validate draft-state visibility.',
  },
] as const

async function seedAccountingBankReconciliations() {
  const payload = await getPayload({ config })

  const [adminUsers, bankAccounts] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      where: { isActive: { not_equals: false } } as never,
      limit: sampleWindows.length,
      depth: 0,
      sort: 'accountName',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const availableBankAccounts = bankAccounts.docs as BankAccountDoc[]

  if (availableBankAccounts.length === 0) {
    throw new Error(
      'No active accounting bank accounts were found. Seed bank accounts first, then rerun this reconciliation seeder.',
    )
  }

  let createdCount = 0
  let skippedCount = 0

  for (let index = 0; index < sampleWindows.length; index += 1) {
    const windowSeed = sampleWindows[index]
    const bankAccount = availableBankAccounts[index % availableBankAccounts.length]
    const seedNote = `[seed:${windowSeed.seedKey}] ${windowSeed.noteSuffix}`
    const completedAt = 'completedAt' in windowSeed ? windowSeed.completedAt : undefined

    const data: SeedReconciliationRecord = {
      seedKey: windowSeed.seedKey,
      bankAccount: bankAccount.id,
      statementStartDate: windowSeed.statementStartDate,
      statementEndDate: windowSeed.statementEndDate,
      statementClosingBalance: windowSeed.statementClosingBalance,
      bookClosingBalance: windowSeed.bookClosingBalance,
      differenceAmount: windowSeed.differenceAmount,
      status: windowSeed.status,
      completedAt,
      completedBy: windowSeed.status === 'completed' || windowSeed.status === 'locked' ? adminId : null,
      notes: seedNote,
      createdBy: adminId,
      updatedBy: adminId,
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations as any,
      where: {
        notes: {
          equals: seedNote,
        },
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      skippedCount += 1
      console.log(`Skipped reconciliation seed ${windowSeed.seedKey} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id} (already exists)`)
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations as any,
      data,
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(`Created reconciliation seed ${windowSeed.seedKey} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id}`)
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankReconciliations as any,
    overrideAccess: true,
  })

  console.log(`Done. Reconciliations created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`)
}

seedAccountingBankReconciliations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting bank reconciliations:', error)
    process.exit(1)
  })
