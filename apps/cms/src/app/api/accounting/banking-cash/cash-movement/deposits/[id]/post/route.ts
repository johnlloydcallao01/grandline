import { NextRequest, NextResponse } from 'next/server'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../../_utils/auth'
import { buildDepositDetailResponse, type DepositDoc } from '../../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const record = (await AccountingBankingService.postDeposit({
      payload,
      depositId: params.id,
      userId: user.id,
    })) as DepositDoc

    return NextResponse.json(await buildDepositDetailResponse(payload, record))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
