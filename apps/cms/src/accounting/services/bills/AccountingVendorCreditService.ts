import { APIError, type DataFromCollectionSlug, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { getCreditApplicationStatus, normalizeCode, normalizeOptionalText } from '../../utils/commercial'
import { AccountingBillService } from './AccountingBillService'

type VendorCreditHeaderNormalizationFields = {
  vendorCreditNumber?: unknown
  currency?: unknown
  reason?: unknown
  notes?: unknown
}

export class AccountingVendorCreditService {
  static normalizeHeader<T extends VendorCreditHeaderNormalizationFields>(data: T) {
    data.vendorCreditNumber = data.vendorCreditNumber ? normalizeCode(data.vendorCreditNumber) : data.vendorCreditNumber
    data.currency = normalizeCode(data.currency || 'PHP')
    data.reason = normalizeOptionalText(data.reason)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateVendorCreditNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'vendorCreditNumberPrefix')
  }

  static async postVendorCredit({
    payload,
    vendorCreditId,
    userId,
  }: {
    payload: Payload
    vendorCreditId: number | string
    userId?: number | string | null
  }) {
    const vendorCredit = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: vendorCreditId,
      depth: 2,
      overrideAccess: true,
    })

    if (!vendorCredit) {
      throw new APIError('Vendor credit not found.', 404)
    }

    if (vendorCredit.status === 'posted') {
      return vendorCredit
    }

    const total = normalizeAmount(vendorCredit.total)
    const subtotal = normalizeAmount(vendorCredit.subtotal)
    const taxTotal = normalizeAmount(vendorCredit.taxTotal)
    const applications = Array.isArray(vendorCredit.applications) ? vendorCredit.applications : []
    const appliedAmount = AccountingCommercialService.getAppliedAmountFromArray(applications)

    if (total <= 0) {
      throw new APIError('Vendor credits require a positive total before posting.', 400)
    }

    if (appliedAmount > total) {
      throw new APIError('Vendor credit applications cannot exceed the vendor credit total.', 400)
    }

    await AccountingCommercialService.validateVendorCreditApplications(
      payload,
      applications,
      vendorCredit.vendor,
    )

    const payableAccountId = await AccountingCommercialService.getDefaultAccountId(
      payload,
      'defaultPayableAccount',
    )
    const reductionAccountId = getRelationshipId(vendorCredit.adjustmentAccount)

    if (!reductionAccountId) {
      throw new APIError('Vendor credits require an adjustment account before posting.', 400)
    }

    const journalLines = [
      {
        account: payableAccountId,
        description: `Reduce payable for vendor credit ${vendorCredit.vendorCreditNumber || vendorCreditId}`,
        debit: total,
        credit: 0,
      },
      {
        account: reductionAccountId,
        description: `Expense reduction for vendor credit ${vendorCredit.vendorCreditNumber || vendorCreditId}`,
        debit: 0,
        credit: subtotal > 0 ? subtotal : total,
      },
    ]

    if (taxTotal > 0) {
      const inputTaxAccountId = await AccountingCommercialService.getDefaultAccountId(
        payload,
        'defaultInputTaxAccount',
      )

      journalLines.push({
        account: inputTaxAccountId,
        description: `Tax reversal for vendor credit ${vendorCredit.vendorCreditNumber || vendorCreditId}`,
        debit: 0,
        credit: taxTotal,
      })
    }

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: vendorCredit.creditDate || vendorCredit.postingDate,
      postingDate: vendorCredit.postingDate || vendorCredit.creditDate,
      memo:
        vendorCredit.reason ||
        vendorCredit.notes ||
        `Vendor credit ${vendorCredit.vendorCreditNumber || vendorCreditId}`,
      referenceNumber: vendorCredit.vendorCreditNumber || undefined,
      sourceReference: vendorCredit.vendorCreditNumber || undefined,
      autoPost: true,
      lines: journalLines,
    })

    const remainingAmount = normalizeAmount(total - appliedAmount)
    const status = getCreditApplicationStatus({
      total,
      appliedAmount,
    }) as DataFromCollectionSlug<'accounting-vendor-credits'>['status']
    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    const updatedVendorCredit = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: vendorCreditId,
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

    const billIds = new Set<string>()
    const sourceBillId = getRelationshipId(vendorCredit.sourceBill)

    if (sourceBillId) {
      billIds.add(String(sourceBillId))
    }

    for (const application of applications) {
      const billId = getRelationshipId(application?.bill)

      if (billId) {
        billIds.add(String(billId))
      }
    }

    for (const billId of Array.from(billIds)) {
      await AccountingBillService.syncBalance(payload, billId)
    }

    return updatedVendorCredit
  }
}
