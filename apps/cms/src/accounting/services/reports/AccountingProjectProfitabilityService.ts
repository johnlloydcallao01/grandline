import { APIError, type Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '../../constants/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'
import { AccountingTimeTrackingService } from '../time/AccountingTimeTrackingService'

export class AccountingProjectProfitabilityService {
  static async getProjectProfitability(payload: Payload, projectId: number | string) {
    const project = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.projects,
      id: projectId,
      depth: 2,
      overrideAccess: true,
    })

    if (!project) {
      throw new APIError('Project not found.', 404)
    }

    const [invoices, expenses, payrollEntries, timeEntries, budgets] = await Promise.all([
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.invoices,
        depth: 0,
        where: {
          and: [
            { project: { equals: projectId } },
            { status: { in: ['posted', 'partially_paid', 'paid'] } as any },
          ],
        },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.expenses,
        depth: 0,
        where: {
          and: [
            { project: { equals: projectId } },
            { status: { equals: 'posted' } },
          ],
        },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.payrollEntries,
        depth: 0,
        where: {
          and: [
            { project: { equals: projectId } },
            { status: { in: ['approved', 'posted'] } as any },
          ],
        },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.timeEntries,
        depth: 0,
        where: {
          and: [
            { project: { equals: projectId } },
            { status: { in: ['approved', 'posted'] } as any },
          ],
        },
      }),
      findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.budgets,
        depth: 0,
        where: {
          project: {
            equals: projectId,
          },
        },
      }),
    ])

    const revenue = roundCurrency(invoices.reduce((sum, invoice) => sum + normalizeAmount(invoice.total), 0))
    const expenseCost = roundCurrency(expenses.reduce((sum, expense) => sum + normalizeAmount(expense.total), 0))
    const payrollCost = roundCurrency(
      payrollEntries.reduce((sum, entry) => sum + normalizeAmount(entry.netAmount), 0),
    )

    const timeSummary = timeEntries.reduce(
      (summary, entry) => {
        const financials = AccountingTimeTrackingService.getEntryFinancials(entry)
        return {
          totalHours: roundCurrency(summary.totalHours + financials.decimalHours),
          billableValue: roundCurrency(summary.billableValue + financials.billableAmount),
          timeCost: roundCurrency(summary.timeCost + financials.costAmount),
        }
      },
      { totalHours: 0, billableValue: 0, timeCost: 0 },
    )

    const budgetAmount = roundCurrency(
      budgets.reduce((sum, budget) => sum + normalizeAmount(budget.budgetAmount), 0) +
        (normalizeAmount(project.budgetAmount) || 0),
    )
    const totalCost = roundCurrency(expenseCost + payrollCost + timeSummary.timeCost)
    const grossProfit = roundCurrency(revenue - totalCost)
    const grossMarginPercent = revenue > 0 ? roundCurrency((grossProfit / revenue) * 100) : 0

    return {
      projectId: project.id,
      projectCode: project.projectCode,
      name: project.name,
      status: project.status,
      revenue,
      directExpenseCost: expenseCost,
      payrollCost,
      timeCost: timeSummary.timeCost,
      totalTrackedHours: timeSummary.totalHours,
      billableTimeValue: timeSummary.billableValue,
      totalCost,
      grossProfit,
      grossMarginPercent,
      budgetAmount,
      budgetVarianceAmount: roundCurrency(grossProfit - budgetAmount),
    }
  }
}
