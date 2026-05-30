import type { Payload } from 'payload'
import type { AccountingCompletionRevenueRow } from '../types/accounting'
import { ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import { findAllDocs } from '../utils/findAllDocs'
import { normalizeAmount } from '../utils/amounts'
import { getRelationshipId } from '../utils/accounting-audit'

export const getCompletionToRevenue = async (
  payload: Payload,
): Promise<AccountingCompletionRevenueRow[]> => {
  const links = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
    depth: 2,
  })

  return links
    .filter((link) => {
      const enrollment = typeof link.enrollment === 'object' ? link.enrollment : null
      return Boolean(enrollment?.completedAt)
    })
    .map((link) => {
      const enrollment = typeof link.enrollment === 'object' ? link.enrollment : null
      const course = typeof link.course === 'object' ? link.course : null

      return {
        enrollmentId: getRelationshipId(link.enrollment) || link.id,
        courseId: getRelationshipId(link.course),
        courseTitle: course?.title || null,
        completedAt: enrollment?.completedAt || null,
        finalCharge: normalizeAmount(link.finalChargeSnapshot),
        recognizedRevenue: normalizeAmount(link.recognizedRevenueSnapshot),
        remainingDeferredRevenue: Math.max(
          0,
          normalizeAmount(link.finalChargeSnapshot) - normalizeAmount(link.recognizedRevenueSnapshot),
        ),
      }
    })
}
