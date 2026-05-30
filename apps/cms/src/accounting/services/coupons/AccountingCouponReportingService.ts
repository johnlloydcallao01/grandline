import type { Payload } from 'payload'
import type { AccountingCouponRevenueImpactRow } from '../../types/accounting'
import { findAllDocs } from '../../utils/findAllDocs'
import { getRelationshipId } from '../../utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '../../utils/amounts'

export class AccountingCouponReportingService {
  static async getCouponRevenueImpact(payload: Payload): Promise<AccountingCouponRevenueImpactRow[]> {
    const links = await findAllDocs<any>({
      payload,
      collection: 'accounting-enrollment-billing-links',
      depth: 1,
      where: {
        couponDiscountSnapshot: {
          greater_than: 0,
        },
      },
      sort: 'sourceReference',
    })

    const rows = new Map<string, AccountingCouponRevenueImpactRow>()

    for (const link of links) {
      const couponId = getRelationshipId(link?.metadata?.pricingBreakdown?.couponId) || getRelationshipId(link?.metadata?.couponId)
      const couponCode = String(link?.metadata?.couponCode || link?.metadata?.pricingBreakdown?.couponCode || '').trim() || null
      const key = String(couponId || couponCode || 'unknown')
      const current = rows.get(key) || {
        couponId: couponId || null,
        couponCode,
        enrollmentCount: 0,
        grossRevenue: 0,
        couponDiscountAmount: 0,
        netRevenue: 0,
      }

      current.enrollmentCount += 1
      current.grossRevenue = roundCurrency(current.grossRevenue + normalizeAmount(link.salePriceSnapshot))
      current.couponDiscountAmount = roundCurrency(
        current.couponDiscountAmount + normalizeAmount(link.couponDiscountSnapshot),
      )
      current.netRevenue = roundCurrency(current.netRevenue + normalizeAmount(link.finalChargeSnapshot))

      rows.set(key, current)
    }

    return Array.from(rows.values()).sort((left, right) => right.netRevenue - left.netRevenue)
  }
}
