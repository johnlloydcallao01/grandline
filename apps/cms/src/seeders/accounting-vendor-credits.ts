import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
} from '../accounting/constants/accounting'
import { AccountingVendorCreditService } from '../accounting/services/bills/AccountingVendorCreditService'

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

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: string | null
  accountSubType?: string | null
  isActive?: boolean | null
}

type SettingsDoc = {
  defaultPayableAccount?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
  defaultInputTaxAccount?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
}

type VendorCreditDoc = {
  id: number | string
  status?: string | null
}

type SeedVendorCreditRecord = {
  vendorCreditNumber: string
  vendor: number | string
  creditDate: string
  postingDate: string
  status: 'draft' | 'approved'
  currency: 'PHP'
  subtotal: number
  taxTotal: number
  total: number
  sourceBill?: number | string
  applications: Array<{
    bill: number | string
    amountApplied: number
  }>
  adjustmentAccount: number | string
  reason: string
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

const getRelationshipId = (
  value: SettingsDoc['defaultPayableAccount'] | BillDoc['vendor'],
) => {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  return value.id ?? null
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100

const getVendorLabel = (vendor: VendorDoc) =>
  vendor.displayName || vendor.vendorCode || String(vendor.id)

async function seedAccountingVendorCredits() {
  const payload = await getPayload({ config })

  const [adminUsers, vendorResult, billResult, accountResult, accountingSettings] = await Promise.all([
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
    payload.findGlobal({
      slug: ACCOUNTING_GLOBAL_SLUGS.settings,
      depth: 0,
      overrideAccess: true,
    }) as Promise<SettingsDoc>,
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const vendors = vendorResult.docs as VendorDoc[]
  const bills = billResult.docs as BillDoc[]
  const accounts = accountResult.docs as ChartAccountDoc[]

  if (vendors.length === 0) {
    throw new Error('No eligible vendors were found. Seed vendors first, then rerun this vendor-credit seeder.')
  }

  if (bills.length === 0) {
    throw new Error('No eligible bills were found. Seed bills first, then rerun this vendor-credit seeder.')
  }

  if (accounts.length === 0) {
    throw new Error('No active chart accounts were found. Seed chart of accounts first, then rerun this vendor-credit seeder.')
  }

  const candidateAdjustmentAccounts = accounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''}`.toLowerCase()
    return (
      /purchase|expense|returns|allowance|discount|adjustment|supplies|utilities|repairs/.test(label) ||
      ['expense', 'cost_of_sales', 'other_expense'].includes(String(account.accountType || ''))
    )
  })
  const fallbackAccounts = candidateAdjustmentAccounts.length > 0 ? candidateAdjustmentAccounts : accounts

  const billsByVendor = new Map<string, BillDoc[]>()
  for (const bill of bills) {
    const vendorId = getRelationshipId(bill.vendor)
    if (!vendorId) continue
    const key = String(vendorId)
    const existing = billsByVendor.get(key) || []
    existing.push(bill)
    billsByVendor.set(key, existing)
  }

  const canPostBase = Boolean(getRelationshipId(accountingSettings?.defaultPayableAccount))
  const canPostTaxCredits = Boolean(getRelationshipId(accountingSettings?.defaultInputTaxAccount))
  const reservedBillBalances = new Map<string, number>()

  let createdCount = 0
  let skippedCount = 0
  let postedCount = 0
  let partiallyPaidCount = 0
  let paidCount = 0
  let draftCount = 0
  let approvedCount = 0

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const vendor = vendors[index % vendors.length]
    const vendorBills = billsByVendor.get(String(vendor.id)) || []
    const sourceBill = vendorBills.length > 0 ? vendorBills[index % vendorBills.length] : null

    const applicationBill =
      vendorBills.find((bill) => {
        const availableBalance =
          roundCurrency(Number(bill.balanceDue || 0) - Number(reservedBillBalances.get(String(bill.id)) || 0))
        return ['posted', 'partially_paid'].includes(String(bill.status || '')) && availableBalance > 50
      }) || null

    const desiredOutcome =
      sequence % 5 === 0
        ? 'paid'
        : sequence % 4 === 0
          ? 'partially_paid'
          : sequence % 3 === 0
            ? 'posted'
            : sequence % 2 === 0
              ? 'approved'
              : 'draft'

    const availableBalance = applicationBill
      ? roundCurrency(
          Number(applicationBill.balanceDue || 0) - Number(reservedBillBalances.get(String(applicationBill.id)) || 0),
        )
      : 0

    let subtotal = 1800 + sequence * 230
    let taxTotal = sequence % 3 === 0 ? 0 : roundCurrency(subtotal * 0.12)
    let targetEditableStatus: 'draft' | 'approved' = desiredOutcome === 'draft' ? 'draft' : 'approved'
    let applications: SeedVendorCreditRecord['applications'] = []

    if (desiredOutcome === 'paid' && availableBalance > 200) {
      subtotal = roundCurrency(Math.min(subtotal, Math.max(50, availableBalance - (canPostTaxCredits ? taxTotal : 0))))
      if (!canPostTaxCredits) {
        taxTotal = 0
      }
      const fullTotal = roundCurrency(subtotal + taxTotal)
      if (applicationBill && fullTotal > 0 && fullTotal <= availableBalance) {
        applications = [{ bill: applicationBill.id, amountApplied: fullTotal }]
      }
    } else if (desiredOutcome === 'partially_paid' && availableBalance > 300) {
      if (!canPostTaxCredits && taxTotal > 0) {
        taxTotal = 0
      }
      const provisionalTotal = roundCurrency(subtotal + taxTotal)
      const partialApplication = roundCurrency(
        Math.min(Math.max(100, provisionalTotal * 0.45), availableBalance, provisionalTotal - 50),
      )
      if (applicationBill && provisionalTotal > 100 && partialApplication > 0 && partialApplication < provisionalTotal) {
        applications = [{ bill: applicationBill.id, amountApplied: partialApplication }]
      }
    } else if (desiredOutcome === 'posted' && !canPostTaxCredits && taxTotal > 0) {
      taxTotal = 0
    }

    const total = roundCurrency(subtotal + taxTotal)
    const vendorCreditNumber = `VC-SEED-2026-${String(sequence).padStart(3, '0')}`
    const noteSeedKey = `[seed:vendor-credit-${String(sequence).padStart(3, '0')}]`
    const recordDate = `${baseDates[index]}T09:00:00.000Z`
    const adjustmentAccount = fallbackAccounts[index % fallbackAccounts.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits as any,
      where: {
        or: [
          {
            vendorCreditNumber: {
              equals: vendorCreditNumber,
            },
          },
          {
            notes: {
              equals: `${noteSeedKey} Sample vendor credit seeded for purchase-documents coverage.`,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existingVendorCredit = existing.docs[0] as VendorCreditDoc | undefined

    if (existingVendorCredit) {
      skippedCount += 1
      console.log(
        `Skipped vendor credit seed ${vendorCreditNumber} for ${getVendorLabel(vendor)} (already exists as ${String(existingVendorCredit.status || 'unknown')})`,
      )
      continue
    }

    const data: SeedVendorCreditRecord = {
      vendorCreditNumber,
      vendor: vendor.id,
      creditDate: recordDate,
      postingDate: recordDate,
      status: targetEditableStatus,
      currency: 'PHP',
      subtotal,
      taxTotal,
      total,
      sourceBill: sourceBill?.id,
      applications,
      adjustmentAccount: adjustmentAccount.id,
      reason: `Seeded vendor credit scenario ${sequence} for ${getVendorLabel(vendor)}.`,
      notes: `${noteSeedKey} Sample vendor credit seeded for purchase-documents coverage.`,
      createdBy: adminId,
      updatedBy: adminId,
    }

    const created = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits as any,
      data,
      depth: 0,
      overrideAccess: true,
    })) as VendorCreditDoc

    createdCount += 1

    let finalStatus: string = targetEditableStatus

    if (targetEditableStatus === 'draft') {
      draftCount += 1
    } else {
      approvedCount += 1
    }

    const canAttemptPosting =
      canPostBase &&
      targetEditableStatus === 'approved' &&
      ['posted', 'partially_paid', 'paid'].includes(desiredOutcome) &&
      (taxTotal <= 0 || canPostTaxCredits)

    if (canAttemptPosting) {
      try {
        const posted = (await AccountingVendorCreditService.postVendorCredit({
          payload,
          vendorCreditId: created.id,
          userId: adminId,
        })) as VendorCreditDoc & {
          appliedAmount?: number | null
        }

        finalStatus = String(posted.status || 'posted')
        approvedCount -= 1

        if (applications[0]?.bill) {
          const billId = String(applications[0].bill)
          reservedBillBalances.set(
            billId,
            roundCurrency(
              Number(reservedBillBalances.get(billId) || 0) + Number(applications[0].amountApplied || 0),
            ),
          )
        }

        if (finalStatus === 'paid') {
          paidCount += 1
        } else if (finalStatus === 'partially_paid') {
          partiallyPaidCount += 1
        } else {
          postedCount += 1
        }
      } catch (error) {
        console.log(
          `Created vendor credit seed ${vendorCreditNumber} for ${getVendorLabel(vendor)} but left it ${targetEditableStatus} because posting failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        )
      }
    }

    console.log(`Created vendor credit seed ${vendorCreditNumber} for ${getVendorLabel(vendor)} as ${finalStatus}`)
  }

  const totalCount = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits as any,
    overrideAccess: true,
  })

  if (!canPostBase) {
    console.log(
      'Posting was skipped for seeded vendor credits because Accounting Settings is missing defaultPayableAccount.',
    )
  } else if (!canPostTaxCredits) {
    console.log(
      'Tax-bearing vendor credits were left editable because Accounting Settings is missing defaultInputTaxAccount.',
    )
  }

  console.log(
    `Done. Vendor credits created: ${createdCount}, skipped: ${skippedCount}, drafts: ${draftCount}, approved: ${approvedCount}, posted: ${postedCount}, partially paid: ${partiallyPaidCount}, paid: ${paidCount}, total now: ${totalCount.totalDocs}`,
  )
}

seedAccountingVendorCredits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting vendor credits:', error)
    process.exit(1)
  })
