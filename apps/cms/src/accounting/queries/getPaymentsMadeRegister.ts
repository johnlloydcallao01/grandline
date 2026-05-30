import type { Payload } from 'payload'
import { AccountingExpenseReportService } from '../services/reports/AccountingExpenseReportService'

export const getPaymentsMadeRegister = async (payload: Payload) =>
  AccountingExpenseReportService.getPaymentsMadeRegister(payload)
