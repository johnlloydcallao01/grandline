import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

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

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  isActive?: boolean | null
}

type UserDoc = {
  id: number | string
}

type SeedCreditNoteRecord = {
  creditNoteNumber: string
  customer: number | string
  creditDate: string
  postingDate: string
  status: 'draft' | 'approved'
  currency: 'PHP'
  subtotal: number
  taxTotal: number
  total: number
  sourceInvoice?: number | string
  applications: Array<{
    invoice: number | string
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
  '2026-05-01',
  '2026-05-03',
  '2026-05-05',
  '2026-05-07',
  '2026-05-09',
  '2026-05-11',
  '2026-05-13',
  '2026-05-15',
  '2026-05-17',
  '2026-05-19',
  '2026-05-21',
  '2026-05-23',
  '2026-05-25',
  '2026-05-27',
  '2026-05-29',
  '2026-05-31',
  '2026-06-02',
  '2026-06-04',
  '2026-06-06',
  '2026-06-08',
] as const

const getRelationshipId = (value: InvoiceDoc['customer']) => {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  return value.id ?? null
}

async function seedAccountingCreditNotes() {
  const payload = await getPayload({ config })

  const [adminUsers, customerResult, invoiceResult, accountResult] = await Promise.all([
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
          in: ['posted', 'partially_paid', 'approved'],
        },
      } as never,
      limit: 200,
      depth: 1,
      sort: '-invoiceDate',
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
  const accounts = accountResult.docs as ChartAccountDoc[]

  if (customers.length === 0) {
    throw new Error('No eligible customers were found. Seed customers first, then rerun this credit-note seeder.')
  }

  if (accounts.length === 0) {
    throw new Error('No active chart accounts were found. Seed accounts first, then rerun this credit-note seeder.')
  }

  const candidateAdjustmentAccounts = accounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''}`.toLowerCase()
    return /sales|revenue|discount|allowance|adjustment/.test(label)
  })
  const fallbackAccounts = candidateAdjustmentAccounts.length > 0 ? candidateAdjustmentAccounts : accounts

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
    const sourceInvoice = customerInvoices.length > 0 ? customerInvoices[index % customerInvoices.length] : null
    const applicationInvoice =
      customerInvoices.find((invoice) => Number(invoice.balanceDue || 0) > 0 && ['posted', 'partially_paid'].includes(String(invoice.status || ''))) ||
      null
    const subtotal = 3200 + sequence * 375
    const taxTotal = sequence % 3 === 0 ? 0 : Math.round(subtotal * 0.12 * 100) / 100
    const total = subtotal + taxTotal
    const hasApplication = Boolean(applicationInvoice) && sequence % 4 !== 0
    const amountApplied = hasApplication
      ? Math.min(Math.round((total * (0.25 + (sequence % 3) * 0.15)) * 100) / 100, Number(applicationInvoice?.balanceDue || 0), total - 1)
      : 0
    const creditNoteNumber = `CN-SEED-2026-${String(sequence).padStart(3, '0')}`
    const noteSeedKey = `[seed:credit-note-${String(sequence).padStart(3, '0')}]`
    const recordDate = `${baseDates[index]}T09:00:00.000Z`
    const adjustmentAccount = fallbackAccounts[index % fallbackAccounts.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes as any,
      where: {
        or: [
          {
            creditNoteNumber: {
              equals: creditNoteNumber,
            },
          },
          {
            notes: {
              equals: `${noteSeedKey} Sample credit note seeded for sales documents coverage.`,
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
      console.log(`Skipped credit note seed ${creditNoteNumber} for ${customer.displayName || customer.customerCode || customer.id} (already exists)`)
      continue
    }

    const data: SeedCreditNoteRecord = {
      creditNoteNumber,
      customer: customer.id,
      creditDate: recordDate,
      postingDate: recordDate,
      status: sequence % 2 === 0 ? 'approved' : 'draft',
      currency: 'PHP',
      subtotal,
      taxTotal,
      total,
      sourceInvoice: sourceInvoice?.id,
      applications: hasApplication && applicationInvoice && amountApplied > 0 ? [{ invoice: applicationInvoice.id, amountApplied }] : [],
      adjustmentAccount: adjustmentAccount.id,
      reason: `Seeded credit note scenario ${sequence} for ${customer.displayName || customer.customerCode || customer.id}.`,
      notes: `${noteSeedKey} Sample credit note seeded for sales documents coverage.`,
      createdBy: adminId,
      updatedBy: adminId,
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes as any,
      data,
      depth: 0,
      overrideAccess: true,
    })

    createdCount += 1
    console.log(`Created credit note seed ${creditNoteNumber} for ${customer.displayName || customer.customerCode || customer.id}`)
  }

  const total = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes as any,
    overrideAccess: true,
  })

  console.log(`Done. Credit notes created: ${createdCount}, skipped: ${skippedCount}, total now: ${total.totalDocs}`)
}

seedAccountingCreditNotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting credit notes:', error)
    process.exit(1)
  })
