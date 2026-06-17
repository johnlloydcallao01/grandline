import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
  PAYMENT_METHOD_OPTIONS,
} from '../accounting/constants/accounting'
import { AccountingPaymentMadeService } from '../accounting/services/payments/AccountingPaymentMadeService'

type UserDoc = {
  id: number | string
}

type VendorDoc = {
  id: number | string
  vendorCode?: string | null
  displayName?: string | null
  status?: string | null
}

type BillDoc = {
  id: number | string
  billNumber?: string | null
  vendor?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  status?: string | null
  balanceDue?: number | null
  total?: number | null
}

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  accountNumberMasked?: string | null
  isActive?: boolean | null
  isDefaultDisbursementAccount?: boolean | null
  ledgerAccount?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
}

type SettingsDoc = {
  defaultPayableAccount?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
}

type PaymentMadeDoc = {
  id: number | string
  status?: string | null
}

type SeedPaymentMadeRecord = {
  paymentNumber: string
  vendor: number | string
  paymentDate: string
  postingDate: string
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'e_wallet' | 'other'
  bankAccount: number | string
  amountPaid: number
  currency: 'PHP'
  exchangeRate: number
  status: 'draft'
  applications: Array<{
    bill: number | string
    amountApplied: number
  }>
  referenceNumber?: string
  notes: string
  createdBy?: number | string | null
  updatedBy?: number | string | null
}

const SAMPLE_COUNT = 20

const baseDates = [
  '2026-05-02',
  '2026-05-04',
  '2026-05-06',
  '2026-05-08',
  '2026-05-10',
  '2026-05-12',
  '2026-05-14',
  '2026-05-16',
  '2026-05-18',
  '2026-05-20',
  '2026-05-22',
  '2026-05-24',
  '2026-05-26',
  '2026-05-28',
  '2026-05-30',
  '2026-06-01',
  '2026-06-03',
  '2026-06-05',
  '2026-06-07',
  '2026-06-09',
] as const

const paymentMethods = PAYMENT_METHOD_OPTIONS.map(
  (option) => option.value,
) as SeedPaymentMadeRecord['paymentMethod'][]

const getRelationshipId = (
  value: SettingsDoc['defaultPayableAccount'] | BillDoc['vendor'] | BankAccountDoc['ledgerAccount'],
) => {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  return value.id ?? null
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100

const getVendorLabel = (vendor: VendorDoc) => vendor.displayName || vendor.vendorCode || String(vendor.id)

async function seedAccountingPaymentsMade() {
  const payload = await getPayload({ config })

  const [adminUsers, vendorResult, billResult, bankAccountResult, accountingSettings] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors as any,
      where: {
        status: {
          in: ['active', 'on_hold'],
        },
      } as never,
      limit: 200,
      depth: 0,
      sort: 'displayName',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'approved'],
        },
      } as never,
      limit: 500,
      depth: 1,
      sort: '-billDate',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts as any,
      where: {
        isActive: {
          not_equals: false,
        },
      } as never,
      limit: 200,
      depth: 1,
      sort: 'accountName',
      overrideAccess: true,
    }),
    payload.findGlobal({
      slug: ACCOUNTING_GLOBAL_SLUGS.settings,
      depth: 0,
      overrideAccess: true,
    }) as Promise<SettingsDoc>,
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const vendors = vendorResult.docs as VendorDoc[]
  const bills = billResult.docs as BillDoc[]
  const bankAccounts = bankAccountResult.docs as BankAccountDoc[]

  if (vendors.length === 0) {
    throw new Error('No eligible vendors were found. Seed vendors first, then rerun this payments-made seeder.')
  }

  if (bills.length === 0) {
    throw new Error('No eligible bills were found. Seed bills first, then rerun this payments-made seeder.')
  }

  if (bankAccounts.length === 0) {
    throw new Error('No active bank accounts were found. Seed bank accounts first, then rerun this payments-made seeder.')
  }

  const ledgerMappedBankAccounts = bankAccounts.filter((bankAccount) => Boolean(getRelationshipId(bankAccount.ledgerAccount)))
  if (ledgerMappedBankAccounts.length === 0) {
    throw new Error('No ledger-mapped bank accounts were found. Seed or configure bank accounts with ledger mappings first.')
  }

  const preferredBankAccounts = ledgerMappedBankAccounts.filter((bankAccount) => bankAccount.isDefaultDisbursementAccount)
  const usableBankAccounts = preferredBankAccounts.length > 0 ? preferredBankAccounts : ledgerMappedBankAccounts

  const billsByVendor = new Map<string, BillDoc[]>()
  for (const bill of bills) {
    const vendorId = getRelationshipId(bill.vendor)
    if (!vendorId) continue
    const key = String(vendorId)
    const existing = billsByVendor.get(key) || []
    existing.push(bill)
    billsByVendor.set(key, existing)
  }

  const canPost = Boolean(getRelationshipId(accountingSettings?.defaultPayableAccount))
  const reservedBillBalances = new Map<string, number>()

  let createdCount = 0
  let skippedCount = 0
  let draftCount = 0
  let postedCount = 0
  let voidedCount = 0

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const vendor = vendors[index % vendors.length]
    const vendorBills = billsByVendor.get(String(vendor.id)) || []
    const bankAccount = usableBankAccounts[index % usableBankAccounts.length]
    const paymentMethod = paymentMethods[index % paymentMethods.length]
    const applicationBill =
      vendorBills.find((bill) => {
        const availableBalance =
          roundCurrency(Number(bill.balanceDue || 0) - Number(reservedBillBalances.get(String(bill.id)) || 0))
        return ['posted', 'partially_paid'].includes(String(bill.status || '')) && availableBalance > 100
      }) || null

    const desiredOutcome =
      sequence % 5 === 0
        ? 'voided'
        : sequence % 2 === 0
          ? 'posted'
          : 'draft'

    const availableBalance = applicationBill
      ? roundCurrency(
          Number(applicationBill.balanceDue || 0) - Number(reservedBillBalances.get(String(applicationBill.id)) || 0),
        )
      : 0

    const shouldApply = Boolean(applicationBill) && sequence % 4 !== 1 && availableBalance > 0
    const provisionalAppliedAmount = shouldApply
      ? roundCurrency(
          Math.min(
            Math.max(150, availableBalance * (desiredOutcome === 'posted' ? 0.55 : 0.35)),
            availableBalance,
          ),
        )
      : 0
    const amountPaid = shouldApply
      ? roundCurrency(provisionalAppliedAmount + 600 + sequence * 125)
      : roundCurrency(1800 + sequence * 215)
    const applications =
      shouldApply && applicationBill && provisionalAppliedAmount > 0
        ? [{ bill: applicationBill.id, amountApplied: provisionalAppliedAmount }]
        : []

    const paymentNumber = `PAY-SEED-2026-${String(sequence).padStart(3, '0')}`
    const noteSeedKey = `[seed:payment-made-${String(sequence).padStart(3, '0')}]`
    const recordDate = `${baseDates[index]}T11:00:00.000Z`
    const referenceNumber = `REF-PM-${String(sequence).padStart(4, '0')}`
    const notes = `${noteSeedKey} Sample payment made seeded for vendor-payments-balances coverage.`

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade as any,
      where: {
        or: [
          {
            paymentNumber: {
              equals: paymentNumber,
            },
          },
          {
            notes: {
              equals: notes,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existingPayment = existing.docs[0] as PaymentMadeDoc | undefined
    if (existingPayment) {
      skippedCount += 1
      console.log(
        `Skipped payment made seed ${paymentNumber} for ${getVendorLabel(vendor)} (already exists as ${String(existingPayment.status || 'unknown')})`,
      )
      continue
    }

    const data: SeedPaymentMadeRecord = {
      paymentNumber,
      vendor: vendor.id,
      paymentDate: recordDate,
      postingDate: recordDate,
      paymentMethod,
      bankAccount: bankAccount.id,
      amountPaid,
      currency: 'PHP',
      exchangeRate: 1,
      status: 'draft',
      applications,
      referenceNumber,
      notes,
      createdBy: adminId,
      updatedBy: adminId,
    }

    const created = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade as any,
      data,
      depth: 0,
      overrideAccess: true,
    })) as PaymentMadeDoc

    createdCount += 1
    let finalStatus = 'draft'

    if (desiredOutcome === 'posted' && canPost) {
      try {
        const posted = (await AccountingPaymentMadeService.postPayment({
          payload,
          paymentId: created.id,
          userId: adminId,
        })) as PaymentMadeDoc

        finalStatus = String(posted.status || 'posted')
        postedCount += 1

        if (applications[0]?.bill) {
          const billId = String(applications[0].bill)
          reservedBillBalances.set(
            billId,
            roundCurrency(Number(reservedBillBalances.get(billId) || 0) + Number(applications[0].amountApplied || 0)),
          )
        }
      } catch (error) {
        draftCount += 1
        console.log(
          `Created payment made seed ${paymentNumber} for ${getVendorLabel(vendor)} but left it draft because posting failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        )
        continue
      }
    } else if (desiredOutcome === 'voided') {
      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade as any,
        id: created.id,
        depth: 0,
        overrideAccess: true,
        data: {
          status: 'voided',
          updatedBy: adminId,
        } as never,
      })
      finalStatus = 'voided'
      voidedCount += 1
    } else {
      draftCount += 1
    }

    console.log(`Created payment made seed ${paymentNumber} for ${getVendorLabel(vendor)} as ${finalStatus}`)
  }

  const totalCount = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade as any,
    overrideAccess: true,
  })

  if (!canPost) {
    console.log(
      'Posted payment samples were left as draft because Accounting Settings is missing defaultPayableAccount.',
    )
  }

  console.log(
    `Done. Payments made created: ${createdCount}, skipped: ${skippedCount}, drafts: ${draftCount}, posted: ${postedCount}, voided: ${voidedCount}, total now: ${totalCount.totalDocs}`,
  )
}

seedAccountingPaymentsMade()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting payments made:', error)
    process.exit(1)
  })
