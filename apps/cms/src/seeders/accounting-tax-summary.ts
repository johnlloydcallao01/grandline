import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function seedTaxSummaryRows() {
  const payload = await getPayload({ config })
  console.log('[seed] Seeding 20 unique Tax Codes and Usages to populate Tax Summary Report...')

  // 1. Get or create an Account
  let account = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    limit: 1,
    overrideAccess: true,
  }).then(res => res.docs[0])

  if (!account) {
    account = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      data: {
        accountCode: '4000-SEED2',
        name: 'Seed Sales Account 2',
        accountType: 'revenue',
        subType: 'revenue',
        isActive: true,
      } as never,
      overrideAccess: true,
    })
  }
  const accountId = account.id

  // 2. Get or create a Customer
  let customer = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.customers,
    limit: 1,
    overrideAccess: true,
  }).then(res => res.docs[0])

  if (!customer) {
    customer = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      data: {
        customerName: 'Seed Customer 2',
        customerType: 'company',
        status: 'active',
      } as never,
      overrideAccess: true,
    })
  }
  const customerId = customer.id

  const timestamp = Date.now()
  let createdRecords = 0

  // 3. Create 20 unique Tax Codes and an Invoice for each
  for (let i = 1; i <= 20; i++) {
    const rate = i % 15 + 1 // Random rate between 1 and 15
    const scope = i % 2 === 0 ? 'sales' : 'both'
    const method = i % 3 === 0 ? 'inclusive' : 'exclusive'

    // Create Tax Code
    const taxCode = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      data: {
        code: `TAX${timestamp}_${i}`,
        name: `Sample Tax ${i} (${rate}%)`,
        scope: scope,
        rate: rate,
        calculationMethod: method,
        isActive: true,
      } as never,
      overrideAccess: true,
    })

    // Create Invoice
    const invoice = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      data: {
        invoiceNumber: `INV-SUMM-${timestamp}-${i}`,
        customer: customerId,
        issueDate: '2026-06-14',
        dueDate: '2026-06-30',
        status: 'draft',
      } as never,
      overrideAccess: true,
    })

    const amount = 1000 * i
    const taxAmount = method === 'exclusive' ? amount * (rate / 100) : amount - (amount / (1 + (rate / 100)))

    // Create Invoice Line Item
    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      data: {
        invoice: invoice.id,
        itemType: 'service',
        description: `Summary Report Seed ${i}`,
        quantity: 1,
        unitPrice: amount,
        lineSubtotal: method === 'exclusive' ? amount : amount - taxAmount,
        lineTax: taxAmount,
        lineTotal: method === 'exclusive' ? amount + taxAmount : amount,
        taxCode: taxCode.id,
        incomeAccount: accountId,
      } as never,
      overrideAccess: true,
    })

    // Post the invoice
    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoice.id,
      data: { status: 'posted' } as never,
      overrideAccess: true,
      context: { skipInvoiceTotalsSync: true, skipInvoiceBalanceSync: true },
    })

    createdRecords++
  }

  console.log(`[seed] Successfully created 20 unique Tax Codes and ${createdRecords} invoices to generate 20 summary rows.`)
  process.exit(0)
}

seedTaxSummaryRows().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
