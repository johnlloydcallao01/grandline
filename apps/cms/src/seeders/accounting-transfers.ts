import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'
import { AccountingBankingService } from '../accounting/services/banking/AccountingBankingService'

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  accountType?: 'bank' | 'cash_on_hand' | 'undeposited_funds' | string | null
  isActive?: boolean | null
  ledgerAccount?: number | string | { id?: number | string | null } | null
}

type UserDoc = {
  id: number | string
}

type TransferDoc = {
  id: number | string
  transferNumber?: string | null
  status?: string | null
}

type TransferTemplate = {
  seedKey: string
  transferNumber: string
  transferDate: string
  amount: number
  note: string
  shouldPost: boolean
  movementType: 'undeposited_to_bank' | 'bank_to_undeposited' | 'bank_to_bank' | 'cash_to_bank'
}

const SAMPLE_COUNT = 20

const movementThemes = [
  'front-desk collections clearance',
  'branch cash pickup settlement',
  'merchant terminal sweep',
  'weekend workshop turnover',
  'corporate billing remittance',
  'training center deposit run',
  'refund reserve rebalancing',
  'cashier end-of-day transfer',
] as const

const getRelationshipId = (
  value: number | string | { id?: number | string | null } | null | undefined,
) => {
  if (!value) return null
  if (typeof value === 'object') return value.id ?? null
  return value
}

const buildTemplates = (): TransferTemplate[] =>
  Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const sequence = index + 1
    const day = String((index % 20) + 1).padStart(2, '0')
    const amount = Math.round((3500 + sequence * 1150 + (index % 3) * 525) * 100) / 100
    const movementType =
      sequence % 4 === 0
        ? 'bank_to_bank'
        : sequence % 5 === 0
          ? 'cash_to_bank'
          : sequence % 2 === 0
            ? 'bank_to_undeposited'
            : 'undeposited_to_bank'
    const note = `[seed:transfer-${String(sequence).padStart(3, '0')}] Sample transfer seeded for cash-movement transfers using ${movementThemes[index % movementThemes.length]}.`

    return {
      seedKey: `transfer-sample-${String(sequence).padStart(3, '0')}`,
      transferNumber: `TRF-SAMPLE-202606-${String(sequence).padStart(3, '0')}`,
      transferDate: `2026-06-${day}T10:00:00.000Z`,
      amount,
      note,
      shouldPost: sequence % 3 === 0 || sequence % 5 === 0,
      movementType,
    }
  })

const getDifferentAccount = (
  primaryPool: BankAccountDoc[],
  secondaryPool: BankAccountDoc[],
  excludedId: string,
  preferredIndex: number,
) => {
  const primaryCandidate = primaryPool.find((account, index) => index >= preferredIndex && String(account.id) !== excludedId)
  if (primaryCandidate) return primaryCandidate
  const primaryFallback = primaryPool.find((account) => String(account.id) !== excludedId)
  if (primaryFallback) return primaryFallback
  return secondaryPool.find((account) => String(account.id) !== excludedId) || null
}

const chooseAccounts = (
  template: TransferTemplate,
  allAccounts: BankAccountDoc[],
  bankAccounts: BankAccountDoc[],
  cashAccounts: BankAccountDoc[],
  undepositedAccounts: BankAccountDoc[],
  index: number,
) => {
  const bankOrCashAccounts = [...bankAccounts, ...cashAccounts]

  if (template.movementType === 'undeposited_to_bank' && undepositedAccounts.length > 0 && bankOrCashAccounts.length > 0) {
    const fromAccount = undepositedAccounts[index % undepositedAccounts.length]
    const toAccount = getDifferentAccount(bankOrCashAccounts, allAccounts, String(fromAccount.id), index % bankOrCashAccounts.length)
    return { fromAccount, toAccount }
  }

  if (template.movementType === 'bank_to_undeposited' && undepositedAccounts.length > 0 && bankOrCashAccounts.length > 0) {
    const fromAccount = bankOrCashAccounts[index % bankOrCashAccounts.length]
    const toAccount = getDifferentAccount(undepositedAccounts, allAccounts, String(fromAccount.id), index % undepositedAccounts.length)
    return { fromAccount, toAccount }
  }

  if (template.movementType === 'cash_to_bank' && cashAccounts.length > 0 && bankAccounts.length > 0) {
    const fromAccount = cashAccounts[index % cashAccounts.length]
    const toAccount = getDifferentAccount(bankAccounts, allAccounts, String(fromAccount.id), index % bankAccounts.length)
    return { fromAccount, toAccount }
  }

  if (bankAccounts.length > 0) {
    const fromAccount = bankAccounts[index % bankAccounts.length]
    const toAccount = getDifferentAccount(bankAccounts, allAccounts, String(fromAccount.id), (index + 1) % Math.max(bankAccounts.length, 1))
    return { fromAccount, toAccount }
  }

  const fromAccount = allAccounts[index % allAccounts.length]
  const toAccount = getDifferentAccount(allAccounts, allAccounts, String(fromAccount.id), (index + 1) % Math.max(allAccounts.length, 1))
  return { fromAccount, toAccount }
}

async function seedAccountingTransfers() {
  const payload = await getPayload({ config })

  const [adminUsers, bankAccountsResult] = await Promise.all([
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
          {
            or: [
              { accountType: { equals: 'bank' } },
              { accountType: { equals: 'cash_on_hand' } },
              { accountType: { equals: 'undeposited_funds' } },
            ],
          },
        ],
      } as never,
      limit: 300,
      depth: 1,
      sort: 'accountName',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const allAccounts = (bankAccountsResult.docs as BankAccountDoc[]).filter((account) => Boolean(getRelationshipId(account.ledgerAccount)))
  const bankAccounts = allAccounts.filter((account) => account.accountType === 'bank')
  const cashAccounts = allAccounts.filter((account) => account.accountType === 'cash_on_hand')
  const undepositedAccounts = allAccounts.filter((account) => account.accountType === 'undeposited_funds')
  const templates = buildTemplates()

  if (allAccounts.length < 2) {
    throw new Error('At least two active bank or cash accounts with ledger accounts are required before seeding transfers.')
  }

  let createdCount = 0
  let skippedCount = 0
  let postedCount = 0
  let upgradedPostedCount = 0

  for (let index = 0; index < templates.length; index += 1) {
    const template = templates[index]
    const { fromAccount, toAccount } = chooseAccounts(
      template,
      allAccounts,
      bankAccounts,
      cashAccounts,
      undepositedAccounts,
      index,
    )

    if (!fromAccount || !toAccount) {
      throw new Error(`Unable to find valid accounts for transfer ${template.transferNumber}.`)
    }

    if (String(fromAccount.id) === String(toAccount.id)) {
      throw new Error(`Transfer ${template.transferNumber} resolved to the same origin and destination account.`)
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.transfers as any,
      where: {
        or: [
          {
            transferNumber: {
              equals: template.transferNumber,
            },
          },
          {
            notes: {
              equals: template.note,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let transferRecord = (existing.docs[0] as TransferDoc | undefined) ?? null
    let wasCreated = false

    if (!transferRecord) {
      transferRecord = (await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.transfers as any,
        data: {
          transferNumber: template.transferNumber,
          transferDate: template.transferDate,
          fromBankAccount: fromAccount.id,
          toBankAccount: toAccount.id,
          amount: template.amount,
          status: 'draft',
          notes: template.note,
          createdBy: adminId,
          updatedBy: adminId,
        },
        depth: 0,
        overrideAccess: true,
      })) as TransferDoc

      createdCount += 1
      wasCreated = true
      console.log(
        `Created transfer ${template.transferNumber} from ${fromAccount.accountName || fromAccount.bankName || fromAccount.id} to ${toAccount.accountName || toAccount.bankName || toAccount.id}`,
      )
    } else {
      skippedCount += 1
      console.log(`Skipped transfer ${template.transferNumber} (already exists)`)
    }

    if (template.shouldPost && transferRecord && String(transferRecord.status || '') !== 'posted') {
      transferRecord = (await AccountingBankingService.postTransfer({
        payload,
        transferId: transferRecord.id,
        userId: adminId,
      })) as TransferDoc

      if (wasCreated && String(transferRecord.status || '') === 'posted') {
        postedCount += 1
      } else if (String(transferRecord.status || '') === 'posted') {
        upgradedPostedCount += 1
      }

      console.log(`Posted transfer ${template.transferNumber} through AccountingBankingService`)
    }
  }

  const totals = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.transfers as any,
    overrideAccess: true,
  })

  console.log(
    `Done. Transfers created: ${createdCount}, skipped: ${skippedCount}, posted now: ${postedCount}, upgraded to posted on rerun: ${upgradedPostedCount}, total now: ${totals.totalDocs}`,
  )
}

seedAccountingTransfers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting transfers:', error)
    process.exit(1)
  })
