import type { Payload } from 'payload'
import { AccountingCashReportService } from '../services/reports/AccountingCashReportService'

export const getCashActivity = async (payload: Payload) =>
  AccountingCashReportService.getCashActivity(payload)
