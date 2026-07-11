import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

const sampleSchedules: Array<{
  recognitionMethod: 'on_activation' | 'straight_line' | 'completion_based' | 'certificate_based'
  status: 'draft' | 'scheduled' | 'partially_recognized' | 'recognized' | 'cancelled'
  startDate: string
  endDate: string
  totalDeferredAmount: number
  recognizedAmount: number
  remainingDeferredAmount: number
  lastRecognitionAt: string | null
  notes: string | null
}> = [
  { recognitionMethod: 'straight_line', status: 'partially_recognized', startDate: '2026-04-01', endDate: '2026-09-30', totalDeferredAmount: 24000, recognizedAmount: 12000, remainingDeferredAmount: 12000, lastRecognitionAt: '2026-06-30', notes: '6-month straight-line recognition for Q2 enrollment.' },
  { recognitionMethod: 'on_activation', status: 'recognized', startDate: '2026-04-15', endDate: '2026-04-15', totalDeferredAmount: 5500, recognizedAmount: 5500, remainingDeferredAmount: 0, lastRecognitionAt: '2026-04-15', notes: null },
  { recognitionMethod: 'completion_based', status: 'partially_recognized', startDate: '2026-05-01', endDate: '2026-07-31', totalDeferredAmount: 18000, recognizedAmount: 6000, remainingDeferredAmount: 12000, lastRecognitionAt: '2026-05-31', notes: 'Milestone-based — 3 modules, 1 recognized.' },
  { recognitionMethod: 'straight_line', status: 'scheduled', startDate: '2026-06-01', endDate: '2026-11-30', totalDeferredAmount: 32000, recognizedAmount: 0, remainingDeferredAmount: 32000, lastRecognitionAt: null, notes: null },
  { recognitionMethod: 'certificate_based', status: 'partially_recognized', startDate: '2026-05-15', endDate: '2026-08-15', totalDeferredAmount: 9600, recognizedAmount: 3200, remainingDeferredAmount: 6400, lastRecognitionAt: '2026-06-15', notes: 'Recognition upon certificate issuance milestones.' },
  { recognitionMethod: 'straight_line', status: 'recognized', startDate: '2026-03-01', endDate: '2026-05-31', totalDeferredAmount: 15000, recognizedAmount: 15000, remainingDeferredAmount: 0, lastRecognitionAt: '2026-05-31', notes: 'Fully recognized 3-month schedule.' },
  { recognitionMethod: 'completion_based', status: 'partially_recognized', startDate: '2026-05-01', endDate: '2026-08-31', totalDeferredAmount: 22000, recognizedAmount: 5500, remainingDeferredAmount: 16500, lastRecognitionAt: '2026-06-01', notes: null },
  { recognitionMethod: 'on_activation', status: 'cancelled', startDate: '2026-05-01', endDate: '2026-05-01', totalDeferredAmount: 7800, recognizedAmount: 0, remainingDeferredAmount: 0, lastRecognitionAt: null, notes: 'Cancelled — enrollment was voided.' },
  { recognitionMethod: 'straight_line', status: 'partially_recognized', startDate: '2026-06-01', endDate: '2026-08-31', totalDeferredAmount: 13500, recognizedAmount: 4500, remainingDeferredAmount: 9000, lastRecognitionAt: '2026-06-30', notes: '3-month recognition for Q3 enrollment.' },
  { recognitionMethod: 'certificate_based', status: 'scheduled', startDate: '2026-07-01', endDate: '2026-10-01', totalDeferredAmount: 11000, recognizedAmount: 0, remainingDeferredAmount: 11000, lastRecognitionAt: null, notes: 'Pending activation once certificate is issued.' },
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

  if (invoiceIds.length === 0) {
    console.error('No invoices found. Seed invoices first.')
    process.exit(1)
  }

  let created = 0
  let skipped = 0

  for (let i = 0; i < sampleSchedules.length; i++) {
    const sample = sampleSchedules[i]
    const linkId = linkIds[i % linkIds.length]
    const invoiceId = invoiceIds[i % invoiceIds.length]

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      where: {
        and: [
          { enrollmentBillingLink: { equals: linkId } },
          { totalDeferredAmount: { equals: sample.totalDeferredAmount } },
          { recognitionMethod: { equals: sample.recognitionMethod } },
        ],
      } as never,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping [${i + 1}] ${sample.recognitionMethod} — PHP ${sample.totalDeferredAmount} — already exists for link ${linkId}.`)
      skipped++
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
      overrideAccess: true,
      data: {
        invoice: invoiceId,
        enrollmentBillingLink: linkId,
        recognitionMethod: sample.recognitionMethod,
        startDate: sample.startDate,
        endDate: sample.endDate,
        totalDeferredAmount: sample.totalDeferredAmount,
        recognizedAmount: sample.recognizedAmount,
        remainingDeferredAmount: sample.remainingDeferredAmount,
        status: sample.status,
        lastRecognitionAt: sample.lastRecognitionAt,
        notes: sample.notes,
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })

    console.log(`Created [${i + 1}] ${sample.recognitionMethod} — PHP ${sample.totalDeferredAmount} (${sample.status}) for link ${linkId}`)
    created++
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
