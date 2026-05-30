import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { AccountingLmsBridgeSyncService } from '../enrollment-billing/AccountingLmsBridgeSyncService'

export const CERTIFICATE_ACCOUNTING_CONTEXT_KEY = 'skipCertificateAccountingBridge'

const buildCertificateAdjustmentMarker = (certificateId: number | string) => `certificate:${certificateId}`

export class AccountingCertificateMonetizationService {
  static async syncCertificateAccounting({
    payload,
    certificateId,
    userId,
  }: {
    payload: Payload
    certificateId: number | string
    userId?: number | string | null
  }) {
    const certificate = await payload.findByID({
      collection: 'certificates',
      id: certificateId,
      depth: 2,
      overrideAccess: true,
    })

    if (!certificate) {
      throw new APIError('Certificate not found.', 404)
    }

    const enrollmentId = getRelationshipId(certificate.enrollment)
    const courseId = getRelationshipId(certificate.course)

    if (!enrollmentId || !courseId) {
      throw new APIError('Certificate must remain linked to both the course and enrollment.', 400)
    }

    const feeProfiles = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.courseFeeProfiles,
      where: {
        course: {
          equals: courseId,
        },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const feeProfile = feeProfiles.docs[0]
    const certificateFee = normalizeAmount(feeProfile?.certificateFee)
    const billingLink = await AccountingLmsBridgeSyncService.syncEnrollmentArtifacts({
      payload,
      enrollmentId,
      userId,
      createZeroValueInvoice: certificateFee > 0,
      autoPost: false,
      recognitionTrigger: 'schedule_only',
    })

    const billingLinkRelationId = getRelationshipId(billingLink.billingLink?.id ?? billingLink.billingLink)
    const billingLinkId =
      typeof billingLinkRelationId === 'number'
        ? billingLinkRelationId
        : billingLinkRelationId
          ? Number(billingLinkRelationId)
          : undefined
    if (!billingLinkId) {
      throw new APIError('Certificate accounting requires an enrollment billing link.', 400)
    }

    const marker = buildCertificateAdjustmentMarker(certificate.id)
    const existingAdjustments = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      where: {
        and: [
          {
            enrollmentBillingLink: {
              equals: billingLinkId,
            },
          },
          {
            adjustmentType: {
              equals: 'certificate_fee',
            },
          },
          {
            notes: {
              equals: marker,
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existingAdjustment = existingAdjustments.docs[0]

    if (certificateFee > 0) {
      const adjustmentData: RequiredDataFromCollectionSlug<'accounting-billing-adjustments'> = {
        enrollmentBillingLink: billingLinkId,
        adjustmentType: 'certificate_fee',
        reason: `Certificate fee for ${certificate.certificateCode}`,
        amount: certificateFee,
        direction: 'increase',
        approvedBy: typeof userId === 'number' ? userId : userId ? Number(userId) : undefined,
        appliedAt: certificate.issueDate || new Date().toISOString(),
        notes: marker,
      }

      if (existingAdjustment?.id) {
        await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
          id: existingAdjustment.id,
          overrideAccess: true,
          depth: 0,
          data: adjustmentData,
        })
      } else {
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
          overrideAccess: true,
          depth: 0,
          data: adjustmentData,
        })
      }
    } else if (existingAdjustment?.id) {
      await payload.delete({
        collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
        id: existingAdjustment.id,
        overrideAccess: true,
      })
    }

    const artifacts = await AccountingLmsBridgeSyncService.syncEnrollmentArtifacts({
      payload,
      enrollmentId,
      userId,
      createZeroValueInvoice: certificateFee > 0,
      autoPost: false,
      recognitionTrigger: 'certificate_issued',
    })

    const financeMetadata = {
      certificateFee,
      feeProfileId: feeProfile?.id || null,
      billingLinkId: getRelationshipId(artifacts.billingLink?.id ?? artifacts.billingLink) || null,
      invoiceId: getRelationshipId(artifacts.invoice?.id ?? artifacts.invoice) || null,
      scheduleId: getRelationshipId(artifacts.schedule?.id ?? artifacts.schedule) || null,
      recognizedAmount: normalizeAmount(artifacts.schedule?.recognizedAmount),
      remainingDeferredAmount: normalizeAmount(artifacts.schedule?.remainingDeferredAmount),
      appliedAt: new Date().toISOString(),
    }

    await payload.update({
      collection: 'certificates',
      id: certificate.id,
      overrideAccess: true,
      depth: 0,
      context: {
        [CERTIFICATE_ACCOUNTING_CONTEXT_KEY]: true,
      },
      data: {
        metadata: {
          ...(typeof certificate.metadata === 'object' && certificate.metadata !== null ? certificate.metadata : {}),
          finance: financeMetadata,
        },
      },
    })

    return {
      certificateId: certificate.id,
      certificateFee,
      ...artifacts,
    }
  }
}
