import type { Payload } from 'payload'
import { AccountingDashboardService } from '../services/reports/AccountingDashboardService'

export const getDashboard = async (payload: Payload) =>
  AccountingDashboardService.getDashboard(payload)
