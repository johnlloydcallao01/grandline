import { NextRequest, NextResponse } from 'next/server'
import { AccountingLmsRefundService } from '@/accounting/services/refunds/AccountingLmsRefundService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const refund = await AccountingLmsRefundService.processRefund({
      payload,
      refundId: params.id,
      userId: user.id,
    })
    return NextResponse.json(refund)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
