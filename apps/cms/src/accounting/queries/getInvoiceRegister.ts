import type { Payload } from 'payload'
import { AccountingSalesReportService } from '../services/reports/AccountingSalesReportService'

export const getInvoiceRegister = async (payload: Payload) =>
  AccountingSalesReportService.getInvoiceRegister(payload)
