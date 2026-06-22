import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { buildCashFlowDetailResponse, getCashFlowAccountId } from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const accountId = getCashFlowAccountId(params.id)

    return NextResponse.json(await buildCashFlowDetailResponse(payload, accountId))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
