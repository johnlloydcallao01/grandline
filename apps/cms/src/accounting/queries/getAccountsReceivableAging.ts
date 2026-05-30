import type { Payload } from 'payload'
import { AccountingAgingReportService } from '../services/reports/AccountingAgingReportService'

export const getAccountsReceivableAging = async (payload: Payload) =>
  AccountingAgingReportService.getAccountsReceivableAging(payload)
