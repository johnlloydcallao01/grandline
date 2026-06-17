import { NextRequest, NextResponse } from 'next/server'
import { AccountingPaymentMadeService } from '@/accounting/services/payments/AccountingPaymentMadeService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { buildPaymentMadeDetailContext } from '../../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    await AccountingPaymentMadeService.postPayment({
      payload,
      paymentId: params.id,
      userId: user.id,
    })

    return NextResponse.json(await buildPaymentMadeDetailContext(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
