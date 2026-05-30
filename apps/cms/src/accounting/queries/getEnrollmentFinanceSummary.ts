import type { Payload } from 'payload'
import { AccountingEnrollmentBillingService } from '../services/enrollment-billing/AccountingEnrollmentBillingService'

export const getEnrollmentFinanceSummary = async (
  payload: Payload,
  enrollmentId: number | string,
) => AccountingEnrollmentBillingService.getEnrollmentFinanceSummary(payload, enrollmentId)
