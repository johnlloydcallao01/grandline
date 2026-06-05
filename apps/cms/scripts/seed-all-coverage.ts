import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sql } from 'drizzle-orm'

const COA_SLUG = 'accounting-chart-of-accounts' as const
const BILLING_LINKS_SLUG = 'accounting-enrollment-billing-links' as const

async function seed() {
  const payload = await getPayload({ config: configPromise })
  const db = payload.db.drizzle

  // ── Fetch reference data ──
  const [enrollments, users, allAwards, allCorpLinks, trainees, courses, customers, sponsors, corpAccounts] =
    await Promise.all([
      payload.find({ collection: 'course-enrollments', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'users', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'accounting-scholarship-awards', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'accounting-corporate-billing-links', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'trainees', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'courses', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'accounting-customers', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'accounting-scholarship-sponsors', limit: 200, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'accounting-corporate-accounts', limit: 200, depth: 0, overrideAccess: true }),
    ])

  const enrollmentIds = enrollments.docs.map((d: any) => d.id as number)
  const userIds = users.docs.map((d: any) => d.id as number)
  const traineeIds = trainees.docs.map((d: any) => d.id as number)
  const courseIds = courses.docs.map((d: any) => d.id as number)
  const customerIds = customers.docs.map((d: any) => d.id as number)
  const sponsorIds = sponsors.docs.map((d: any) => d.id as number)
  const corpAccountIds = corpAccounts.docs.map((d: any) => d.id as number)
  const adminId = userIds[0] ?? 1

  if (!enrollmentIds.length) { console.error('No enrollments found.'); process.exit(1) }

  // ── Ensure revenue account ──
  const existingCoa = await payload.find({ collection: COA_SLUG, where: { accountType: { equals: 'revenue' } } as never, limit: 1, depth: 0, overrideAccess: true })
  if (existingCoa.totalDocs === 0) {
    await payload.create({ collection: COA_SLUG, overrideAccess: true, data: { code: 'REV-001', name: 'Enrollment Tuition Revenue', accountType: 'revenue', normalBalance: 'credit', isActive: true, createdBy: adminId, updatedBy: adminId } as never })
    console.log('Created revenue account REV-001.')
  }

  // ── Get existing billing links ──
  const existingLinks = await payload.find({ collection: BILLING_LINKS_SLUG, limit: 200, depth: 0, overrideAccess: true })
  const usedEnrollments = new Set(
    existingLinks.docs.map((d: any) =>
      typeof d.enrollment === 'object' ? d.enrollment?.id : d.enrollment
    ).filter(Boolean)
  )
  const freeEnrollments = enrollmentIds.filter((id: number) => !usedEnrollments.has(id))
  const allBillingIds: number[] = existingLinks.docs.map((d: any) => d.id as number)

  // ── Create billing links for free enrollments ──
  for (let i = 0; i < freeEnrollments.length; i++) {
    const ref = `ENR-2026-${String(allBillingIds.length + i + 1).padStart(3, '0')}`
    const record = await payload.create({
      collection: BILLING_LINKS_SLUG,
      overrideAccess: true,
      data: {
        enrollment: freeEnrollments[i],
        course: courseIds[i % courseIds.length],
        trainee: traineeIds[i % traineeIds.length],
        user: userIds[i % userIds.length],
        customer: customerIds[i % customerIds.length],
        sourceType: 'enrollment',
        sourceReference: ref,
        billingStatus: 'not_started',
        finalChargeSnapshot: 0,
        currency: 'PHP',
        createdBy: adminId,
        updatedBy: adminId,
      } as never,
    })
    allBillingIds.push(record.id as number)
    console.log(`Created billing link ${ref} (id: ${record.id})`)
  }

  console.log(`Billing links: ${freeEnrollments.length} created, ${allBillingIds.length} total.`)

  // ── Zero out finalCharge on all billing links ──
  for (const bid of allBillingIds) {
    await db.execute(sql`UPDATE acct_enrollment_billing_links SET final_charge_snapshot = 0, sale_price_snapshot = 0, list_price_snapshot = 0 WHERE id = ${bid}`)
  }
  console.log(`Zeroed ${allBillingIds.length} billing links.`)

  // ── Step 2: Create awards (raw SQL to bypass hooks) ──
  const awardTypes = ['full', 'partial', 'partial', 'contra_revenue', 'third_party_billed']
  const statuses = ['active', 'active', 'active', 'active', 'inactive']
  let createdAwards = 0
  let skippedAwards = 0

  for (let i = 0; i < 20; i++) {
    const sponsorId = sponsorIds[i % sponsorIds.length]
    const traineeId = traineeIds[i % traineeIds.length]
    const billingId = allBillingIds[i % allBillingIds.length]
    const awardType = awardTypes[i % awardTypes.length]
    const status = statuses[i % statuses.length]

    const existing = allAwards.docs.find((a: any) => {
      const sId = typeof a.scholarshipSponsor === 'object' ? (a.scholarshipSponsor as any).id : a.scholarshipSponsor
      const bId = typeof a.enrollmentBillingLink === 'object' ? (a.enrollmentBillingLink as any).id : a.enrollmentBillingLink
      return sId === sponsorId && bId === billingId
    })

    if (existing) { skippedAwards++; continue }

    const awardAmount = [15000, 20000, 25000, 0, 10000][i % 5]
    const awardPercent = awardAmount > 0 ? null : [50, 75, 100][i % 3]
    const now = new Date().toISOString()

    await db.execute(sql`
      INSERT INTO acct_scholarship_awards 
        (enrollment_billing_link_id, scholarship_sponsor_id, trainee_id, award_type, award_amount, award_percent, trainee_share_amount, effective_date, status, notes, created_by_id, updated_by_id, created_at, updated_at)
      VALUES 
        (${billingId}, ${sponsorId}, ${traineeId}, ${awardType}, ${awardAmount}, ${awardPercent}, ${awardAmount ? Math.round(awardAmount * 0.2) : 0}, ${now}, ${status}, ${'Seed award ' + (i + 1)}, ${adminId}, ${adminId}, ${now}, ${now})
    `)
    createdAwards++
  }
  console.log(`Awards: ${createdAwards} created, ${skippedAwards} skipped.`)

  // ── Step 3: Create corporate billing links (raw SQL) ──
  const coverageTypes = ['full_company_pay', 'shared_pay', 'credit_terms']
  let createdCorp = 0
  let skippedCorp = 0

  for (let i = 0; i < 20; i++) {
    const acctId = corpAccountIds[i % corpAccountIds.length]
    const billingId = allBillingIds[i % allBillingIds.length]
    const coverageType = coverageTypes[i % coverageTypes.length]
    const status = statuses[i % statuses.length]

    const existing = allCorpLinks.docs.find((a: any) => {
      const aId = typeof a.corporateAccount === 'object' ? (a.corporateAccount as any).id : a.corporateAccount
      const bId = typeof a.enrollmentBillingLink === 'object' ? (a.enrollmentBillingLink as any).id : a.enrollmentBillingLink
      return aId === acctId && bId === billingId
    })

    if (existing) { skippedCorp++; continue }

    const coveredAmount = [30000, 25000, 0, 40000, 35000][i % 5]
    const traineeShare = coveredAmount > 0 ? Math.round(coveredAmount * 0.15) : 0
    const now = new Date().toISOString()

    await db.execute(sql`
      INSERT INTO acct_corporate_billing_links 
        (corporate_account_id, enrollment_billing_link_id, coverage_type, covered_amount, trainee_share_amount, status, notes, created_by_id, updated_by_id, created_at, updated_at)
      VALUES 
        (${acctId}, ${billingId}, ${coverageType}, ${coveredAmount}, ${traineeShare}, ${status}, ${'Seed corp link ' + (i + 1)}, ${adminId}, ${adminId}, ${now}, ${now})
    `)
    createdCorp++
  }
  console.log(`Corp billing links: ${createdCorp} created, ${skippedCorp} skipped.`)
  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
