import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS, DEFAULT_ACCOUNTING_SETTINGS } from '../../constants/accounting'
import { AccountingCommercialService } from '../AccountingCommercialService'
import { AccountingManualWorkflowService } from '../journals/AccountingManualWorkflowService'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount } from '../../utils/amounts'
import { calculateTaxAmount, normalizeCode, normalizeOptionalText } from '../../utils/commercial'

type ExpenseHeaderNormalizationFields = {
  expenseNumber?: unknown
  currency?: unknown
  notes?: unknown
}

export class AccountingExpenseService {
  static normalizeHeader<T extends ExpenseHeaderNormalizationFields>(data: T) {
    data.expenseNumber = data.expenseNumber ? normalizeCode(data.expenseNumber) : data.expenseNumber
    data.currency = normalizeCode(data.currency || DEFAULT_ACCOUNTING_SETTINGS.baseCurrency)
    data.notes = normalizeOptionalText(data.notes)
    return data
  }

  static async generateExpenseNumber(payload: Payload) {
    return AccountingCommercialService.generateDocumentNumber(payload, 'paymentMadeNumberPrefix')
  }

  static async calculateTotals(payload: Payload, expense: Record<string, any>) {
    const subtotal = normalizeAmount(expense.subtotal)
    const taxCode = await AccountingCommercialService.resolveTaxCode(payload, expense.taxCode)
    const taxTotal = calculateTaxAmount({
      amount: subtotal,
      rate: normalizeAmount(taxCode?.rate),
      calculationMethod:
        taxCode?.calculationMethod || DEFAULT_ACCOUNTING_SETTINGS.defaultTaxBehavior,
    })
    const total =
      taxCode?.calculationMethod === 'inclusive' ? subtotal : normalizeAmount(subtotal + taxTotal)

    return {
      subtotal,
      taxTotal,
      total,
    }
  }

  static async postExpense({
    payload,
    expenseId,
    userId,
  }: {
    payload: Payload
    expenseId: number | string
    userId?: number | string | null
  }) {
    const expense = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      depth: 2,
      overrideAccess: true,
    })

    if (!expense) {
      throw new APIError('Expense not found.', 404)
    }

    if (expense.status === 'posted') {
      return expense
    }

    const totals = await this.calculateTotals(payload, expense)
    const expenseAccountId = getRelationshipId(expense.expenseAccount)

    if (!expenseAccountId) {
      throw new APIError('Expense account is required before posting an expense.', 400)
    }

    const paymentAccountId =
      getRelationshipId(expense.paymentAccount) ||
      (typeof expense.bankAccount === 'object' && expense.bankAccount !== null
        ? getRelationshipId(expense.bankAccount.ledgerAccount) || getRelationshipId(expense.bankAccount)
        : getRelationshipId(expense.bankAccount))

    if (!paymentAccountId) {
      throw new APIError('A payment account or bank account is required before posting an expense.', 400)
    }

    const journalLines = [
      {
        account: expenseAccountId,
        description: expense.notes || `Expense ${expense.expenseNumber || expenseId}`,
        debit: totals.subtotal,
        credit: 0,
      },
    ]

    if (totals.taxTotal > 0) {
      const taxCode = await AccountingCommercialService.resolveTaxCode(payload, expense.taxCode)
      const taxAccountId =
        getRelationshipId(taxCode?.purchaseAccount) ||
        (await AccountingCommercialService.getDefaultAccountId(payload, 'defaultInputTaxAccount'))

      journalLines.push({
        account: taxAccountId,
        description: `Input tax for expense ${expense.expenseNumber || expenseId}`,
        debit: totals.taxTotal,
        credit: 0,
      })
    }

    journalLines.push({
      account: paymentAccountId,
      description: `Cash or bank credit for expense ${expense.expenseNumber || expenseId}`,
      debit: 0,
      credit: totals.total,
    })

    const journalEntry = await AccountingManualWorkflowService.createStructuredJournal({
      payload,
      userId,
      sourceType: 'system',
      entryDate: expense.expenseDate || expense.postingDate,
      postingDate: expense.postingDate || expense.expenseDate,
      memo: expense.notes || `Expense ${expense.expenseNumber || expenseId}`,
      referenceNumber: expense.expenseNumber || undefined,
      sourceReference: expense.expenseNumber || undefined,
      autoPost: true,
      lines: journalLines,
    })

    const fiscalYearId = getRelationshipId(journalEntry.fiscalYear)
    const periodId = getRelationshipId(journalEntry.period)

    return payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
      id: expenseId,
      overrideAccess: true,
      data: {
        status: 'posted',
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        fiscalYear: typeof fiscalYearId === 'number' ? fiscalYearId : undefined,
        period: typeof periodId === 'number' ? periodId : undefined,
        postedJournalEntry: journalEntry.id,
      },
      depth: 2,
    })
  }
}
