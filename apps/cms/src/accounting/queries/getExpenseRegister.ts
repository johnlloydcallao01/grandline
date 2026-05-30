import type { Payload } from 'payload'
import { AccountingExpenseReportService } from '../services/reports/AccountingExpenseReportService'

export const getExpenseRegister = async (payload: Payload) =>
  AccountingExpenseReportService.getExpenseRegister(payload)
