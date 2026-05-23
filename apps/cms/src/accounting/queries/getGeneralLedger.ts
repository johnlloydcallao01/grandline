import type { Payload } from 'payload'
import { AccountingLedgerReportService } from '../services/reports/AccountingLedgerReportService'

type GetGeneralLedgerArgs = Parameters<typeof AccountingLedgerReportService.getGeneralLedger>[1]

export const getGeneralLedger = async (payload: Payload, args: GetGeneralLedgerArgs = {}) =>
  AccountingLedgerReportService.getGeneralLedger(payload, args)
