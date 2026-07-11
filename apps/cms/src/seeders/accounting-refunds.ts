import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const sampleRefunds: Array<{
  refundType: 'full' | 'partial' | 'credit_only'
  requestedAmount: number
  approvedAmount: number | null
  refundDate: string
  refundReason: string | null
  status: 'draft' | 'requested' | 'approved' | 'processed' | 'rejected' | 'voided'
  notes: string | null
}> = [
  { refundType: 'partial', requestedAmount: 1500, approvedAmount: 1500, refundDate: '2026-05-10', refundReason: 'Overcharge on certificate fee — duplicate billing', status: 'processed', notes: null },
  { refundType: 'full', requestedAmount: 6000, approvedAmount: 5500, refundDate: '2026-05-15', refundReason: 'Student withdrew from course within cooling-off period', status: 'approved', notes: 'Approved at 90% per refund policy.' },
  { refundType: 'partial', requestedAmount: 3200, approvedAmount: 3200, refundDate: '2026-05-20', refundReason: 'Course fee adjustment after promo discount correction', status: 'processed', notes: null },
  { refundType: 'partial', requestedAmount: 2400, approvedAmount: null, refundDate: '2026-05-22', refundReason: 'Disputed charge — pending manager review', status: 'requested', notes: 'Awaiting supporting documents.' },
  { refundType: 'credit_only', requestedAmount: 1800, approvedAmount: 1800, refundDate: '2026-05-25', refundReason: 'Certificate fee refund — certificate not yet issued', status: 'processed', notes: 'Converted to credit note.' },
  { refundType: 'partial', requestedAmount: 4200, approvedAmount: null, refundDate: '2026-06-01', refundReason: 'Enrollment transfer to different course batch', status: 'draft', notes: null },
  { refundType: 'full', requestedAmount: 8500, approvedAmount: 0, refundDate: '2026-06-03', refundReason: 'Refund request rejected — outside policy window', status: 'rejected', notes: 'Rejected per LMS refund policy section 4.2.' },
  { refundType: 'partial', requestedAmount: 1100, approvedAmount: 1100, refundDate: '2026-06-05', refundReason: 'Manual discount correction after invoicing', status: 'processed', notes: null },
  { refundType: 'credit_only', requestedAmount: 2800, approvedAmount: 2800, refundDate: '2026-06-08', refundReason: 'Course material fee refund — materials not delivered', status: 'approved', notes: 'Credit note to be issued upon approval.' },
  { refundType: 'partial', requestedAmount: 5000, approvedAmount: null, refundDate: '2026-06-10', refundReason: 'Multiple overcharges on linked enrollments', status: 'draft', notes: 'Needs manager sign-off.' },
]

async function seed() {
  const payload = await getPayload({ config })

  const adminUser = await payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } } as never,
    limit: 1,
    overrideAccess: true,
  })
  const adminId = adminUser.docs[0]?.id ?? null

  const billingLinks = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
    limit: 200,
    sort: '-linkedAt',
    overrideAccess: true,
  })

  if (billingLinks.docs.length === 0) {
    console.error('No enrollment billing links found. Seed enrollment-billing-links first.')
    process.exit(1)
  }

  const invoices = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
    limit: 200,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const linkIds = billingLinks.docs.map((d: { id: number | string }) => d.id)
  const invoiceIds = invoices.docs.length > 0
    ? invoices.docs.map((d: { id: number | string }) => d.id)
    : []

  let created = 0
  let skipped = 0

  for (let i = 0; i < sampleRefunds.length; i++) {
    const sample = sampleRefunds[i]
    const linkId = linkIds[i % linkIds.length]
    const invoiceId = invoiceIds.length > 0 ? invoiceIds[i % invoiceIds.length] : undefined

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      where: {
        and: [
          { enrollmentBillingLink: { equals: linkId } },
          { refundType: { equals: sample.refundType } },
          { requestedAmount: { equals: sample.requestedAmount } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping [${i + 1}] ${sample.refundType} — PHP ${sample.requestedAmount} — already exists for link ${linkId}.`)
      skipped++
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      overrideAccess: true,
      data: {
        enrollmentBillingLink: linkId,
        invoice: invoiceId,
        refundDate: sample.refundDate,
        refundReason: sample.refundReason,
        refundType: sample.refundType,
        requestedAmount: sample.requestedAmount,
        approvedAmount: sample.approvedAmount,
        currency: 'PHP',
        status: sample.status,
        notes: sample.notes,
        processedBy: sample.status === 'processed' || sample.status === 'approved' ? adminId : undefined,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created [${i + 1}] ${sample.refundType} — PHP ${sample.requestedAmount} (${sample.status}) for link ${linkId}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
