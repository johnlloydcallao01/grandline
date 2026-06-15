import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function seedTaxUsage() {
  const payload = await getPayload({ config })
  console.log('[seed] Seeding Tax Usage Sample Records...')

  // 1. Get or create a Tax Code
  let taxCode = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
    limit: 1,
    overrideAccess: true,
  }).then(res => res.docs[0])

  if (!taxCode) {
    taxCode = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.taxCodes,
      data: {
        code: 'VAT12_SEED',
        name: 'Seed VAT 12%',
        scope: 'both',
        rate: 12,
        calculationMethod: 'exclusive',
        isActive: true,
      } as never,
      overrideAccess: true,
    })
  }
  const taxCodeId = taxCode.id

  // 2. Get or create an Account
  let account = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
    limit: 1,
    overrideAccess: true,
  }).then(res => res.docs[0])

  if (!account) {
    account = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      data: {
        accountCode: '4000-SEED',
        name: 'Seed Sales Account',
        accountType: 'revenue',
        subType: 'revenue',
        isActive: true,
      } as never,
      overrideAccess: true,
    })
  }
  const accountId = account.id

  // 2.5 Get or create a Customer and Vendor
  let customer = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.customers,
    limit: 1,
    overrideAccess: true,
  }).then(res => res.docs[0])

  if (!customer) {
    customer = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      data: {
        customerName: 'Seed Customer',
        customerType: 'company',
        status: 'active',
      } as never,
      overrideAccess: true,
    })
  }
  const customerId = customer.id

  let vendor = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
    limit: 1,
    overrideAccess: true,
  }).then(res => res.docs[0])

  if (!vendor) {
    vendor = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      data: {
        vendorName: 'Seed Vendor',
        vendorType: 'supplier',
        status: 'active',
      } as never,
      overrideAccess: true,
    })
  }
  const vendorId = vendor.id

  const timestamp = Date.now()
  let createdRecords = 0

  // 3. Create 5 Invoices and Invoice Line Items
  for (let i = 1; i <= 5; i++) {
    const invoice = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      data: {
        invoiceNumber: `INV-TAX-${timestamp}-00${i}`,
        customer: customerId,
        issueDate: '2026-06-14',
        dueDate: '2026-06-30',
        status: 'draft',
      } as never,
      overrideAccess: true,
    })

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      data: {
        invoice: invoice.id,
        itemType: 'service',
        description: `Tax Usage Seed Service ${i}`,
        quantity: 1,
        unitPrice: 1000 * i,
        lineSubtotal: 1000 * i,
        lineTax: (1000 * i) * 0.12,
        lineTotal: (1000 * i) * 1.12,
        taxCode: taxCodeId,
        incomeAccount: accountId,
      } as never,
      overrideAccess: true,
    })

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoice.id,
      data: { status: 'posted' } as never,
      overrideAccess: true,
      context: { skipInvoiceTotalsSync: true, skipInvoiceBalanceSync: true },
    })
    createdRecords++
  }

  // 4. Create 5 Bills and Bill Line Items
  for (let i = 1; i <= 5; i++) {
    const bill = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      data: {
        billNumber: `BILL-TAX-${timestamp}-00${i}`,
        vendor: vendorId,
        billDate: '2026-06-14',
        dueDate: '2026-06-30',
        status: 'draft',
      } as never,
      overrideAccess: true,
    })

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
      data: {
        bill: bill.id,
        description: `Tax Usage Seed Expense ${i}`,
        quantity: 1,
        unitPrice: 500 * i,
        lineSubtotal: 500 * i,
        lineTax: (500 * i) * 0.12,
        lineTotal: (500 * i) * 1.12,
        taxCode: taxCodeId,
        expenseAccount: accountId,
      } as never,
      overrideAccess: true,
    })

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: bill.id,
      data: { status: 'posted' } as never,
      overrideAccess: true,
      context: { skipBillTotalsSync: true, skipBillBalanceSync: true },
    })
    createdRecords++
  }

  // 5. Create 5 Expenses
  for (let i = 1; i <= 5; i++) {
    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      data: {
        expenseNumber: `EXP-TAX-${timestamp}-00${i}`,
        expenseDate: '2026-06-14',
        status: 'posted',
        paymentMethod: 'cash',
        subtotal: 200 * i,
        taxTotal: (200 * i) * 0.12,
        totalAmount: (200 * i) * 1.12,
        taxCode: taxCodeId,
        expenseAccount: accountId,
      } as never,
      overrideAccess: true,
    })
    createdRecords++
  }

  // 6. Create 5 Journal Entries and Journal Lines
  for (let i = 1; i <= 5; i++) {
    const journal = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      data: {
        entryNumber: `JE-TAX-${timestamp}-00${i}`,
        entryDate: '2026-06-14',
        postingDate: '2026-06-14',
        sourceType: 'manual',
        status: 'draft',
        memo: `Tax Usage Seed Journal ${i}`,
      } as never,
      overrideAccess: true,
    })

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      data: {
        journalEntry: journal.id,
        account: accountId,
        description: `Tax Usage Seed Line ${i} (Debit)`,
        debit: 300 * i,
        credit: 0,
        taxCode: taxCodeId,
      } as never,
      overrideAccess: true,
      context: { skipPostedImmutability: true },
    })

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      data: {
        journalEntry: journal.id,
        account: accountId,
        description: `Tax Usage Seed Line ${i} (Credit)`,
        debit: 0,
        credit: 300 * i,
        taxCode: taxCodeId,
      } as never,
      overrideAccess: true,
      context: { skipPostedImmutability: true },
    })

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      id: journal.id,
      data: { status: 'posted' } as never,
      overrideAccess: true,
      context: { skipJournalTotalsSync: true, skipPostedImmutability: true },
    })
    createdRecords++
  }

  console.log(`[seed] Successfully created ${createdRecords * 2} records (including line items).`)
  process.exit(0)
}

seedTaxUsage().catch((error) => {
  console.error('[seed] Fatal error:', error)
  process.exit(1)
})
