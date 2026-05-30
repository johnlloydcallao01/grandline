import type { Payload } from 'payload'
import { AccountingAgingReportService } from '../services/reports/AccountingAgingReportService'

export const getAccountsPayableAging = async (payload: Payload) =>
  AccountingAgingReportService.getAccountsPayableAging(payload)
