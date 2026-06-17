import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS, PAYMENT_METHOD_OPTIONS } from '../accounting/constants/accounting'

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  customer?: {
    id?: number | string
  } | number | string | null
  balanceDue?: number | null
  status?: string | null
}

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  isActive?: boolean | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  isActive?: boolean | null
}

type UserDoc = {
  id: number | string
}

type SeedPaymentReceivedRecord = {
  receiptNumber: string
  customer: number | string
  paymentDate: string
  postingDate: string
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'e_wallet' | 'other'
  depositAccount?: number | string
  undepositedFundsAccount?: number | string
  amountReceived: number
  currency: 'PHP'
  exchangeRate: number
  status: 'draft'
  applications: Array<{
    invoice: number | string
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

const paymentMethods = PAYMENT_METHOD_OPTIONS.map((option) => option.value) as SeedPaymentReceivedRecord['paymentMethod'][]

const getRelationshipId = (value: InvoiceDoc['customer']) => {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  return value.id ?? null
}

async function seedAccountingPaymentsReceived() {
  const payload = await getPayload({ config })

  const [adminUsers, customerResult, invoiceResult, bankAccountResult, accountResult] = await Promise.all([
    payload.find({
      collection: 'users',
      where: { role: { equals: 'admin' } } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers as any,
      where: {
        status: {
          in: ['active', 'on_hold'],
        },
      } as never,
      limit: 100,
      depth: 0,
      sort: 'displayName',
      overrideAccess: true,
    }),
    payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices as any,
      where: {
        status: {
          in: ['posted', 'partially_paid'],
        },
      } as never,
      limit: 300,
      depth: 1,
      sort: '-invoiceDate',
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
      depth: 0,
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
      limit: 200,
      depth: 0,
      sort: 'code',
      overrideAccess: true,
    }),
  ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const customers = customerResult.docs as CustomerDoc[]
  const invoices = invoiceResult.docs as InvoiceDoc[]
  const bankAccounts = bankAccountResult.docs as BankAccountDoc[]
  const chartAccounts = accountResult.docs as ChartAccountDoc[]

  if (customers.length === 0) {
    throw new Error('No eligible customers were found. Seed customers first, then rerun this payments-received seeder.')
  }

  if (bankAccounts.length === 0) {
    throw new Error('No active bank accounts were found. Seed bank accounts first, then rerun this payments-received seeder.')
  }

  if (chartAccounts.length === 0) {
    throw new Error('No active chart accounts were found. Seed accounts first, then rerun this payments-received seeder.')
  }

  const candidateUndepositedFundsAccounts = chartAccounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''}`.toLowerCase()
    return /undeposited|cash|clearing/.test(label)
  })
  const fallbackUndepositedFundsAccounts =
    candidateUndepositedFundsAccounts.length > 0 ? candidateUndepositedFundsAccounts : chartAccounts

  const invoicesByCustomer = new Map<string, InvoiceDoc[]>()
  for (const invoice of invoices) {
    const customerId = getRelationshipId(invoice.customer)
    if (!customerId) continue
    const key = String(customerId)
    const existing = invoicesByCustomer.get(key) || []
    existing.push(invoice)
    invoicesByCustomer.set(key, existing)
  }

  let createdCount = 0
  let skippedCount = 0

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const customer = customers[index % customers.length]
    const customerInvoices = invoicesByCustomer.get(String(customer.id)) || []
    const paymentMethod = paymentMethods[index % paymentMethods.length]
    const bankAccount = bankAccounts[index % bankAccounts.length]
    const undepositedFundsAccount = fallbackUndepositedFundsAccounts[index % fallbackUndepositedFundsAccounts.length]
    const receiptNumber = `RCT-SEED-2026-${String(sequence).padStart(3, '0')}`
    const noteSeedKey = `[seed:payment-received-${String(sequence).padStart(3, '0')}]`
    const recordDate = `${baseDates[index]}T10:00:00.000Z`
    const referenceNumber = `REF-PR-${String(sequence).padStart(4, '0')}`
    const applicationInvoice =
      customerInvoices.find((invoice) => Number(invoice.balanceDue || 0) > 0 && ['posted', 'partially_paid'].includes(String(invoice.status || ''))) ||
      null
    const hasApplication = Boolean(applicationInvoice) && sequence % 4 !== 0
    const amountApplied = hasApplication
      ? Math.min(
          Math.round((Number(applicationInvoice?.balanceDue || 0) * (0.35 + (sequence % 3) * 0.15)) * 100) / 100,
          Number(applicationInvoice?.balanceDue || 0),
        )
      : 0
    const amountReceived = hasApplication ? Math.round((amountApplied + 850 + sequence * 175) * 100) / 100 : 2200 + sequence * 210
    const notes = `${noteSeedKey} Sample payment receipt seeded for receipts-customer-balances coverage.`

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      where: {
        or: [
          {
            receiptNumber: {
              equals: receiptNumber,
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

    if (existing.docs[0]) {
      skippedCount += 1
      console.log(`Skipped payment receipt seed ${receiptNumber} for ${customer.displayName || customer.customerCode || customer.id} (already exists)`)
      continue
    }

    const data: SeedPaymentReceivedRecord = {
      receiptNumber,
      customer: customer.id,
      paymentDate: recordDate,
      postingDate: recordDate,
      paymentMethod,
      depositAccount: paymentMethod === 'bank_transfer' || paymentMethod === 'check' || paymentMethod === 'card' ? bankAccount.id : undefined,
      undepositedFundsAccount: paymentMethod === 'cash' || paymentMethod === 'other' || paymentMethod === 'e_wallet' ? undepositedFundsAccount.id : undefined,
      amountReceived,
      currency: 'PHP',
      exchangeRate: 1,
      status: 'draft',
      applications: hasApplication && applicationInvoice && amountApplied > 0 ? [{ invoice: applicationInvoice.id, amountApplied }] : [],
      referenceNumber,
      notes,
      createdBy: adminId,
      updatedBy: adminId,
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      data,
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(`Created payment receipt seed ${receiptNumber} for ${customer.displayName || customer.customerCode || customer.id}`)
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
    overrideAccess: true,
  })

  console.log(`Done. Payments received created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`)
}

seedAccountingPaymentsReceived()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting payments received:', error)
    process.exit(1)
  })
