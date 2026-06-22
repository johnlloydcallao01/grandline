import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountType?: string | null
  isActive?: boolean | null
  ledgerAccount?: number | string | { id?: number | string | null } | null
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

type SampleWindowTemplate = {
  seedKey: string
  statementStartDate: string
  statementEndDate: string
  statementClosingBalance: number
  bookClosingBalance: number
  differenceAmount: number
  status: 'draft' | 'in_progress' | 'completed' | 'locked'
  completedAt?: string
  noteSuffix: string
}

const SAMPLE_COUNT = 20

const monthThemes = [
  'month-end treasury review',
  'daily collections sweep validation',
  'payroll clearing review',
  'merchant settlement matching',
  'branch deposit tie-out',
  'cash concentration review',
  'tuition receipts balancing',
  'refund clearing follow-up',
] as const

const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const buildMonthStart = (index: number) => {
  const year = 2025 + Math.floor(index / 12)
  const month = index % 12
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
}

const buildSampleWindows = (): SampleWindowTemplate[] =>
  Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const sequence = index + 1
    const startDate = buildMonthStart(index)
    const endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0, 23, 59, 59, 999))
    const differenceAmount =
      sequence % 5 === 0
        ? 0
        : sequence % 4 === 0
          ? roundAmount(850 + sequence * 97.45)
          : sequence % 3 === 0
            ? roundAmount(1450 + sequence * 121.3)
            : roundAmount(320 + sequence * 54.2)
    const bookClosingBalance = roundAmount(235000 + sequence * 18425 + (index % 4) * 3625.75)
    const statementClosingBalance = roundAmount(bookClosingBalance + differenceAmount)
    const status =
      sequence % 6 === 0
        ? 'locked'
        : sequence % 5 === 0
          ? 'completed'
          : sequence % 2 === 0
            ? 'in_progress'
            : 'draft'
    const completedAt =
      status === 'completed' || status === 'locked'
        ? new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() + 2, 10, 0, 0, 0)).toISOString()
        : undefined

    return {
      seedKey: `reconciliation-session-${String(sequence).padStart(3, '0')}`,
      statementStartDate: startDate.toISOString(),
      statementEndDate: endDate.toISOString(),
      statementClosingBalance,
      bookClosingBalance,
      differenceAmount,
      status,
      completedAt,
      noteSuffix: `Sample reconciliation seeded for ${monthThemes[index % monthThemes.length]}.`,
    }
  })

async function seedAccountingBankReconciliations() {
  const payload = await getPayload({ config })
  const sampleWindows = buildSampleWindows()

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
      where: {
        and: [
          { isActive: { not_equals: false } },
          { accountType: { equals: 'bank' } },
        ],
      } as never,
      limit: 200,
      depth: 1,
      sort: 'accountName',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const availableBankAccounts = (bankAccounts.docs as BankAccountDoc[]).filter((bankAccount) => {
    const ledgerAccount = bankAccount.ledgerAccount
    if (!ledgerAccount) return false
    if (typeof ledgerAccount === 'object') return Boolean(ledgerAccount.id)
    return true
  })

  if (availableBankAccounts.length === 0) {
    throw new Error(
      'No active bank-type accounts with ledger accounts were found. Seed bank accounts first, then rerun this reconciliation seeder.',
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
