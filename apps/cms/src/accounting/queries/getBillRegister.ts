import type { Payload } from 'payload'
import { AccountingExpenseReportService } from '../services/reports/AccountingExpenseReportService'

export const getBillRegister = async (payload: Payload) =>
  AccountingExpenseReportService.getBillRegister(payload)
