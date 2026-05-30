import type { Payload } from 'payload'
import { AccountingCouponReportingService } from '../services/coupons/AccountingCouponReportingService'

export const getCouponRevenueImpact = async (payload: Payload) =>
  AccountingCouponReportingService.getCouponRevenueImpact(payload)
