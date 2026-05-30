import type { Payload } from 'payload'
import { AccountingProjectProfitabilityService } from '../services/reports/AccountingProjectProfitabilityService'

export const getProjectProfitability = async (payload: Payload, projectId: number | string) =>
  AccountingProjectProfitabilityService.getProjectProfitability(payload, projectId)
