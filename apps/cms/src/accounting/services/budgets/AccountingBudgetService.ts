import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

const getNaturalSignedAmount = (line: any) => {
  const normalBalance = String(line?.account?.normalBalance || 'debit')
  const debit = normalizeAmount(line?.debit)
  const credit = normalizeAmount(line?.credit)
  return normalBalance === 'credit' ? roundCurrency(credit - debit) : roundCurrency(debit - credit)
}

export class AccountingBudgetService {
  static async getBudget(payload: Payload, budgetId: number | string) {
    return payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.budgets,
      id: budgetId,
      depth: 2,
      overrideAccess: true,
    })
  }

  static async getBudgetLines(payload: Payload, budgetId: number | string) {
    return findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.budgetLines,
      depth: 2,
      where: {
        budget: {
          equals: budgetId,
        },
      },
    })
  }

  static async getBudgetVsActual(payload: Payload, budgetId: number | string) {
    const budget = await this.getBudget(payload, budgetId)

    if (!budget) {
      throw new APIError('Budget not found.', 404)
    }

    const budgetLines = await this.getBudgetLines(payload, budgetId)
    const fiscalYearId = getRelationshipId(budget.fiscalYear)

    const journalLines = await findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntryLines,
      depth: 2,
    })

    const rows = budgetLines.map((line) => {
      const accountId = getRelationshipId(line.account)
      const periodId = getRelationshipId(line.period)
      const actualAmount = roundCurrency(
        journalLines.reduce((sum, journalLine) => {
          const lineAccountId = getRelationshipId(journalLine.account)
          const journalEntry = journalLine.journalEntry
          const journalFiscalYearId = getRelationshipId(journalEntry?.fiscalYear)
          const journalPeriodId = getRelationshipId(journalEntry?.period)
          const posted = String(journalEntry?.status || '') === 'posted'

          if (!posted || String(lineAccountId || '') !== String(accountId || '')) {
            return sum
          }

          if (fiscalYearId && String(journalFiscalYearId || '') !== String(fiscalYearId)) {
            return sum
          }

          if (periodId && String(journalPeriodId || '') !== String(periodId)) {
            return sum
          }

          return roundCurrency(sum + getNaturalSignedAmount(journalLine))
        }, 0),
      )

      const plannedAmount = normalizeAmount(line.plannedAmount)
      const varianceAmount = roundCurrency(actualAmount - plannedAmount)

      return {
        budgetLineId: line.id,
        accountId,
        accountCode: line.account?.accountCode || null,
        accountName: line.account?.name || null,
        periodId,
        plannedAmount,
        actualAmount,
        varianceAmount,
      }
    })

    const totals = rows.reduce(
      (summary, row) => ({
        plannedAmount: roundCurrency(summary.plannedAmount + row.plannedAmount),
        actualAmount: roundCurrency(summary.actualAmount + row.actualAmount),
        varianceAmount: roundCurrency(summary.varianceAmount + row.varianceAmount),
      }),
      { plannedAmount: 0, actualAmount: 0, varianceAmount: 0 },
    )

    return {
      budgetId: budget.id,
      budgetCode: budget.budgetCode,
      name: budget.name,
      status: budget.status,
      rows,
      totals,
    }
  }
}
