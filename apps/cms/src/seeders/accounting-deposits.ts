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
  accountType?: string | null
  isActive?: boolean | null
  ledgerAccount?: number | string | { id?: number | string | null } | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: string | null
  accountSubType?: string | null
  isActive?: boolean | null
}

type UserDoc = {
  id: number | string
}

type DepositDoc = {
  id: number | string
  depositNumber?: string | null
  status?: string | null
}

type DepositTemplate = {
  seedKey: string
  depositNumber: string
  depositDate: string
  amount: number
  note: string
  shouldPost: boolean
}

const SAMPLE_COUNT = 20

const sourceThemes = [
  'front-desk collections',
  'weekend workshop receipts',
  'corporate billing receipts',
  'training center collections',
  'branch cash turnover',
  'tuition intake clearing',
  'event registration receipts',
  'miscellaneous income clearing',
] as const

const getRelationshipId = (
  value: number | string | { id?: number | string | null } | null | undefined,
) => {
  if (!value) return null
  if (typeof value === 'object') return value.id ?? null
  return value
}

const buildTemplates = (): DepositTemplate[] =>
  Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const sequence = index + 1
    const day = String((index % 20) + 1).padStart(2, '0')
    const amount = Math.round((4200 + sequence * 875 + (index % 4) * 640) * 100) / 100
    const note = `[seed:deposit-${String(sequence).padStart(3, '0')}] Sample deposit batch seeded for cash-movement deposits using ${sourceThemes[index % sourceThemes.length]}.`

    return {
      seedKey: `deposit-sample-${String(sequence).padStart(3, '0')}`,
      depositNumber: `DEP-SAMPLE-202606-${String(sequence).padStart(3, '0')}`,
      depositDate: `2026-06-${day}T09:00:00.000Z`,
      amount,
      note,
      shouldPost: sequence % 3 === 0 || sequence % 5 === 0,
    }
  })

const chooseSourceAccount = (
  sourceAccounts: ChartAccountDoc[],
  bankAccount: BankAccountDoc,
  preferredIndex: number,
) => {
  const bankLedgerId = String(getRelationshipId(bankAccount.ledgerAccount) || '')
  const filtered = sourceAccounts.filter((account) => String(account.id) !== bankLedgerId)
  if (filtered.length === 0) return null
  return filtered[preferredIndex % filtered.length]
}

async function seedAccountingDeposits() {
  const payload = await getPayload({ config })

  const [adminUsers, bankAccountsResult, chartAccountsResult] = await Promise.all([
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
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts as any,
      where: {
        isActive: {
          not_equals: false,
        },
      } as never,
      limit: 500,
      depth: 0,
      sort: 'code',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const bankAccounts = (bankAccountsResult.docs as BankAccountDoc[]).filter((account) => Boolean(getRelationshipId(account.ledgerAccount)))
  const chartAccounts = chartAccountsResult.docs as ChartAccountDoc[]

  if (bankAccounts.length === 0) {
    throw new Error('No active bank accounts with ledger accounts were found. Seed bank accounts first, then rerun this deposits seeder.')
  }

  if (chartAccounts.length === 0) {
    throw new Error('No active chart accounts were found. Seed chart of accounts first, then rerun this deposits seeder.')
  }

  const preferredSourceAccounts = chartAccounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''} ${account.accountSubType || ''}`.toLowerCase()
    return /undeposited|clearing|cash|collection|receivable|ar/.test(label)
  })
  const sourceAccounts = preferredSourceAccounts.length > 0 ? preferredSourceAccounts : chartAccounts
  const templates = buildTemplates()

  let createdCount = 0
  let skippedCount = 0
  let postedCount = 0
  let upgradedPostedCount = 0

  for (let index = 0; index < templates.length; index += 1) {
    const template = templates[index]
    const bankAccount = bankAccounts[index % bankAccounts.length]
    const sourceAccount = chooseSourceAccount(sourceAccounts, bankAccount, index)

    if (!sourceAccount) {
      throw new Error(`Unable to find a valid source account for bank account ${bankAccount.accountName || bankAccount.id}.`)
    }

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.deposits as any,
      where: {
        or: [
          {
            depositNumber: {
              equals: template.depositNumber,
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

    let depositRecord = (existing.docs[0] as DepositDoc | undefined) ?? null
    let wasCreated = false

    if (!depositRecord) {
      depositRecord = (await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.deposits as any,
        data: {
          depositNumber: template.depositNumber,
          depositDate: template.depositDate,
          bankAccount: bankAccount.id,
          sourceAccount: sourceAccount.id,
          amount: template.amount,
          status: 'draft',
          notes: template.note,
          createdBy: adminId,
          updatedBy: adminId,
        },
        depth: 0,
        overrideAccess: true,
      })) as DepositDoc

      createdCount += 1
      wasCreated = true
      console.log(
        `Created deposit ${template.depositNumber} into ${bankAccount.accountName || bankAccount.bankName || bankAccount.id} from ${sourceAccount.code || sourceAccount.name || sourceAccount.id}`,
      )
    } else {
      skippedCount += 1
      console.log(`Skipped deposit ${template.depositNumber} (already exists)`)
    }

    if (template.shouldPost && depositRecord && String(depositRecord.status || '') !== 'posted') {
      depositRecord = (await AccountingBankingService.postDeposit({
        payload,
        depositId: depositRecord.id,
        userId: adminId,
      })) as DepositDoc

      if (wasCreated && String(depositRecord.status || '') === 'posted') {
        postedCount += 1
      } else if (String(depositRecord.status || '') === 'posted') {
        upgradedPostedCount += 1
      }

      console.log(`Posted deposit ${template.depositNumber} through AccountingBankingService`)
    }
  }

  const totals = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.deposits as any,
    overrideAccess: true,
  })

  console.log(
    `Done. Deposits created: ${createdCount}, skipped: ${skippedCount}, posted now: ${postedCount}, upgraded to posted on rerun: ${upgradedPostedCount}, total now: ${totals.totalDocs}`,
  )
}

seedAccountingDeposits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting deposits:', error)
    process.exit(1)
  })
