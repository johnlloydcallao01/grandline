import type { Payload } from 'payload'
import { AccountingSalesReportService } from '../services/reports/AccountingSalesReportService'

export const getPaymentsReceivedRegister = async (payload: Payload) =>
  AccountingSalesReportService.getPaymentsReceivedRegister(payload)
