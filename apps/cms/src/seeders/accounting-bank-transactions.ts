import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  accountType?: string | null
  isActive?: boolean | null
}

type UserDoc = {
  id: number | string
}

type SeedTransactionTemplate = {
  seedKey: string
  transactionDate: string
  valueDate?: string | null
  description: string
  referenceNumber: string
  amountIn: number
  amountOut: number
  matchStatus: 'unmatched' | 'suggested' | 'ignored'
  matchedEntityType?: null
  matchedEntityId?: null
  metadata?: Record<string, unknown> | null
}

const sampleTemplates: SeedTransactionTemplate[] = [
  {
    seedKey: 'bank-txn-sample-001',
    transactionDate: '2026-06-01T09:15:00.000Z',
    valueDate: '2026-06-01T09:15:00.000Z',
    description: 'Training enrollment collections - morning batch',
    referenceNumber: 'SAMPLE-BTX-202606-001',
    amountIn: 28500,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'statement-import' },
  },
  {
    seedKey: 'bank-txn-sample-002',
    transactionDate: '2026-06-01T13:40:00.000Z',
    valueDate: '2026-06-01T13:40:00.000Z',
    description: 'Vendor courier settlement for printed modules',
    referenceNumber: 'SAMPLE-BTX-202606-002',
    amountIn: 0,
    amountOut: 12450,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', channel: 'manual-review' },
  },
  {
    seedKey: 'bank-txn-sample-003',
    transactionDate: '2026-06-02T10:05:00.000Z',
    valueDate: '2026-06-02T10:05:00.000Z',
    description: 'Online payment gateway settlement',
    referenceNumber: 'SAMPLE-BTX-202606-003',
    amountIn: 41860,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'gateway' },
  },
  {
    seedKey: 'bank-txn-sample-004',
    transactionDate: '2026-06-02T15:25:00.000Z',
    valueDate: '2026-06-03T08:00:00.000Z',
    description: 'Internet and communications expense debit',
    referenceNumber: 'SAMPLE-BTX-202606-004',
    amountIn: 0,
    amountOut: 7860,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', channel: 'statement-import' },
  },
  {
    seedKey: 'bank-txn-sample-005',
    transactionDate: '2026-06-03T08:55:00.000Z',
    valueDate: '2026-06-03T08:55:00.000Z',
    description: 'Corporate billing collection - Compass HR',
    referenceNumber: 'SAMPLE-BTX-202606-005',
    amountIn: 96000,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'corporate' },
  },
  {
    seedKey: 'bank-txn-sample-006',
    transactionDate: '2026-06-03T14:10:00.000Z',
    valueDate: '2026-06-03T14:10:00.000Z',
    description: 'Office pantry restocking and supply run',
    referenceNumber: 'SAMPLE-BTX-202606-006',
    amountIn: 0,
    amountOut: 5320,
    matchStatus: 'ignored',
    metadata: { source: 'sample-seed', note: 'seeded ignored sample' },
  },
  {
    seedKey: 'bank-txn-sample-007',
    transactionDate: '2026-06-04T09:35:00.000Z',
    valueDate: '2026-06-04T09:35:00.000Z',
    description: 'Branch tuition receipts deposit',
    referenceNumber: 'SAMPLE-BTX-202606-007',
    amountIn: 37750,
    amountOut: 0,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', branch: 'Cebu' },
  },
  {
    seedKey: 'bank-txn-sample-008',
    transactionDate: '2026-06-04T16:20:00.000Z',
    valueDate: '2026-06-05T08:00:00.000Z',
    description: 'Payroll funding transfer out',
    referenceNumber: 'SAMPLE-BTX-202606-008',
    amountIn: 0,
    amountOut: 154200,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'treasury' },
  },
  {
    seedKey: 'bank-txn-sample-009',
    transactionDate: '2026-06-05T11:00:00.000Z',
    valueDate: '2026-06-05T11:00:00.000Z',
    description: 'Refund recovery from supplier',
    referenceNumber: 'SAMPLE-BTX-202606-009',
    amountIn: 6800,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'refund' },
  },
  {
    seedKey: 'bank-txn-sample-010',
    transactionDate: '2026-06-05T13:45:00.000Z',
    valueDate: '2026-06-05T13:45:00.000Z',
    description: 'Facility maintenance contractor payment',
    referenceNumber: 'SAMPLE-BTX-202606-010',
    amountIn: 0,
    amountOut: 22780,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', channel: 'vendor-payment' },
  },
  {
    seedKey: 'bank-txn-sample-011',
    transactionDate: '2026-06-06T10:10:00.000Z',
    valueDate: '2026-06-06T10:10:00.000Z',
    description: 'Weekend training workshop receipts',
    referenceNumber: 'SAMPLE-BTX-202606-011',
    amountIn: 18450,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'workshop' },
  },
  {
    seedKey: 'bank-txn-sample-012',
    transactionDate: '2026-06-06T15:30:00.000Z',
    valueDate: '2026-06-07T08:30:00.000Z',
    description: 'Card terminal merchant service fee',
    referenceNumber: 'SAMPLE-BTX-202606-012',
    amountIn: 0,
    amountOut: 2450,
    matchStatus: 'ignored',
    metadata: { source: 'sample-seed', channel: 'merchant-fee' },
  },
  {
    seedKey: 'bank-txn-sample-013',
    transactionDate: '2026-06-07T09:05:00.000Z',
    valueDate: '2026-06-07T09:05:00.000Z',
    description: 'Partner sponsorship remittance',
    referenceNumber: 'SAMPLE-BTX-202606-013',
    amountIn: 72500,
    amountOut: 0,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', channel: 'sponsorship' },
  },
  {
    seedKey: 'bank-txn-sample-014',
    transactionDate: '2026-06-07T14:50:00.000Z',
    valueDate: '2026-06-07T14:50:00.000Z',
    description: 'Utilities auto-debit settlement',
    referenceNumber: 'SAMPLE-BTX-202606-014',
    amountIn: 0,
    amountOut: 9340,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'auto-debit' },
  },
  {
    seedKey: 'bank-txn-sample-015',
    transactionDate: '2026-06-08T10:25:00.000Z',
    valueDate: '2026-06-08T10:25:00.000Z',
    description: 'Enrollment downpayment deposit',
    referenceNumber: 'SAMPLE-BTX-202606-015',
    amountIn: 21300,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'deposit' },
  },
  {
    seedKey: 'bank-txn-sample-016',
    transactionDate: '2026-06-08T16:05:00.000Z',
    valueDate: '2026-06-09T08:10:00.000Z',
    description: 'Training venue reservation payment',
    referenceNumber: 'SAMPLE-BTX-202606-016',
    amountIn: 0,
    amountOut: 31500,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', channel: 'reservation' },
  },
  {
    seedKey: 'bank-txn-sample-017',
    transactionDate: '2026-06-09T09:45:00.000Z',
    valueDate: '2026-06-09T09:45:00.000Z',
    description: 'Bulk AR collections posting',
    referenceNumber: 'SAMPLE-BTX-202606-017',
    amountIn: 128900,
    amountOut: 0,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'collections' },
  },
  {
    seedKey: 'bank-txn-sample-018',
    transactionDate: '2026-06-09T15:15:00.000Z',
    valueDate: '2026-06-09T15:15:00.000Z',
    description: 'Software subscription renewal debit',
    referenceNumber: 'SAMPLE-BTX-202606-018',
    amountIn: 0,
    amountOut: 11800,
    matchStatus: 'ignored',
    metadata: { source: 'sample-seed', channel: 'subscription' },
  },
  {
    seedKey: 'bank-txn-sample-019',
    transactionDate: '2026-06-10T08:40:00.000Z',
    valueDate: '2026-06-10T08:40:00.000Z',
    description: 'Government training grant proceeds',
    referenceNumber: 'SAMPLE-BTX-202606-019',
    amountIn: 84500,
    amountOut: 0,
    matchStatus: 'suggested',
    metadata: { source: 'sample-seed', channel: 'grant' },
  },
  {
    seedKey: 'bank-txn-sample-020',
    transactionDate: '2026-06-10T17:00:00.000Z',
    valueDate: '2026-06-11T08:15:00.000Z',
    description: 'Tax remittance funding transfer',
    referenceNumber: 'SAMPLE-BTX-202606-020',
    amountIn: 0,
    amountOut: 26750,
    matchStatus: 'unmatched',
    metadata: { source: 'sample-seed', channel: 'tax' },
  },
]

async function seedAccountingBankTransactions() {
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
      where: {
        and: [
          { isActive: { not_equals: false } },
          { accountType: { equals: 'bank' } },
        ],
      } as never,
      limit: 100,
      depth: 0,
      sort: 'accountName',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const availableBankAccounts = bankAccounts.docs as BankAccountDoc[]

  if (availableBankAccounts.length === 0) {
    throw new Error('No active bank-type accounts were found. Seed bank accounts first, then rerun this seeder.')
  }

  const balanceTracker = new Map<string, number>()
  let createdCount = 0
  let skippedCount = 0

  for (let index = 0; index < sampleTemplates.length; index += 1) {
    const template = sampleTemplates[index]
    const bankAccount = availableBankAccounts[index % availableBankAccounts.length]
    const bankAccountId = String(bankAccount.id)
    const previousBalance = balanceTracker.get(bankAccountId) ?? 250000 + index * 3750
    const nextBalance = previousBalance + template.amountIn - template.amountOut
    balanceTracker.set(bankAccountId, nextBalance)

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions as any,
      where: {
        referenceNumber: {
          equals: template.referenceNumber,
        },
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      skippedCount += 1
      console.log(
        `Skipped bank transaction ${template.referenceNumber} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id} (already exists)`,
      )
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions as any,
      data: {
        bankAccount: bankAccount.id,
        transactionDate: template.transactionDate,
        valueDate: template.valueDate ?? null,
        description: template.description,
        referenceNumber: template.referenceNumber,
        amountIn: template.amountIn,
        amountOut: template.amountOut,
        runningBalance: nextBalance,
        matchStatus: template.matchStatus,
        matchedEntityType: template.matchedEntityType ?? null,
        matchedEntityId: template.matchedEntityId ?? null,
        metadata: {
          ...(template.metadata || {}),
          seedKey: template.seedKey,
          seededFor: 'bank-operations',
          seededBankAccountName: bankAccount.accountName || null,
          seededBankMask: bankAccount.accountNumberMasked || null,
        },
        createdBy: adminId,
        updatedBy: adminId,
      },
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(
      `Created bank transaction ${template.referenceNumber} on ${bankAccount.accountName || bankAccount.bankName || bankAccount.id}`,
    )
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.bankTransactions as any,
    overrideAccess: true,
  })

  console.log(`Done. Bank transactions created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`)
}

seedAccountingBankTransactions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting bank transactions:', error)
    process.exit(1)
  })
