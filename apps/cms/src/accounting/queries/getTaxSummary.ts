import type { Payload } from 'payload'
import { AccountingTaxReportService } from '../services/reports/AccountingTaxReportService'

export const getTaxSummary = async (payload: Payload) =>
  AccountingTaxReportService.getTaxSummary(payload)
