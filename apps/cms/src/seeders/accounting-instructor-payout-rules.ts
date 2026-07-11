import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function seedInstructorPayoutRules() {
  console.log('[seed:instructor-payout-rules] Connecting to Payload...')
  const payload = await getPayload({ config })

  const instructors = await payload.find({
    collection: 'instructors',
    depth: 2,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })
  if (!instructors.docs.length) {
    console.error('[seed:instructor-payout-rules] No instructors found. Seed instructors first.')
    process.exit(1)
  }
  console.log(`[seed:instructor-payout-rules] Found ${instructors.docs.length} instructors`)

  const courses = await payload.find({
    collection: 'courses',
    depth: 0,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })
  if (!courses.docs.length) {
    console.error('[seed:instructor-payout-rules] No courses found. Seed courses first.')
    process.exit(1)
  }
  console.log(`[seed:instructor-payout-rules] Found ${courses.docs.length} courses`)

  const samples = [
    { payoutMethod: 'flat', flatAmount: 18000, percentOfRevenue: 0, perEnrollmentAmount: 0, completionBonusAmount: 0, status: 'active' },
    { payoutMethod: 'revenue_share', flatAmount: 0, percentOfRevenue: 18, perEnrollmentAmount: 0, completionBonusAmount: 0, status: 'active' },
    { payoutMethod: 'hybrid', flatAmount: 8000, percentOfRevenue: 10, perEnrollmentAmount: 0, completionBonusAmount: 1500, status: 'active' },
    { payoutMethod: 'per_enrollment', flatAmount: 0, percentOfRevenue: 0, perEnrollmentAmount: 3500, completionBonusAmount: 0, status: 'inactive' },
    { payoutMethod: 'flat', flatAmount: 25000, percentOfRevenue: 0, perEnrollmentAmount: 0, completionBonusAmount: 0, status: 'active' },
    { payoutMethod: 'revenue_share', flatAmount: 0, percentOfRevenue: 12, perEnrollmentAmount: 0, completionBonusAmount: 0, status: 'active' },
    { payoutMethod: 'hybrid', flatAmount: 5000, percentOfRevenue: 15, perEnrollmentAmount: 0, completionBonusAmount: 2000, status: 'active' },
    { payoutMethod: 'per_enrollment', flatAmount: 0, percentOfRevenue: 0, perEnrollmentAmount: 5000, completionBonusAmount: 0, status: 'active' },
    { payoutMethod: 'flat', flatAmount: 12000, percentOfRevenue: 0, perEnrollmentAmount: 0, completionBonusAmount: 0, status: 'inactive' },
    { payoutMethod: 'revenue_share', flatAmount: 0, percentOfRevenue: 25, perEnrollmentAmount: 0, completionBonusAmount: 0, status: 'archived' },
  ]

  let created = 0

  for (let i = 0; i < samples.length; i++) {
    const instructor = instructors.docs[i % instructors.docs.length] as unknown as Record<string, unknown>
    const course = courses.docs[i % courses.docs.length] as unknown as Record<string, unknown>
    const user = instructor.user as Record<string, unknown> | undefined
    const firstName = String(user?.firstName || '').trim()
    const lastName = String(user?.lastName || '').trim()
    const nameHint = firstName || lastName ? `${firstName} ${lastName}`.trim() : String(user?.email || instructor.id)

    const sourceRef = `SEED-RULE-${String(i + 1).padStart(3, '0')}`

    const existing = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      where: {
        notes: { equals: `[${sourceRef}]` },
      },
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      console.log(`[seed:instructor-payout-rules] Skipping ${sourceRef} (already exists)`)
      continue
    }

    await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      overrideAccess: true,
      data: {
        instructor: instructor.id,
        course: course.id,
        payoutMethod: samples[i].payoutMethod,
        flatAmount: samples[i].flatAmount,
        percentOfRevenue: samples[i].percentOfRevenue,
        perEnrollmentAmount: samples[i].perEnrollmentAmount,
        completionBonusAmount: samples[i].completionBonusAmount,
        status: samples[i].status,
        notes: `[${sourceRef}] Sample rule for ${nameHint} via ${String(course.title || course.courseCode || `Course #${course.id}`)}.`,
      } as never,
    })

    console.log(`[seed:instructor-payout-rules] Created ${sourceRef} (${samples[i].payoutMethod}, ${samples[i].status}) for ${nameHint}`)
    created++
  }

  console.log(`[seed:instructor-payout-rules] Done. Created: ${created}`)
  process.exit(0)
}

seedInstructorPayoutRules().catch((error) => {
  console.error('[seed:instructor-payout-rules] Fatal error:', error)
  process.exit(1)
})
