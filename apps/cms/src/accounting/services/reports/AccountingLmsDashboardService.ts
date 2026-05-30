import type { Payload } from 'payload'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { getRelationshipId } from '../../utils/accounting-audit'
import { getCompletionToRevenue } from '../../queries/getCompletionToRevenue'
import { getCorporateReceivables } from '../../queries/getCorporateReceivables'
import { getCouponRevenueImpact } from '../../queries/getCouponRevenueImpact'
import { getScholarshipUtilization } from '../../queries/getScholarshipUtilization'
import { getCertificateRevenue } from '../../queries/getCertificateRevenue'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'

export class AccountingLmsDashboardService {
  static async getDashboard(payload: Payload) {
    const [links, enrollments, couponImpact, scholarshipUtilization, corporateReceivables, completionToRevenue, certificateRevenue] =
      await Promise.all([
        findAllDocs<any>({
          payload,
          collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
          depth: 2,
        }),
        findAllDocs<any>({
          payload,
          collection: 'course-enrollments',
          depth: 1,
        }),
        getCouponRevenueImpact(payload),
        getScholarshipUtilization(payload),
        getCorporateReceivables(payload),
        getCompletionToRevenue(payload),
        getCertificateRevenue(payload),
      ])

    const revenueByCourse = new Map<string, { courseId: string; courseTitle: string; amount: number }>()
    const revenueByInstructor = new Map<string, { instructorId: string; instructorName: string; amount: number }>()
    const revenueByEnrollmentType = new Map<string, number>()

    for (const link of links) {
      const courseId = String(getRelationshipId(link.course) || link.id)
      const courseTitle = (typeof link.course === 'object' ? link.course?.title : null) || 'Unknown Course'
      const courseRevenue = revenueByCourse.get(courseId) || { courseId, courseTitle, amount: 0 }
      courseRevenue.amount = roundCurrency(courseRevenue.amount + normalizeAmount(link.finalChargeSnapshot))
      revenueByCourse.set(courseId, courseRevenue)

      const instructorId =
        String(
          getRelationshipId(
            typeof link.course === 'object' ? link.course?.instructor : null,
          ) || 'unknown',
        )
      const instructorName = `Instructor ${instructorId}`
      const instructorRevenue = revenueByInstructor.get(instructorId) || { instructorId, instructorName, amount: 0 }
      instructorRevenue.amount = roundCurrency(
        instructorRevenue.amount + normalizeAmount(link.finalChargeSnapshot),
      )
      revenueByInstructor.set(instructorId, instructorRevenue)

      const enrollmentType = String((typeof link.enrollment === 'object' ? link.enrollment?.enrollmentType : null) || 'unknown')
      revenueByEnrollmentType.set(
        enrollmentType,
        roundCurrency(
          normalizeAmount(revenueByEnrollmentType.get(enrollmentType)) +
            normalizeAmount(link.finalChargeSnapshot),
        ),
      )
    }

    const paidEnrollments = enrollments.filter((row) => normalizeAmount(row.amountPaid) > 0).length
    const freeEnrollments = enrollments.filter((row) => String(row.enrollmentType || '') === 'free').length
    const pendingEnrollmentRequests = enrollments.filter((row) => row.status === 'pending').length
    const estimatedPendingBillings = roundCurrency(
      enrollments
        .filter((row) => row.status === 'pending')
        .reduce((total, row) => total + normalizeAmount(row.finalPriceSnapshot), 0),
    )

    return {
      summary: {
        enrollmentBillingLinks: links.length,
        paidEnrollments,
        freeEnrollments,
        pendingEnrollmentRequests,
        estimatedPendingBillings,
        corporateReceivableBalance: roundCurrency(
          corporateReceivables.reduce((total, row) => total + normalizeAmount(row.balanceDue), 0),
        ),
        scholarshipAwardedAmount: roundCurrency(
          scholarshipUtilization.reduce((total, row) => total + normalizeAmount(row.awardedAmount), 0),
        ),
      },
      revenueByCourse: Array.from(revenueByCourse.values()).sort((left, right) => right.amount - left.amount),
      revenueByInstructor: Array.from(revenueByInstructor.values()).sort((left, right) => right.amount - left.amount),
      revenueByEnrollmentType: Array.from(revenueByEnrollmentType.entries()).map(([enrollmentType, amount]) => ({
        enrollmentType,
        amount,
      })),
      couponImpact,
      scholarshipUtilization,
      corporateReceivables,
      traineeCollections: links
        .map((link) => ({
          enrollmentId: getRelationshipId(link.enrollment) || link.id,
          traineeId: getRelationshipId(link.trainee),
          customerId: getRelationshipId(link.customer),
          amountDue: Math.max(0, normalizeAmount(link.finalChargeSnapshot) - normalizeAmount(link.recognizedRevenueSnapshot)),
        }))
        .sort((left, right) => right.amountDue - left.amountDue)
        .slice(0, 20),
      completionToRevenue,
      certificateRevenue,
    }
  }
}
