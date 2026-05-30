import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { AccountingBillService } from '../bills/AccountingBillService'

type PaymentMadeHeaderNormalizationFields = {
  paymentNumber?: unknown
  currency?: unknown
  referenceNumber?: unknown
  notes?: unknown
}

export class AccountingPaymentMadeService {
  static normalizeHeader<T extends PaymentMadeHeaderNormalizationFields>(data: T) {
    data.paymentNumber = data.paymentNumber ? normalizeCode(data.paymentNumber) : data.paymentNumber
    data.currency = normalizeCode(data.currency || 'PHP')
    data.referenceNumber = normalizeOptionalText(data.referenceNumber)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generatePaymentNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'paymentMadeNumberPrefix')
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
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      id: paymentId,
      depth: 2,
      overrideAccess: true,
    })

    if (!payment) {
      throw new APIError('Payment made record not found.', 404)
    }

    if (payment.status === 'posted') {
      return payment
    }

    const amountPaid = normalizeAmount(payment.amountPaid)

    if (amountPaid <= 0) {
      throw new APIError('amountPaid must be greater than zero before posting.', 400)
    }

    const applications = Array.isArray(payment.applications) ? payment.applications : []
    const totalApplied = normalizeAmount(
      applications.reduce((total: number, application: any) => total + normalizeAmount(application?.amountApplied), 0),
    )

    if (totalApplied > amountPaid) {
      throw new APIError('Applied bill allocations cannot exceed the payment amount.', 400)
    }

    await AccountingCommercialService.validateBillApplications(payload, applications, payment.vendor)

    const bankAccount =
      typeof payment.bankAccount === 'object' && payment.bankAccount !== null
        ? payment.bankAccount
        : await payload.findByID({
            collection: ACCOUNTING_COLLECTION_SLUGS.bankAccounts,
            id: payment.bankAccount,
            depth: 0,
            overrideAccess: true,
          })

    const cashAccountId = getRelationshipId(bankAccount?.ledgerAccount)

    if (!cashAccountId) {
      throw new APIError('The selected bank account must resolve to a ledger account before posting.', 400)
    }

    const payableAccountId = await AccountingCommercialService.getDefaultAccountId(
      payload,
      'defaultPayableAccount',
    )

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: payment.paymentDate || payment.postingDate,
      postingDate: payment.postingDate || payment.paymentDate,
      memo: payment.notes || `Payment made ${payment.paymentNumber || paymentId}`,
      referenceNumber: payment.paymentNumber || undefined,
      sourceReference: payment.referenceNumber || payment.paymentNumber || undefined,
      autoPost: true,
      lines: [
        {
          account: payableAccountId,
          description: `Settle payables for payment ${payment.paymentNumber || paymentId}`,
          debit: amountPaid,
          credit: 0,
        },
        {
          account: cashAccountId,
          description: `Cash out for payment ${payment.paymentNumber || paymentId}`,
          debit: 0,
          credit: amountPaid,
        },
      ],
    })
    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    const updatedPayment = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
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
      const billId = getRelationshipId(application?.bill)

      if (billId) {
        await AccountingBillService.syncBalance(payload, billId)
      }
    }

    return updatedPayment
  }
}
