import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { normalizeAmount } from '../../utils/amounts'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingCreditNoteService } from '../invoices/AccountingCreditNoteService'
import { AccountingEnrollmentBillingService } from '../enrollment-billing/AccountingEnrollmentBillingService'

type RefundNormalizationFields = {
  refundNumber?: unknown
  currency?: unknown
  refundReason?: unknown
  notes?: unknown
}

export class AccountingLmsRefundService {
  static normalizeRefund<T extends RefundNormalizationFields>(data: T) {
    data.refundNumber = data.refundNumber ? normalizeCode(data.refundNumber) : data.refundNumber
    data.currency = normalizeCode(data.currency || 'PHP')
    data.refundReason = normalizeOptionalText(data.refundReason)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateRefundNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'refundNumberPrefix')
  }

  static async processRefund({
    payload,
    refundId,
    userId,
  }: {
    payload: Payload
    refundId: number | string
    userId?: number | string | null
  }) {
    const refund = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      id: refundId,
      depth: 2,
      overrideAccess: true,
    })

    if (!refund) {
      throw new APIError('Refund not found.', 404)
    }

    if (refund.status === 'processed') {
      return refund
    }

    const approvedAmount = normalizeAmount(refund.approvedAmount || refund.requestedAmount)
    if (approvedAmount <= 0) {
      throw new APIError('Refunds require an approved amount greater than zero.', 400)
    }

    const invoiceId = getRelationshipId(refund.invoice)
    const paymentId = getRelationshipId(refund.paymentReceived)
    const normalizedInvoiceId = typeof invoiceId === 'number' ? invoiceId : invoiceId ? Number(invoiceId) : undefined
    const normalizedPaymentId = typeof paymentId === 'number' ? paymentId : paymentId ? Number(paymentId) : undefined
    if (!normalizedInvoiceId || !normalizedPaymentId) {
      throw new APIError('Refunds must reference both the invoice and the original payment.', 400)
    }

    const payment = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: normalizedPaymentId,
      depth: 1,
      overrideAccess: true,
    })
    const customerId = getRelationshipId(payment?.customer)
    const adjustmentAccountId =
      typeof payment?.depositAccount === 'object' && payment.depositAccount !== null
        ? getRelationshipId(payment.depositAccount.ledgerAccount)
        : undefined

    if (typeof customerId !== 'number' || typeof adjustmentAccountId !== 'number') {
      throw new APIError('Refund credit notes require both a customer and adjustment account.', 400)
    }

    const creditNoteNumber = await AccountingCreditNoteService.generateCreditNoteNumber(payload)

    const creditNoteData: RequiredDataFromCollectionSlug<'accounting-credit-notes'> = {
      creditNoteNumber,
      customer: customerId,
      sourceInvoice: normalizedInvoiceId,
      creditDate: refund.refundDate || new Date().toISOString(),
      postingDate: refund.refundDate || new Date().toISOString(),
      subtotal: approvedAmount,
      taxTotal: 0,
      total: approvedAmount,
      appliedAmount: 0,
      remainingAmount: approvedAmount,
      currency: refund.currency || payment?.currency || 'PHP',
      status: 'draft' as const,
      adjustmentAccount: adjustmentAccountId,
      reason: refund.refundReason || refund.notes || `Refund ${refund.refundNumber || refund.id}`,
      notes: refund.notes || undefined,
      applications: [
        {
          invoice: normalizedInvoiceId,
          amountApplied: approvedAmount,
        },
      ],
    }

    const creditNote = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      overrideAccess: true,
      depth: 2,
      data: creditNoteData,
    })

    await AccountingCreditNoteService.postCreditNote({
      payload,
      creditNoteId: creditNote.id,
      userId,
    })

    const updatedRefund = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.refunds,
      id: refundId,
      overrideAccess: true,
      depth: 2,
      data: {
        approvedAmount,
        creditNote: creditNote.id,
        processedBy: typeof userId === 'number' ? userId : userId ? Number(userId) : undefined,
        status: 'processed' as const,
      },
    })

    const enrollmentId = getRelationshipId(refund.enrollmentBillingLink)
      ? (
          await payload.findByID({
            collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
            id: getRelationshipId(refund.enrollmentBillingLink)!,
            depth: 0,
            overrideAccess: true,
          })
        )?.enrollment
      : null

    const normalizedEnrollmentId = getRelationshipId(enrollmentId)

    if (normalizedEnrollmentId) {
      await AccountingEnrollmentBillingService.ensureBillingLink({
        payload,
        enrollmentId: normalizedEnrollmentId,
      })
      await AccountingEnrollmentBillingService.syncEnrollmentOperationalPaymentState(
        payload,
        normalizedEnrollmentId,
      )
    }

    return updatedRefund
  }
}
