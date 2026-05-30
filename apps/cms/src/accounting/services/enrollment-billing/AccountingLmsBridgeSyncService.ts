import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { AccountingEnrollmentBillingService } from './AccountingEnrollmentBillingService'
import { AccountingEnrollmentInvoiceService } from './AccountingEnrollmentInvoiceService'
import { AccountingRevenueRecognitionService } from '../revenue-recognition/AccountingRevenueRecognitionService'

export type AccountingRecognitionTrigger =
  | 'schedule_only'
  | 'activation'
  | 'completion'
  | 'certificate_issued'

export class AccountingLmsBridgeSyncService {
  static async syncEnrollmentArtifacts({
    payload,
    enrollmentId,
    userId,
    createZeroValueInvoice = true,
    autoPost = false,
    recognitionTrigger = 'schedule_only',
  }: {
    payload: Payload
    enrollmentId: number | string
    userId?: number | string | null
    createZeroValueInvoice?: boolean
    autoPost?: boolean
    recognitionTrigger?: AccountingRecognitionTrigger
  }) {
    const billingLink = await AccountingEnrollmentBillingService.ensureBillingLink({
      payload,
      enrollmentId,
    })
    const summary = await AccountingEnrollmentBillingService.getEnrollmentFinanceSummary(payload, enrollmentId)

    let invoice: any = null
    if (createZeroValueInvoice || normalizeAmount(summary.finalCharge) > 0) {
      invoice = await AccountingEnrollmentInvoiceService.ensureInvoiceForEnrollment({
        payload,
        enrollmentId,
        userId,
        createZeroValueInvoice,
        autoPost,
      })
    }

    let schedule: any = null
    if (normalizeAmount(summary.finalCharge) > 0 && invoice) {
      schedule = await AccountingRevenueRecognitionService.ensureScheduleForEnrollment({
        payload,
        enrollmentId,
      })

      if (recognitionTrigger !== 'schedule_only') {
        schedule = await AccountingRevenueRecognitionService.processEnrollmentRecognitionTrigger({
          payload,
          enrollmentId,
          trigger: recognitionTrigger,
        })
      }
    }

    const paymentState = await AccountingEnrollmentBillingService.syncEnrollmentOperationalPaymentState(
      payload,
      enrollmentId,
    )

    return {
      billingLink,
      summary,
      invoice,
      schedule,
      paymentState,
    }
  }

  static async syncEnrollmentArtifactsForBillingLink({
    payload,
    billingLinkId,
    userId,
    createZeroValueInvoice = true,
    autoPost = false,
    recognitionTrigger = 'schedule_only',
  }: {
    payload: Payload
    billingLinkId: number | string
    userId?: number | string | null
    createZeroValueInvoice?: boolean
    autoPost?: boolean
    recognitionTrigger?: AccountingRecognitionTrigger
  }) {
    const billingLink = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: billingLinkId,
      depth: 0,
      overrideAccess: true,
    })
    const enrollmentId = getRelationshipId(billingLink?.enrollment)

    if (!enrollmentId) {
      throw new Error('Enrollment billing link is missing its enrollment relationship.')
    }

    return this.syncEnrollmentArtifacts({
      payload,
      enrollmentId,
      userId,
      createZeroValueInvoice,
      autoPost,
      recognitionTrigger,
    })
  }
}
