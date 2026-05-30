import { NextRequest, NextResponse } from 'next/server'
import { AccountingPaymentMadeService } from '@/accounting/services/payments/AccountingPaymentMadeService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const record = await AccountingPaymentMadeService.postPayment({
      payload,
      paymentId: params.id,
      userId: user.id,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
