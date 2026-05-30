import { APIError, type DataFromCollectionSlug, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { getCreditApplicationStatus, normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { AccountingInvoiceService } from './AccountingInvoiceService'

type CreditNoteHeaderNormalizationFields = {
  creditNoteNumber?: unknown
  currency?: unknown
  reason?: unknown
  notes?: unknown
}

export class AccountingCreditNoteService {
  static normalizeHeader<T extends CreditNoteHeaderNormalizationFields>(data: T) {
    data.creditNoteNumber = data.creditNoteNumber ? normalizeCode(data.creditNoteNumber) : data.creditNoteNumber
    data.currency = normalizeCode(data.currency || 'PHP')
    data.reason = normalizeOptionalText(data.reason)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateCreditNoteNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'creditNoteNumberPrefix')
  }

  static async postCreditNote({
    payload,
    creditNoteId,
    userId,
  }: {
    payload: Payload
    creditNoteId: number | string
    userId?: number | string | null
  }) {
    const creditNote = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: creditNoteId,
      depth: 2,
      overrideAccess: true,
    })

    if (!creditNote) {
      throw new APIError('Credit note not found.', 404)
    }

    if (creditNote.status === 'posted') {
      return creditNote
    }

    const total = normalizeAmount(creditNote.total)
    const subtotal = normalizeAmount(creditNote.subtotal)
    const taxTotal = normalizeAmount(creditNote.taxTotal)
    const applications = Array.isArray(creditNote.applications) ? creditNote.applications : []
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(applications)

    if (total <= 0) {
      throw new APIError('Credit notes require a positive total before posting.', 400)
    }

    if (appliedAmount > total) {
      throw new APIError('Credit note applications cannot exceed the credit note total.', 400)
    }

    await AccountingCommercialService.validateCreditNoteApplications(
      payload,
      applications,
      creditNote.customer,
    )

    const receivableAccountId = await AccountingCommercialService.getDefaultAccountId(
      payload,
      'defaultReceivableAccount',
    )
    const revenueAdjustmentAccountId = getRelationshipId(creditNote.adjustmentAccount)

    if (!revenueAdjustmentAccountId) {
      throw new APIError('Credit notes require an adjustment account before posting.', 400)
    }

    const journalLines = [
      {
        account: revenueAdjustmentAccountId,
        description: `Revenue reduction for credit note ${creditNote.creditNoteNumber || creditNoteId}`,
        debit: subtotal > 0 ? subtotal : total,
        credit: 0,
      },
    ]

    if (taxTotal > 0) {
      const outputTaxAccountId = await AccountingCommercialService.getDefaultAccountId(
        payload,
        'defaultOutputTaxAccount',
      )

      journalLines.push({
        account: outputTaxAccountId,
        description: `Tax reversal for credit note ${creditNote.creditNoteNumber || creditNoteId}`,
        debit: taxTotal,
        credit: 0,
      })
    }

    journalLines.push({
      account: receivableAccountId,
      description: `Reduce receivable for credit note ${creditNote.creditNoteNumber || creditNoteId}`,
      debit: 0,
      credit: total,
    })

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: creditNote.creditDate || creditNote.postingDate,
      postingDate: creditNote.postingDate || creditNote.creditDate,
      memo: creditNote.reason || creditNote.notes || `Credit note ${creditNote.creditNoteNumber || creditNoteId}`,
      referenceNumber: creditNote.creditNoteNumber || undefined,
      sourceReference: creditNote.creditNoteNumber || undefined,
      autoPost: true,
      lines: journalLines,
    })

    const remainingAmount = normalizeAmount(total - appliedAmount)
    const status = getCreditApplicationStatus({
      total,
      appliedAmount,
    }) as DataFromCollectionSlug<'accounting-credit-notes'>['status']
    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    const updatedCreditNote = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      id: creditNoteId,
      overrideAccess: true,
      data: {
        status,
        fiscalYear: typeof fiscalYearId === 'number' ? fiscalYearId : undefined,
        period: typeof periodId === 'number' ? periodId : undefined,
        postedJournalEntry: journalEntry.id,
        appliedAmount,
        remainingAmount,
      },
      depth: 2,
    })

    const invoiceIds = new Set<string>()
    const sourceInvoiceId = getRelationshipId(creditNote.sourceInvoice)

    if (sourceInvoiceId) {
      invoiceIds.add(String(sourceInvoiceId))
    }

    for (const application of applications) {
      const invoiceId = getRelationshipId(application?.invoice)

      if (invoiceId) {
        invoiceIds.add(String(invoiceId))
      }
    }

    for (const invoiceId of Array.from(invoiceIds)) {
      await AccountingInvoiceService.syncBalance(payload, invoiceId)
    }

    return updatedCreditNote
  }
}
