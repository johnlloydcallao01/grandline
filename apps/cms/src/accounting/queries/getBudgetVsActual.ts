import type { Payload } from 'payload'
import { AccountingBudgetVarianceService } from '../services/reports/AccountingBudgetVarianceService'

export const getBudgetVsActual = async (payload: Payload, budgetId: number | string) =>
  AccountingBudgetVarianceService.getBudgetVariance(payload, budgetId)
