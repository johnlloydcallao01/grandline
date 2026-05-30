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

type InvoiceLineLike = {
  account?: unknown
  incomeAccount?: unknown
  receivableAccountOverride?: unknown
  quantity?: number | null
  unitPrice?: number | null
  discountAmount?: number | null
  taxCode?: unknown
  description?: string | null
  lineSubtotal?: number | null
  lineTax?: number | null
  lineTotal?: number | null
}

type InvoiceHeaderNormalizationFields = {
  invoiceNumber?: unknown
  currency?: unknown
  referenceNumber?: unknown
  memo?: unknown
  sourceReference?: unknown
  notes?: unknown
}

export class AccountingInvoiceService {
  static normalizeHeader<T extends InvoiceHeaderNormalizationFields>(data: T) {
    data.invoiceNumber = data.invoiceNumber ? normalizeCode(data.invoiceNumber) : data.invoiceNumber
    data.currency = normalizeCode(data.currency || DEFAULT_ACCOUNTING_SETTINGS.baseCurrency)
    data.referenceNumber = normalizeOptionalText(data.referenceNumber)
    data.memo = normalizeOptionalText(data.memo)
    data.sourceReference = normalizeOptionalText(data.sourceReference)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateInvoiceNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'invoiceNumberPrefix')
  }

  static async calculateLine(payload: Payload, line: InvoiceLineLike) {
    const quantity = normalizeAmount(line.quantity || 0)
    const unitPrice = normalizeAmount(line.unitPrice || 0)
    const discountAmount = normalizeAmount(line.discountAmount || 0)
    const grossBeforeDiscount = roundCurrency(quantity * unitPrice)

    if (quantity <= 0) {
      throw new APIError('Invoice line quantity must be greater than zero.', 400)
    }

    if (unitPrice < 0) {
      throw new APIError('Invoice line unit price cannot be negative.', 400)
    }

    if (discountAmount < 0 || discountAmount > grossBeforeDiscount) {
      throw new APIError('Invoice line discount amount is invalid.', 400)
    }

    const taxableAmount = roundCurrency(grossBeforeDiscount - discountAmount)
    const taxCode = await AccountingCommercialService.resolveTaxCode(payload, line.taxCode)
    const calculationMethod =
      taxCode?.calculationMethod || DEFAULT_ACCOUNTING_SETTINGS.defaultTaxBehavior
    const taxRate = normalizeAmount(taxCode?.rate)
    const lineTax = calculateTaxAmount({
      amount: taxableAmount,
      rate: taxRate,
      calculationMethod,
    })
    const lineSubtotal =
      calculationMethod === 'inclusive' ? roundCurrency(taxableAmount - lineTax) : taxableAmount
    const lineTotal =
      calculationMethod === 'inclusive' ? taxableAmount : roundCurrency(lineSubtotal + lineTax)

    return {
      quantity,
      unitPrice,
      discountAmount,
      lineSubtotal,
      lineTax,
      lineTotal,
    }
  }

  static async syncTotals(payload: Payload, invoiceId: number | string) {
    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      depth: 0,
      where: {
        invoice: {
          equals: invoiceId,
        },
      },
      sort: 'lineNumber',
    })

    const subtotal = sumBy(lines, (line) => line.lineSubtotal)
    const taxTotal = sumBy(lines, (line) => line.lineTax)
    const discountTotal = sumBy(lines, (line) => line.discountAmount)
    const total = sumBy(lines, (line) => line.lineTotal)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceTotalsSync]: true,
      },
      data: {
        subtotal,
        taxTotal,
        discountTotal,
        total,
      },
    })

    await this.syncBalance(payload, invoiceId)

    return {
      subtotal,
      taxTotal,
      discountTotal,
      total,
    }
  }

  static async syncBalance(payload: Payload, invoiceId: number | string) {
    const invoice = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      depth: 0,
      overrideAccess: true,
    })

    if (!invoice) {
      throw new APIError('Invoice not found.', 404)
    }

    const postedPayments = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      depth: 0,
      where: {
        status: {
          equals: 'posted',
        },
      },
    })

    const appliedFromPayments = roundCurrency(
      postedPayments.reduce((total, payment) => {
        const applications = Array.isArray(payment.applications) ? payment.applications : []
        const paymentApplied = applications.reduce((applicationTotal: number, application: any) => {
          return getRelationshipId(application?.invoice) === String(invoiceId) ||
            String(getRelationshipId(application?.invoice)) === String(invoiceId)
            ? applicationTotal + normalizeAmount(application?.amountApplied)
            : applicationTotal
        }, 0)

        return total + paymentApplied
      }, 0),
    )

    const creditNotes = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.creditNotes,
      depth: 0,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
    })

    const appliedCredits = roundCurrency(
      creditNotes.reduce((total, creditNote) => {
        const applications = Array.isArray(creditNote.applications) ? creditNote.applications : []
        const appliedToInvoice = applications.reduce((applicationTotal: number, application: any) => {
          return getRelationshipId(application?.invoice) === String(invoiceId) ||
            String(getRelationshipId(application?.invoice)) === String(invoiceId)
            ? applicationTotal + normalizeAmount(application?.amountApplied)
            : applicationTotal
        }, 0)

        return total + appliedToInvoice
      }, 0),
    )
    const balanceDue = roundCurrency(
      Math.max(0, normalizeAmount(invoice.total) - appliedFromPayments - appliedCredits),
    )
    const nextStatus = (
      String(invoice.status || '') === 'voided'
        ? 'voided'
        : getDocumentPaymentStatus({
            total: normalizeAmount(invoice.total),
            balanceDue,
          })
    ) as DataFromCollectionSlug<'accounting-invoices'>['status']

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceBalanceSync]: true,
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

  static async postInvoice({
    payload,
    invoiceId,
    userId,
  }: {
    payload: Payload
    invoiceId: number | string
    userId?: number | string | null
  }) {
    const invoice = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      depth: 0,
      overrideAccess: true,
    })

    if (!invoice) {
      throw new APIError('Invoice not found.', 404)
    }

    if (['posted', 'partially_paid', 'paid'].includes(String(invoice.status || ''))) {
      return payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        id: invoiceId,
        depth: 2,
        overrideAccess: true,
      })
    }

    const lines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.invoiceLineItems,
      depth: 1,
      where: {
        invoice: {
          equals: invoiceId,
        },
      },
      sort: 'lineNumber',
    })

    if (!lines.length) {
      throw new APIError('Invoices require at least one line item before posting.', 400)
    }

    await this.syncTotals(payload, invoiceId)

    const refreshedInvoice = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      depth: 0,
      overrideAccess: true,
    })

    const receivableAccountId =
      getRelationshipId(lines[0]?.receivableAccountOverride) ||
      getRelationshipId(refreshedInvoice?.receivableAccountOverride) ||
      (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultReceivableAccount'))

    const journalLines = [
      {
        account: receivableAccountId,
        description: `Accounts receivable for invoice ${refreshedInvoice?.invoiceNumber || invoiceId}`,
        debit: normalizeAmount(refreshedInvoice?.total),
        credit: 0,
      },
    ]

    for (const line of lines) {
      const incomeAccountId = getRelationshipId(line.incomeAccount)

      if (!incomeAccountId) {
        throw new APIError('Every invoice line requires an income account before posting.', 400)
      }

      journalLines.push({
        account: incomeAccountId,
        description: line.description || `Revenue for ${refreshedInvoice?.invoiceNumber || invoiceId}`,
        debit: 0,
        credit: normalizeAmount(line.lineSubtotal),
      })

      const taxAmount = normalizeAmount(line.lineTax)

      if (taxAmount > 0) {
        const taxCode = await AccountingCommercialService.resolveTaxCode(payload, line.taxCode)
        const taxAccountId =
          getRelationshipId(taxCode?.salesAccount) ||
          (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultOutputTaxAccount'))

        journalLines.push({
          account: taxAccountId,
          description: line.description || `Output tax for ${refreshedInvoice?.invoiceNumber || invoiceId}`,
          debit: 0,
          credit: taxAmount,
        })
      }
    }

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: refreshedInvoice?.invoiceDate || refreshedInvoice?.postingDate,
      postingDate: refreshedInvoice?.postingDate || refreshedInvoice?.invoiceDate,
      memo: refreshedInvoice?.memo || `Invoice ${refreshedInvoice?.invoiceNumber || invoiceId}`,
      referenceNumber: refreshedInvoice?.invoiceNumber || undefined,
      sourceReference: refreshedInvoice?.sourceReference || refreshedInvoice?.invoiceNumber || undefined,
      autoPost: true,
      lines: journalLines,
    })

    const status = getDocumentPaymentStatus({
      total: normalizeAmount(refreshedInvoice?.total),
      balanceDue: normalizeAmount(refreshedInvoice?.total),
    })
    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      overrideAccess: true,
      context: {
        [ACCOUNTING_HOOK_CONTEXT.skipInvoiceBalanceSync]: true,
      },
      data: {
        status: status as 'draft' | 'posted' | 'voided' | 'approved' | 'partially_paid' | 'paid',
        postingStatus: 'posted',
        fiscalYear: typeof fiscalYearId === 'number' ? fiscalYearId : undefined,
        period: typeof periodId === 'number' ? periodId : undefined,
        postedJournalEntry: journalEntry.id,
        balanceDue: normalizeAmount(refreshedInvoice?.total),
      },
      depth: 2,
    })

    return payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
      id: invoiceId,
      depth: 2,
      overrideAccess: true,
    })
  }
}
