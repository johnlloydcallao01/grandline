import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const sampleAdjustments: Array<{
  adjustmentType: string
  reason: string | null
  amount: number
  direction: 'increase' | 'decrease'
  appliedAt: string
  notes: string | null
}> = [
  { adjustmentType: 'certificate_fee', reason: 'Certificate fee for CERT-2026-0118', amount: 1500, direction: 'increase', appliedAt: '2026-05-08', notes: 'Standard certificate monetization charge.' },
  { adjustmentType: 'manual_discount', reason: 'Early bird discount per enrollment promo', amount: 2000, direction: 'decrease', appliedAt: '2026-05-19', notes: null },
  { adjustmentType: 'late_fee', reason: 'Late payment assessment — overdue 15 days', amount: 350, direction: 'increase', appliedAt: '2026-05-21', notes: 'Applied per LMS late-fee policy.' },
  { adjustmentType: 'manual_surcharge', reason: 'Course material upgrade surcharge', amount: 1250, direction: 'increase', appliedAt: '2026-05-28', notes: null },
  { adjustmentType: 'certificate_fee', reason: 'Certificate fee for CERT-2026-0135', amount: 1500, direction: 'increase', appliedAt: '2026-05-21', notes: null },
  { adjustmentType: 'retake_fee', reason: 'Retake assessment fee — 2nd attempt', amount: 800, direction: 'increase', appliedAt: '2026-06-02', notes: 'Retake fee per LMS policy.' },
  { adjustmentType: 'reassessment_fee', reason: 'Competency reassessment for expired modules', amount: 1200, direction: 'increase', appliedAt: '2026-06-05', notes: null },
  { adjustmentType: 'renewal_fee', reason: 'Annual certificate renewal fee', amount: 1000, direction: 'increase', appliedAt: '2026-06-08', notes: 'Renewal for expiring certifications.' },
  { adjustmentType: 'manual_discount', reason: 'Loyalty discount — 3rd enrollment', amount: 1500, direction: 'decrease', appliedAt: '2026-06-10', notes: null },
  { adjustmentType: 'certificate_fee', reason: 'Certificate fee for CERT-2026-0151', amount: 1800, direction: 'increase', appliedAt: '2026-05-30', notes: 'Premium certificate with expedited processing.' },
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

  const linkIds = billingLinks.docs.map((d: { id: number | string }) => d.id)

  let created = 0
  let skipped = 0

  for (let i = 0; i < sampleAdjustments.length; i++) {
    const sample = sampleAdjustments[i]
    const linkId = linkIds[i % linkIds.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      where: {
        and: [
          { enrollmentBillingLink: { equals: linkId } },
          { adjustmentType: { equals: sample.adjustmentType } },
          { amount: { equals: sample.amount } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping [${i + 1}] ${sample.adjustmentType} — PHP ${sample.amount} — already exists for link ${linkId}.`)
      skipped++
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      overrideAccess: true,
      data: {
        enrollmentBillingLink: linkId,
        adjustmentType: sample.adjustmentType,
        reason: sample.reason,
        amount: sample.amount,
        direction: sample.direction,
        appliedAt: sample.appliedAt,
        notes: sample.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created [${i + 1}] ${sample.adjustmentType} — PHP ${sample.amount} (${sample.direction}) for link ${linkId}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
