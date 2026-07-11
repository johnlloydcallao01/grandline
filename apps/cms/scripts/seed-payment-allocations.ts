import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../src/accounting/constants/accounting'

async function seed() {
  const payload = await getPayload({ config })

  const adminUser = await payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } } as never,
    limit: 1,
    overrideAccess: true,
  })
  const adminId = adminUser.docs[0]?.id ?? 1

  const allExisting = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
    limit: 0,
    overrideAccess: true,
  })
  console.log(`Existing payment allocations: ${allExisting.totalDocs}`)

  const customersRes = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.customers,
    depth: 0, limit: 10,
    overrideAccess: true,
  })
  const customers = customersRes.docs as unknown as Array<Record<string, unknown>>

  let paymentsRes = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
    depth: 0, limit: 50,
    overrideAccess: true,
  })
  let paymentPool = [...paymentsRes.docs as unknown as Array<Record<string, unknown>>]

  if (paymentPool.length === 0 && customers.length > 0) {
    console.log('No payments found. Creating 5 seed payments...')
    for (let i = 0; i < 5; i++) {
      const customer = customers[i % customers.length]
      const created = await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
        overrideAccess: true,
        data: {
          receiptNumber: `RCT-SEED-PA-${String(i + 1).padStart(3, '0')}`,
          customer: customer.id,
          paymentDate: new Date().toISOString(),
          postingDate: new Date().toISOString(),
          paymentMethod: 'bank_transfer',
          amountReceived: 100000,
          currency: 'PHP',
          exchangeRate: 1,
          status: 'draft',
          createdBy: adminId,
          updatedBy: adminId,
        } as never,
      })
      paymentPool.push(created as unknown as Record<string, unknown>)
      console.log(`  Created payment RCT-SEED-PA-${String(i + 1).padStart(3, '0')}`)
    }
  }

  if (paymentPool.length === 0) {
    console.error('Cannot create payment allocations: no payments or customers exist.')
    process.exit(1)
  }

  const sampleRecords = [
    { amount: 35500, type: 'invoice_settlement', note: 'Full settlement of billing link final charge.' },
    { amount: 5000, type: 'invoice_settlement', note: 'Payment allocation for invoice settlement.' },
    { amount: 5000, type: 'installment_payment', note: 'First installment payment for enrollment.' },
    { amount: 2500, type: 'installment_payment', note: 'Second installment payment for enrollment.' },
    { amount: 10000, type: 'deposit_application', note: 'Deposit applied to training fees.' },
    { amount: 7500, type: 'invoice_settlement', note: 'Settlement of remaining balance.' },
    { amount: 3000, type: 'deposit_application', note: 'Advance deposit for upcoming enrollment.' },
    { amount: 2000, type: 'refund_reversal', note: 'Reversal of previously refunded amount.' },
    { amount: 1500, type: 'manual_adjustment', note: 'Manual adjustment to correct over-allocation.' },
    { amount: 12000, type: 'invoice_settlement', note: 'Final settlement for consolidated billing link.' },
  ]

  let created = 0
  let errors = 0
  for (let i = 0; i < sampleRecords.length; i++) {
    const rec = sampleRecords[i]
    const payment = paymentPool[i % paymentPool.length]

    try {
      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
        overrideAccess: true,
        data: {
          paymentReceived: payment.id,
          invoice: null,
          enrollmentBillingLink: null,
          allocationDate: new Date(Date.now() - i * 86400000).toISOString(),
          allocatedAmount: rec.amount,
          allocationType: rec.type,
          notes: rec.note,
          createdBy: adminId,
          updatedBy: adminId,
        } as never,
      })
      created++
      console.log(`[${created}/10] OK: ${rec.type} — ${rec.amount}`)
    } catch (err) {
      errors++
      console.log(`[${i + 1}/10] ERROR: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`\nDone. ${created} created, ${errors} errors.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
