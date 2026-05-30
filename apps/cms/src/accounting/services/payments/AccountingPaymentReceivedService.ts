import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { AccountingInvoiceService } from '../invoices/AccountingInvoiceService'
import { AccountingLmsPaymentAllocationService } from './AccountingLmsPaymentAllocationService'

type PaymentReceivedHeaderNormalizationFields = {
  receiptNumber?: unknown
  currency?: unknown
  referenceNumber?: unknown
  notes?: unknown
}

export class AccountingPaymentReceivedService {
  static normalizeHeader<T extends PaymentReceivedHeaderNormalizationFields>(data: T) {
    data.receiptNumber = data.receiptNumber ? normalizeCode(data.receiptNumber) : data.receiptNumber
    data.currency = normalizeCode(data.currency || 'PHP')
    data.referenceNumber = normalizeOptionalText(data.referenceNumber)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateReceiptNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'paymentReceivedNumberPrefix')
  }

  static async postPayment({
    payload,
    paymentId,
    userId,
  }: {
    payload: Payload
    paymentId: number | string
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

    if (payment.status === 'posted') {
      return payment
    }

    const amountReceived = normalizeAmount(payment.amountReceived)

    if (amountReceived <= 0) {
      throw new APIError('amountReceived must be greater than zero before posting.', 400)
    }

    const applications = Array.isArray(payment.applications) ? payment.applications : []
    const totalApplied = normalizeAmount(
      applications.reduce((total: number, application: any) => total + normalizeAmount(application?.amountApplied), 0),
    )

    if (totalApplied > amountReceived) {
      throw new APIError('Applied invoice allocations cannot exceed the received amount.', 400)
    }

    await AccountingCommercialService.validateInvoiceApplications(payload, applications, payment.customer)

    const bankAccount =
      typeof payment.depositAccount === 'object' && payment.depositAccount !== null
        ? payment.depositAccount
        : payment.depositAccount
          ? await payload.findByID({
              collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
              id: payment.depositAccount,
              depth: 0,
              overrideAccess: true,
            })
          : null

    const cashAccountId =
      getRelationshipId(bankAccount?.ledgerAccount) ||
      getRelationshipId(payment.undepositedFundsAccount) ||
      (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultUndepositedFundsAccount'))
    const receivableAccountId = await AccountingCommercialService.getDefaultAccountId(
      payload,
      'defaultReceivableAccount',
    )

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: payment.paymentDate || payment.postingDate,
      postingDate: payment.postingDate || payment.paymentDate,
      memo: payment.notes || `Payment received ${payment.receiptNumber || paymentId}`,
      referenceNumber: payment.receiptNumber || undefined,
      sourceReference: payment.referenceNumber || payment.receiptNumber || undefined,
      autoPost: true,
      lines: [
        {
          account: cashAccountId,
          description: `Receipt ${payment.receiptNumber || paymentId}`,
          debit: amountReceived,
          credit: 0,
        },
        {
          account: receivableAccountId,
          description: `Clear receivable for receipt ${payment.receiptNumber || paymentId}`,
          debit: 0,
          credit: amountReceived,
        },
      ],
    })
    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    const updatedPayment = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      overrideAccess: true,
      data: {
        status: 'posted' as const,
        fiscalYear: typeof fiscalYearId === 'number' ? fiscalYearId : undefined,
        period: typeof periodId === 'number' ? periodId : undefined,
        postedJournalEntry: journalEntry.id,
      },
      depth: 2,
    })

    for (const application of applications) {
      const invoiceId = getRelationshipId(application?.invoice)

      if (invoiceId) {
        await AccountingInvoiceService.syncBalance(payload, invoiceId)
      }
    }

    await AccountingLmsPaymentAllocationService.rebuildAllocationsForPayment(payload, paymentId)

    return updatedPayment
  }
}
