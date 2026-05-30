import { NextRequest, NextResponse } from 'next/server'
import { getCouponRevenueImpact } from '@/accounting/queries/getCouponRevenueImpact'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getCouponRevenueImpact(payload)
    return NextResponse.json(rows)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
