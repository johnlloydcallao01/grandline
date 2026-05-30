import { APIError, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { normalizeAmount } from '../../utils/amounts'
import { getSingleDoc } from '../../utils/lms'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingEnrollmentBillingService } from '../enrollment-billing/AccountingEnrollmentBillingService'
import { AccountingLmsPaymentAllocationService } from '../payments/AccountingLmsPaymentAllocationService'

type ReceiptNormalizationFields = {
  receiptNumber?: unknown
  currency?: unknown
  notes?: unknown
}

export class AccountingReceiptService {
  static normalizeReceipt<T extends ReceiptNormalizationFields>(data: T) {
    data.receiptNumber = data.receiptNumber ? normalizeCode(data.receiptNumber) : data.receiptNumber
    data.currency = normalizeCode(data.currency || 'PHP')
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateReceiptNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'officialReceiptNumberPrefix')
  }

  static async issueReceipt({
    payload,
    paymentId,
    proofDocument,
    notes,
    userId,
  }: {
    payload: Payload
    paymentId: number | string
    proofDocument?: number | string | null
    notes?: string | null
    userId?: number | string | null
  }) {
    const payment = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      depth: 2,
      overrideAccess: true,
    })

    if (!payment) {
      throw new APIError('Payment received record not found.', 404)
    }
    const applications = Array.isArray(payment.applications) ? payment.applications : []

    const existingReceipt = await getSingleDoc<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      where: {
        paymentReceived: {
          equals: paymentId,
        },
      },
      depth: 1,
    })

    const billingLink = getRelationshipId(applications[0]?.invoice)
      ? await getSingleDoc<any>({
          payload,
          collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
          where: {
            invoice: {
              equals: getRelationshipId(applications[0]?.invoice),
            },
          },
          depth: 0,
        })
      : null
    const billingLinkId = getRelationshipId(billingLink?.id)
    const customerId = getRelationshipId(payment.customer) || getRelationshipId(billingLink?.customer)
    const proofDocumentId =
      typeof proofDocument === 'number'
        ? proofDocument
        : proofDocument
          ? Number(proofDocument)
          : undefined
    const issuedById =
      typeof userId === 'number' ? userId : userId ? Number(userId) : undefined

    if (typeof customerId !== 'number') {
      throw new APIError('Receipts require a linked accounting customer.', 400)
    }

    const receiptNumber = existingReceipt?.receiptNumber || (await this.generateReceiptNumber(payload))

    const data: RequiredDataFromCollectionSlug<'accounting-receipts'> = {
      receiptNumber,
      paymentReceived: payment.id,
      enrollmentBillingLink: typeof billingLinkId === 'number' ? billingLinkId : undefined,
      customer: customerId,
      receiptDate: payment.paymentDate || payment.postingDate || new Date().toISOString(),
      amount: normalizeAmount(payment.amountReceived),
      currency: payment.currency || 'PHP',
      status: 'issued' as const,
      proofDocument: Number.isFinite(proofDocumentId as number) ? proofDocumentId : undefined,
      issuedBy: Number.isFinite(issuedById as number) ? issuedById : undefined,
      notes: notes || payment.notes || undefined,
    }

    const receipt = existingReceipt?.id
      ? await payload.update({
          collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
          id: existingReceipt.id,
          overrideAccess: true,
          depth: 2,
          data,
        })
      : await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
          overrideAccess: true,
          depth: 2,
          data,
        })

    await AccountingLmsPaymentAllocationService.rebuildAllocationsForPayment(payload, payment.id)

    if (billingLink?.enrollment) {
      await AccountingEnrollmentBillingService.syncEnrollmentOperationalPaymentState(
        payload,
        billingLink.enrollment,
      )
    }

    return receipt
  }

  static async voidReceipt({
    payload,
    receiptId,
    userId,
  }: {
    payload: Payload
    receiptId: number | string
    userId?: number | string | null
  }) {
    const receipt = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: receiptId,
      depth: 1,
      overrideAccess: true,
    })

    if (!receipt) {
      throw new APIError('Receipt not found.', 404)
    }

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: receiptId,
      overrideAccess: true,
      depth: 2,
      data: {
        status: 'voided' as const,
        voidedAt: new Date().toISOString(),
        voidedBy: typeof userId === 'number' ? userId : userId ? Number(userId) : undefined,
      },
    })
  }
}
