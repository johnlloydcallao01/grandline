import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { ACCOUNTING_COLLECTION_SLUGS } from '../accounting/constants/accounting'

async function seedInstructorPayouts() {
  console.log('[seed:instructor-payouts] Connecting to Payload...')
  const payload = await getPayload({ config })

  const instructors = await payload.find({
    collection: 'instructors',
    depth: 2,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })
  if (!instructors.docs.length) {
    console.error('[seed:instructor-payouts] No instructors found. Seed instructors first.')
    process.exit(1)
  }
  console.log(`[seed:instructor-payouts] Found ${instructors.docs.length} instructors`)

  const courses = await payload.find({
    collection: 'courses',
    depth: 0,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })
  if (!courses.docs.length) {
    console.error('[seed:instructor-payouts] No courses found. Seed courses first.')
    process.exit(1)
  }
  console.log(`[seed:instructor-payouts] Found ${courses.docs.length} courses`)

  const payoutsByStatus: Array<{ status: string; count: number }> = [
    { status: 'draft', count: 3 },
    { status: 'calculated', count: 2 },
    { status: 'approved', count: 3 },
    { status: 'paid', count: 2 },
  ]

  let created = 0

  for (const { status, count } of payoutsByStatus) {
    for (let i = 0; i < count; i++) {
      const instructor = instructors.docs[(created + i) % instructors.docs.length] as unknown as Record<string, unknown>
      const course = courses.docs[(created + i) % courses.docs.length] as unknown as Record<string, unknown>
      const user = instructor.user as Record<string, unknown> | undefined
      const firstName = String(user?.firstName || '').trim()
      const lastName = String(user?.lastName || '').trim()
      const nameHint = firstName || lastName ? `${firstName} ${lastName}`.trim() : String(user?.email || instructor.id)
      const month = 6 + Math.floor((created + i) / 4)
      const day = 1 + ((created + i) * 7) % 28
      const periodStart = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const periodEnd = `2026-${String(month).padStart(2, '0')}-${String(Math.min(28, day + 14)).padStart(2, '0')}`
      const calcAmount = 10000 + (created + i) * 2500
      const approvedAmount = status === 'approved' || status === 'paid' ? calcAmount : undefined

      const existing = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
        where: {
          sourceReference: { equals: `SEED-PAYOUT-${String(created + i + 1).padStart(3, '0')}` },
        },
        overrideAccess: true,
      })

      if (existing.docs.length > 0) {
        console.log(`[seed:instructor-payouts] Skipping SEED-PAYOUT-${String(created + i + 1).padStart(3, '0')} (already exists as ${String((existing.docs[0] as unknown as Record<string, unknown>).status || 'unknown')})`)
        continue
      }

      await payload.create({
        collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
        overrideAccess: true,
        data: {
          instructor: instructor.id,
          course: course.id,
          periodStart,
          periodEnd,
          sourceType: 'course_activity',
          sourceReference: `SEED-PAYOUT-${String(created + i + 1).padStart(3, '0')}`,
          calculatedAmount: calcAmount,
          approvedAmount,
          status,
          notes: `[seed:instructor-payout-${String(created + i + 1).padStart(3, '0')}] Sample payout for ${nameHint} via ${String(course.title || course.courseCode || `Course #${course.id}`)}.`,
        } as never,
      })

      console.log(`[seed:instructor-payouts] Created SEED-PAYOUT-${String(created + i + 1).padStart(3, '0')} (${status}) for instructor ${nameHint}`)
    }
    created += count
  }

  console.log(`[seed:instructor-payouts] Done. Created: ${created}`)
  process.exit(0)
}

seedInstructorPayouts().catch((error) => {
  console.error('[seed:instructor-payouts] Fatal error:', error)
  process.exit(1)
})
