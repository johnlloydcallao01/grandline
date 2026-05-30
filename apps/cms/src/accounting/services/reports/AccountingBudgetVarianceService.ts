import type { Payload } from 'payload'
import { AccountingBudgetService } from '../budgets/AccountingBudgetService'

export class AccountingBudgetVarianceService {
  static async getBudgetVariance(payload: Payload, budgetId: number | string) {
    return AccountingBudgetService.getBudgetVsActual(payload, budgetId)
  }
}
