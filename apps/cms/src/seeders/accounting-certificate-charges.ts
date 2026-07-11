import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const certificateCharges: Array<{
  reason: string | null
  amount: number
  appliedAt: string
  notes: string | null
}> = [
  { reason: 'Certificate fee for CERT-2026-0201', amount: 1500, appliedAt: '2026-06-10', notes: null },
  { reason: 'Certificate fee for CERT-2026-0215', amount: 1500, appliedAt: '2026-06-12', notes: 'Standard fee.' },
  { reason: 'Certificate fee for CERT-2026-0220', amount: 1800, appliedAt: '2026-06-14', notes: 'Expedited processing.' },
  { reason: 'Certificate fee for CERT-2026-0234', amount: 1500, appliedAt: '2026-06-17', notes: null },
  { reason: 'Certificate fee for CERT-2026-0241', amount: 2000, appliedAt: '2026-06-19', notes: 'Premium certificate — hard copy included.' },
  { reason: 'Certificate fee for CERT-2026-0250', amount: 1500, appliedAt: '2026-06-22', notes: null },
  { reason: 'Certificate fee for CERT-2026-0262', amount: 1800, appliedAt: '2026-06-24', notes: null },
  { reason: 'Certificate fee for CERT-2026-0278', amount: 1500, appliedAt: '2026-06-26', notes: 'Re-issue after name correction.' },
  { reason: 'Certificate fee for CERT-2026-0290', amount: 2200, appliedAt: '2026-06-28', notes: 'Multi-course certificate bundle.' },
  { reason: 'Certificate fee for CERT-2026-0305', amount: 1500, appliedAt: '2026-06-30', notes: null },
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

  for (let i = 0; i < certificateCharges.length; i++) {
    const sample = certificateCharges[i]
    const linkId = linkIds[i % linkIds.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      where: {
        and: [
          { enrollmentBillingLink: { equals: linkId } },
          { adjustmentType: { equals: 'certificate_fee' } },
          { amount: { equals: sample.amount } },
          { reason: { equals: sample.reason } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping [${i + 1}] PHP ${sample.amount} — already exists for link ${linkId}.`)
      skipped++
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      overrideAccess: true,
      data: {
        enrollmentBillingLink: linkId,
        adjustmentType: 'certificate_fee',
        reason: sample.reason,
        amount: sample.amount,
        direction: 'increase',
        appliedAt: sample.appliedAt,
        notes: sample.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created [${i + 1}] PHP ${sample.amount} — ${sample.reason} for link ${linkId}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
