import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

export class AccountingInstructorCostService {
  static async calculatePayout({
    payload,
    courseId,
    periodStart,
    periodEnd,
  }: {
    payload: Payload
    courseId: number | string
    periodStart: string
    periodEnd: string
  }) {
    const rules = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      where: {
        and: [
          { course: { equals: courseId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const rule = rules.docs[0]
    if (!rule) {
      throw new APIError('Instructor payout rule not found for this course.', 404)
    }

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { course: { equals: courseId } },
          { enrolledAt: { greater_than_equal: periodStart } },
          { enrolledAt: { less_than_equal: periodEnd } },
        ],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })

    const billingLinks = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      where: {
        course: {
          equals: courseId,
        },
      },
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })

    const totalRevenue = billingLinks.docs.reduce(
      (total, link) => total + normalizeAmount(link.finalChargeSnapshot),
      0,
    )
    const completionCount = enrollments.docs.filter((enrollment) => enrollment.status === 'completed').length

    let calculatedAmount = 0
    switch (String(rule.payoutMethod || 'flat')) {
      case 'revenue_share':
        calculatedAmount = totalRevenue * (normalizeAmount(rule.percentOfRevenue) / 100)
        break
      case 'per_enrollment':
        calculatedAmount = normalizeAmount(rule.perEnrollmentAmount) * enrollments.docs.length
        break
      case 'hybrid':
        calculatedAmount =
          normalizeAmount(rule.flatAmount) +
          totalRevenue * (normalizeAmount(rule.percentOfRevenue) / 100) +
          normalizeAmount(rule.perEnrollmentAmount) * enrollments.docs.length +
          normalizeAmount(rule.completionBonusAmount) * completionCount
        break
      default:
        calculatedAmount = normalizeAmount(rule.flatAmount)
        break
    }

    return roundCurrency(calculatedAmount)
  }

  static async generatePayout({
    payload,
    courseId,
    periodStart,
    periodEnd,
  }: {
    payload: Payload
    courseId: number | string
    periodStart: string
    periodEnd: string
  }) {
    const rules = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayoutRules,
      where: {
        and: [
          { course: { equals: courseId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const rule = rules.docs[0]
    if (!rule) {
      throw new APIError('Instructor payout rule not found for this course.', 404)
    }

    const calculatedAmount = await this.calculatePayout({
      payload,
      courseId,
      periodStart,
      periodEnd,
    })

    const normalizedCourseId =
      typeof courseId === 'number' ? courseId : courseId ? Number(courseId) : undefined

    if (!normalizedCourseId) {
      throw new APIError('Course id is required to generate an instructor payout.', 400)
    }

    const payoutData: RequiredDataFromCollectionSlug<'accounting-instructor-payouts'> = {
      instructor: rule.instructor,
      course: normalizedCourseId,
      periodStart,
      periodEnd,
      sourceType: 'course_activity',
      sourceReference: `COURSE-${courseId}-${periodStart}-${periodEnd}`,
      calculatedAmount,
      approvedAmount: calculatedAmount,
      status: 'calculated' as const,
      notes: `Generated from ${String(rule.payoutMethod || 'flat')} payout rule.`,
    }

    return payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.instructorPayouts,
      overrideAccess: true,
      depth: 1,
      data: payoutData,
    })
  }
}
