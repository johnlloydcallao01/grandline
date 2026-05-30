import { APIError, type DataFromCollectionSlug, type Payload } from 'payload'
import {
  ACCOUNTING_COLLECTION_SLUGS,
  ACCOUNTING_HOOK_CONTEXT,
  DEFAULT_ACCOUNTING_SETTINGS,
} from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import {
  calculateTaxAmount,
  getDocumentPaymentStatus,
  normalizeCode,
  normalizeOptionalText,
  sumBy,
} from '../../utils/commercial'

type BillLineLike = {
  quantity?: number | null
  unitPrice?: number | null
  taxCode?: unknown
  expenseAccount?: unknown
  assetAccount?: unknown
  payableAccountOverride?: unknown
  description?: string | null
}

type BillHeaderNormalizationFields = {
  billNumber?: unknown
  currency?: unknown
  referenceNumber?: unknown
  memo?: unknown
  notes?: unknown
}

export class AccountingBillService {
  static normalizeHeader<T extends BillHeaderNormalizationFields>(data: T) {
    data.billNumber = data.billNumber ? normalizeCode(data.billNumber) : data.billNumber
    data.currency = normalizeCode(data.currency || DEFAULT_ACCOUNTING_SETTINGS.baseCurrency)
    data.referenceNumber = normalizeOptionalText(data.referenceNumber)
    data.memo = normalizeOptionalText(data.memo)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateBillNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'billNumberPrefix')
  }

  static async calculateLine(payload: Payload, line: BillLineLike) {
    const quantity = normalizeAmount(line.quantity || 0)
    const unitPrice = normalizeAmount(line.unitPrice || 0)
    const grossAmount = roundCurrency(quantity * unitPrice)

    if (quantity <= 0) {
      throw new APIError('Bill line quantity must be greater than zero.', 400)
    }

    const taxCode = await AccountingCommercialService.resolveTaxCode(payload, line.taxCode)
    const calculationMethod =
      taxCode?.calculationMethod || DEFAULT_ACCOUNTING_SETTINGS.defaultTaxBehavior
    const taxRate = normalizeAmount(taxCode?.rate)
    const lineTax = calculateTaxAmount({
      amount: grossAmount,
      rate: taxRate,
      calculationMethod,
    })
    const lineSubtotal =
      calculationMethod === 'inclusive' ? roundCurrency(grossAmount - lineTax) : grossAmount
    const lineTotal =
      calculationMethod === 'inclusive' ? grossAmount : roundCurrency(lineSubtotal + lineTax)

    return {
      quantity,
      unitPrice,
      lineSubtotal,
      lineTax,
      lineTotal,
    }
  }

  static async syncTotals(payload: Payload, billId: number | string) {
    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
      depth: 0,
      where: {
        bill: {
          equals: billId,
        },
      },
      sort: 'lineNumber',
    })

    const subtotal = sumBy(lines, (line) => line.lineSubtotal)
    const taxTotal = sumBy(lines, (line) => line.lineTax)
    const total = sumBy(lines, (line) => line.lineTotal)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
      },
      data: {
        subtotal,
        taxTotal,
        total,
      },
    })

    await this.syncBalance(payload, billId)

    return {
      subtotal,
      taxTotal,
      total,
    }
  }

  static async syncBalance(payload: Payload, billId: number | string) {
    const bill = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      depth: 0,
      overrideAccess: true,
    })

    if (!bill) {
      throw new APIError('Bill not found.', 404)
    }

    const postedPayments = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      depth: 0,
      where: {
        status: {
          equals: 'posted',
        },
      },
    })

    const appliedPayments = roundCurrency(
      postedPayments.reduce((total, payment) => {
        const applications = Array.isArray(payment.applications) ? payment.applications : []
        const amountApplied = applications.reduce((applicationTotal: number, application: any) => {
          return getRelationshipId(application?.bill) === String(billId) ||
            String(getRelationshipId(application?.bill)) === String(billId)
            ? applicationTotal + normalizeAmount(application?.amountApplied)
            : applicationTotal
        }, 0)

        return total + amountApplied
      }, 0),
    )

    const vendorCredits = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      depth: 0,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
    })

    const appliedCredits = roundCurrency(
      vendorCredits.reduce((total, credit) => {
        const applications = Array.isArray(credit.applications) ? credit.applications : []
        const appliedToBill = applications.reduce((applicationTotal: number, application: any) => {
          return getRelationshipId(application?.bill) === String(billId) ||
            String(getRelationshipId(application?.bill)) === String(billId)
            ? applicationTotal + normalizeAmount(application?.amountApplied)
            : applicationTotal
        }, 0)

        return total + appliedToBill
      }, 0),
    )
    const balanceDue = roundCurrency(
      Math.max(0, normalizeAmount(bill.total) - appliedPayments - appliedCredits),
    )
    const nextStatus = (
      String(bill.status || '') === 'voided'
        ? 'voided'
        : getDocumentPaymentStatus({
            total: normalizeAmount(bill.total),
            balanceDue,
          })
    ) as DataFromCollectionSlug<'accounting-bills'>['status']

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipBillBalanceSync]: true,
      },
      data: {
        balanceDue,
        status: nextStatus,
      },
    })

    return {
      balanceDue,
      status: nextStatus,
    }
  }

  static async postBill({
    payload,
    billId,
    userId,
  }: {
    payload: Payload
    billId: number | string
    userId?: number | string | null
  }) {
    const bill = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      depth: 0,
      overrideAccess: true,
    })

    if (!bill) {
      throw new APIError('Bill not found.', 404)
    }

    if (['posted', 'partially_paid', 'paid'].includes(String(bill.status || ''))) {
      return payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.bills,
        id: billId,
        depth: 2,
        overrideAccess: true,
      })
    }

    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
      depth: 1,
      where: {
        bill: {
          equals: billId,
        },
      },
      sort: 'lineNumber',
    })

    if (!lines.length) {
      throw new APIError('Bills require at least one line item before posting.', 400)
    }

    await this.syncTotals(payload, billId)

    const refreshedBill = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      depth: 0,
      overrideAccess: true,
    })

    const payableAccountId =
      getRelationshipId(lines[0]?.payableAccountOverride) ||
      getRelationshipId(refreshedBill?.payableAccountOverride) ||
      (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultPayableAccount'))

    const journalLines = []

    for (const line of lines) {
      const expenseAccountId = getRelationshipId(line.expenseAccount || line.assetAccount)

      if (!expenseAccountId) {
        throw new APIError('Every bill line requires an expense or asset account before posting.', 400)
      }

      journalLines.push({
        account: expenseAccountId,
        description: line.description || `Bill ${refreshedBill?.billNumber || billId}`,
        debit: normalizeAmount(line.lineSubtotal),
        credit: 0,
      })

      const taxAmount = normalizeAmount(line.lineTax)

      if (taxAmount > 0) {
        const taxCode = await AccountingCommercialService.resolveTaxCode(payload, line.taxCode)
        const taxAccountId =
          getRelationshipId(taxCode?.purchaseAccount) ||
          (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultInputTaxAccount'))

        journalLines.push({
          account: taxAccountId,
          description: line.description || `Input tax for ${refreshedBill?.billNumber || billId}`,
          debit: taxAmount,
          credit: 0,
        })
      }
    }

    journalLines.push({
      account: payableAccountId,
      description: `Accounts payable for bill ${refreshedBill?.billNumber || billId}`,
      debit: 0,
      credit: normalizeAmount(refreshedBill?.total),
    })

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: refreshedBill?.billDate || refreshedBill?.postingDate,
      postingDate: refreshedBill?.postingDate || refreshedBill?.billDate,
      memo: refreshedBill?.memo || `Bill ${refreshedBill?.billNumber || billId}`,
      referenceNumber: refreshedBill?.billNumber || undefined,
      sourceReference: refreshedBill?.billNumber || undefined,
      autoPost: true,
      lines: journalLines,
    })

    const status = getDocumentPaymentStatus({
      total: normalizeAmount(refreshedBill?.total),
      balanceDue: normalizeAmount(refreshedBill?.total),
    }) as DataFromCollectionSlug<'accounting-bills'>['status']
    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipBillBalanceSync]: true,
      },
      data: {
        status,
        postingStatus: 'posted',
        fiscalYear: typeof fiscalYearId === 'number' ? fiscalYearId : undefined,
        period: typeof periodId === 'number' ? periodId : undefined,
        postedJournalEntry: journalEntry.id,
        balanceDue: normalizeAmount(refreshedBill?.total),
      },
      depth: 2,
    })

    return payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills,
      id: billId,
      depth: 2,
      overrideAccess: true,
    })
  }
}
