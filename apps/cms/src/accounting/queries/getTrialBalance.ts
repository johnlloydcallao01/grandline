import type { Payload } from 'payload'
import { AccountingTrialBalanceService } from '../services/reports/AccountingTrialBalanceService'

type GetTrialBalanceArgs = Parameters<typeof AccountingTrialBalanceService.getTrialBalance>[1]

export const getTrialBalance = async (payload: Payload, args: GetTrialBalanceArgs = {}) =>
  AccountingTrialBalanceService.getTrialBalance(payload, args)
