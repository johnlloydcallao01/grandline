import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../constants/accounting'
import type { AccountingCertificateRevenueRow } from '../types/accounting'
import { findAllDocs } from '../utils/findAllDocs'
import { getRelationshipId } from '../utils/accounting-audit'
import { normalizeAmount } from '../utils/amounts'

export const getCertificateRevenue = async (
  payload: Payload,
): Promise<AccountingCertificateRevenueRow[]> => {
  const certificates = await findAllDocs<any>({
    payload,
    collection: 'certificates',
    depth: 2,
  })
  const billingLinks = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
    depth: 0,
  })
  const adjustments = await findAllDocs<any>({
    payload,
    collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
    depth: 0,
    where: {
      adjustmentType: {
        equals: 'certificate_fee',
      },
    },
  })

  const billingLinkByEnrollmentId = new Map<number, any>()
  for (const billingLink of billingLinks) {
    const enrollmentId = getRelationshipId(billingLink.enrollment)
    if (typeof enrollmentId === 'number') {
      billingLinkByEnrollmentId.set(enrollmentId, billingLink)
    }
  }

  const billedAmountByLinkId = new Map<number, number>()
  for (const adjustment of adjustments) {
    const billingLinkId = getRelationshipId(adjustment.enrollmentBillingLink)
    if (typeof billingLinkId !== 'number') continue
    billedAmountByLinkId.set(
      billingLinkId,
      normalizeAmount(billedAmountByLinkId.get(billingLinkId)) + normalizeAmount(adjustment.amount),
    )
  }

  return certificates.map((certificate) => {
    const enrollmentId = getRelationshipId(certificate.enrollment)
    const billingLinkId = typeof enrollmentId === 'number' ? billingLinkByEnrollmentId.get(enrollmentId)?.id : null
    return {
      certificateId: certificate.id,
      enrollmentId,
      courseId: getRelationshipId(certificate.course),
      courseTitle:
        (typeof certificate.course === 'object' ? certificate.course?.title : null) || null,
      issueDate: certificate.issueDate || null,
      billedAmount:
        normalizeAmount(
          typeof billingLinkId === 'number' ? billedAmountByLinkId.get(billingLinkId) : undefined,
        ) || normalizeAmount(certificate?.metadata?.finance?.certificateFee),
    }
  })
}
