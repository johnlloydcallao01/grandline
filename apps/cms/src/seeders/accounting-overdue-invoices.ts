import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_GLOBAL_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
} from '../accounting/constants/accounting'
import { AccountingInvoiceService } from '../accounting/services/invoices/AccountingInvoiceService'
import { AccountingPaymentReceivedService } from '../accounting/services/payments/AccountingPaymentReceivedService'

type UserDoc = {
  id: number | string
}

type CustomerDoc = {
  id: number | string
  customerCode?: string | null
  displayName?: string | null
  status?: string | null
}

type ChartAccountDoc = {
  id: number | string
  code?: string | null
  name?: string | null
  accountType?: string | null
  accountSubType?: string | null
  isActive?: boolean | null
}

type BankAccountDoc = {
  id: number | string
  accountName?: string | null
  bankName?: string | null
  isActive?: boolean | null
}

type InvoiceDoc = {
  id: number | string
  invoiceNumber?: string | null
  status?: string | null
  total?: number | null
  balanceDue?: number | null
}

type PaymentDoc = {
  id: number | string
}

type AccountingSettingsDoc = {
  defaultReceivableAccount?:
    | {
        id?: number | string
      }
    | number
    | string
    | null
}

const SAMPLE_COUNT = 20

const baseDates = [
  { invoiceDate: '2026-06-01', dueDate: '2026-06-05' },
  { invoiceDate: '2026-06-01', dueDate: '2026-06-06' },
  { invoiceDate: '2026-06-02', dueDate: '2026-06-06' },
  { invoiceDate: '2026-06-02', dueDate: '2026-06-07' },
  { invoiceDate: '2026-06-03', dueDate: '2026-06-07' },
  { invoiceDate: '2026-06-03', dueDate: '2026-06-08' },
  { invoiceDate: '2026-06-04', dueDate: '2026-06-08' },
  { invoiceDate: '2026-06-04', dueDate: '2026-06-09' },
  { invoiceDate: '2026-06-05', dueDate: '2026-06-09' },
  { invoiceDate: '2026-06-05', dueDate: '2026-06-10' },
  { invoiceDate: '2026-06-06', dueDate: '2026-06-10' },
  { invoiceDate: '2026-06-06', dueDate: '2026-06-11' },
  { invoiceDate: '2026-06-07', dueDate: '2026-06-11' },
  { invoiceDate: '2026-06-07', dueDate: '2026-06-12' },
  { invoiceDate: '2026-06-08', dueDate: '2026-06-12' },
  { invoiceDate: '2026-06-08', dueDate: '2026-06-13' },
  { invoiceDate: '2026-06-09', dueDate: '2026-06-13' },
  { invoiceDate: '2026-06-09', dueDate: '2026-06-14' },
  { invoiceDate: '2026-06-10', dueDate: '2026-06-15' },
  { invoiceDate: '2026-06-11', dueDate: '2026-06-16' },
] as const

const getCustomerLabel = (customer: CustomerDoc) =>
  customer.displayName || customer.customerCode || String(customer.id)

const getRelationshipId = (value: AccountingSettingsDoc['defaultReceivableAccount']) => {
  if (!value) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  return value.id ?? null
}

async function seedAccountingOverdueInvoices() {
  const payload = await getPayload({ config })

  const [
    adminUsers,
    customerResult,
    accountResult,
    bankAccountResult,
    existingInvoiceResult,
    accountingSettings,
  ] =
    await Promise.all([
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
        limit: 200,
        depth: 0,
        sort: 'displayName',
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
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices as any,
        where: {
          invoiceNumber: {
            like: 'ODINV-SEED-2026-',
          },
        } as never,
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }),
      payload.findGlobal({
        slug: ACCOUNTING_GLOBAL_SLUGS.settings,
        depth: 0,
        overrideAccess: true,
      }) as Promise<AccountingSettingsDoc>,
    ])

  const adminId = (adminUsers.docs[0] as UserDoc | undefined)?.id ?? null
  const customers = customerResult.docs as CustomerDoc[]
  const accounts = accountResult.docs as ChartAccountDoc[]
  const bankAccounts = bankAccountResult.docs as BankAccountDoc[]
  const existingInvoices = existingInvoiceResult.docs as InvoiceDoc[]

  if (customers.length === 0) {
    throw new Error('No eligible customers were found. Seed customers first, then rerun this overdue-invoices seeder.')
  }

  if (accounts.length === 0) {
    throw new Error('No active chart accounts were found. Seed chart of accounts first, then rerun this overdue-invoices seeder.')
  }

  if (bankAccounts.length === 0) {
    throw new Error('No active bank accounts were found. Seed bank accounts first, then rerun this overdue-invoices seeder.')
  }

  const incomeAccounts = accounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''}`.toLowerCase()
    return account.accountType === 'revenue' || /revenue|sales|training|tuition|service|income/.test(label)
  })

  const fallbackIncomeAccounts = incomeAccounts.length > 0 ? incomeAccounts : accounts
  const defaultBankAccount = bankAccounts[0]
  const receivableAccounts = accounts.filter((account) => {
    const label = `${account.code || ''} ${account.name || ''}`.toLowerCase()
    return account.accountSubType === 'accounts_receivable' || /accounts receivable|receivable/.test(label)
  })
  const receivableAccount = receivableAccounts[0]
  const canPostPartialPayments = Boolean(getRelationshipId(accountingSettings?.defaultReceivableAccount))

  let createdCount = 0
  let skippedCount = 0
  let postedCount = 0
  let partiallyPaidCount = 0

  if (!receivableAccount) {
    throw new Error('No active accounts receivable ledger account was found. Seed chart of accounts first, then rerun this overdue-invoices seeder.')
  }

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const sequence = index + 1
    const customer = customers[index % customers.length]
    const incomeAccount = fallbackIncomeAccounts[index % fallbackIncomeAccounts.length]
    const invoiceNumber = `ODINV-SEED-2026-${String(sequence).padStart(3, '0')}`
    const paymentReceiptNumber = `ODPAY-SEED-2026-${String(sequence).padStart(3, '0')}`
    const noteSeedKey = `[seed:overdue-invoice-${String(sequence).padStart(3, '0')}]`
    const dates = baseDates[index]
    const invoiceDate = `${dates.invoiceDate}T09:00:00.000Z`
    const postingDate = `${dates.invoiceDate}T09:30:00.000Z`
    const dueDate = `${dates.dueDate}T00:00:00.000Z`
    const lineOneAmount = 7200 + sequence * 550
    const lineTwoAmount = 1800 + sequence * 175
    const shouldCreatePartialPayment = sequence % 3 === 0 || sequence % 5 === 0
    const invoiceMemo = `${noteSeedKey} Sample overdue invoice seeded for collections-ar-monitoring coverage.`

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices as any,
      where: {
        or: [
          {
            invoiceNumber: {
              equals: invoiceNumber,
            },
          },
          {
            notes: {
              equals: invoiceMemo,
            },
          },
        ],
      } as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existingInvoice = existing.docs[0] as InvoiceDoc | undefined

    if (existingInvoice) {
      const existingStatus = String(existingInvoice.status || '')

      if (['posted', 'partially_paid', 'paid'].includes(existingStatus)) {
        skippedCount += 1
        console.log(
          `Skipped overdue invoice seed ${invoiceNumber} for ${getCustomerLabel(customer)} (already exists)`,
        )
        continue
      }

      const existingLineItems = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems as any,
        where: {
          invoice: {
            equals: existingInvoice.id,
          },
        } as never,
        limit: 10,
        depth: 0,
        sort: 'lineNumber',
        overrideAccess: true,
      })

      const existingLineNumbers = new Set(
        existingLineItems.docs
          .map((line: any) => Number(line?.lineNumber || 0))
          .filter((lineNumber: number) => lineNumber > 0),
      )

      if (!existingLineNumbers.has(1)) {
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems as any,
          depth: 0,
          overrideAccess: true,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
          },
          data: {
            invoice: existingInvoice.id,
            lineNumber: 1,
            description: `Overdue seeded service line ${sequence}A`,
            itemType: 'service',
            quantity: 1,
            unitPrice: lineOneAmount,
            discountAmount: 0,
            incomeAccount: incomeAccount.id,
            receivableAccountOverride: receivableAccount.id,
            createdBy: adminId,
            updatedBy: adminId,
          },
        })
      }

      if (!existingLineNumbers.has(2)) {
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems as any,
          depth: 0,
          overrideAccess: true,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
          },
          data: {
            invoice: existingInvoice.id,
            lineNumber: 2,
            description: `Overdue seeded service line ${sequence}B`,
            itemType: 'service',
            quantity: 1,
            unitPrice: lineTwoAmount,
            discountAmount: 0,
            incomeAccount: incomeAccount.id,
            receivableAccountOverride: receivableAccount.id,
            createdBy: adminId,
            updatedBy: adminId,
          },
        })
      }

      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices as any,
        id: existingInvoice.id,
        depth: 0,
        overrideAccess: true,
        data: {
          invoiceDate,
          postingDate,
          dueDate,
          receivableAccountOverride: receivableAccount.id,
          updatedBy: adminId,
        },
      })

      await AccountingInvoiceService.postInvoice({
        payload,
        invoiceId: existingInvoice.id,
        userId: adminId,
      })

      postedCount += 1
      console.log(`Recovered and posted overdue invoice seed ${invoiceNumber} for ${getCustomerLabel(customer)}`)
      continue
    }

    const createdInvoice = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices as any,
      depth: 0,
      overrideAccess: true,
      data: {
        invoiceNumber,
        customer: customer.id,
        invoiceDate,
        postingDate,
        dueDate,
        status: 'draft',
        currency: 'PHP',
        exchangeRate: 1,
        referenceNumber: `AR-OD-${String(sequence).padStart(4, '0')}`,
        memo: `Collections follow-up scenario ${sequence} for ${getCustomerLabel(customer)}.`,
        sourceType: 'commercial_invoice',
        sourceReference: `OVERDUE-${String(sequence).padStart(4, '0')}`,
        receivableAccountOverride: receivableAccount.id,
        notes: invoiceMemo,
        createdBy: adminId,
        updatedBy: adminId,
      },
    })) as InvoiceDoc

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems as any,
      depth: 0,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
      },
      data: {
        invoice: createdInvoice.id,
        lineNumber: 1,
        description: `Overdue seeded service line ${sequence}A`,
        itemType: 'service',
        quantity: 1,
        unitPrice: lineOneAmount,
        discountAmount: 0,
        incomeAccount: incomeAccount.id,
        receivableAccountOverride: receivableAccount.id,
        createdBy: adminId,
        updatedBy: adminId,
      },
    })

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems as any,
      depth: 0,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
      },
      data: {
        invoice: createdInvoice.id,
        lineNumber: 2,
        description: `Overdue seeded service line ${sequence}B`,
        itemType: 'service',
        quantity: 1,
        unitPrice: lineTwoAmount,
        discountAmount: 0,
        incomeAccount: incomeAccount.id,
        receivableAccountOverride: receivableAccount.id,
        createdBy: adminId,
        updatedBy: adminId,
      },
    })

    const postedInvoice = (await AccountingInvoiceService.postInvoice({
      payload,
      invoiceId: createdInvoice.id,
      userId: adminId,
    })) as InvoiceDoc

    createdCount += 1
    postedCount += 1
    console.log(`Created and posted overdue invoice seed ${invoiceNumber} for ${getCustomerLabel(customer)}`)

    if (!shouldCreatePartialPayment || !canPostPartialPayments) {
      if (shouldCreatePartialPayment && !canPostPartialPayments) {
        console.log(
          `Skipped partial payment for ${invoiceNumber} because accounting setting "defaultReceivableAccount" is not configured.`,
        )
      }
      continue
    }

    const invoiceTotal = Number(postedInvoice.total || 0)
    const appliedAmount = Math.min(
      Math.round((invoiceTotal * (0.22 + (sequence % 4) * 0.09)) * 100) / 100,
      Math.max(0, invoiceTotal - 500),
    )

    if (appliedAmount <= 0) {
      continue
    }

    const payment = (await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived as any,
      depth: 0,
      overrideAccess: true,
      data: {
        receiptNumber: paymentReceiptNumber,
        customer: customer.id,
        paymentDate: `${dates.dueDate}T12:00:00.000Z`,
        postingDate: `${dates.dueDate}T12:30:00.000Z`,
        paymentMethod: 'bank_transfer',
        depositAccount: defaultBankAccount.id,
        amountReceived: appliedAmount,
        currency: 'PHP',
        exchangeRate: 1,
        status: 'draft',
        applications: [
          {
            invoice: createdInvoice.id,
            amountApplied: appliedAmount,
          },
        ],
        referenceNumber: `ODPAYREF-${String(sequence).padStart(4, '0')}`,
        notes: `[seed:overdue-payment-${String(sequence).padStart(3, '0')}] Sample payment seeded for overdue invoice coverage.`,
        createdBy: adminId,
        updatedBy: adminId,
      },
    })) as PaymentDoc

    await AccountingPaymentReceivedService.postPayment({
      payload,
      paymentId: payment.id,
      userId: adminId,
    })

    partiallyPaidCount += 1
    console.log(`Applied posted partial payment ${paymentReceiptNumber} against ${invoiceNumber}`)
  }

  const totalInvoices = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.invoices as any,
    overrideAccess: true,
  })

  const seededInvoices = existingInvoices.length + createdCount

  console.log(
    `Done. Overdue invoice seeds created: ${createdCount}, skipped: ${skippedCount}, posted: ${postedCount}, partially paid via payments: ${partiallyPaidCount}, seeded invoice total now: ${seededInvoices}, overall invoice total now: ${totalInvoices.totalDocs}`,
  )
}

seedAccountingOverdueInvoices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed accounting overdue invoices:', error)
    process.exit(1)
  })
