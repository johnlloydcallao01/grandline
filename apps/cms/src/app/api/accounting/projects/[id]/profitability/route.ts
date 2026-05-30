import { NextRequest, NextResponse } from 'next/server'
import { getProjectProfitability } from '@/accounting/queries/getProjectProfitability'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const result = await getProjectProfitability(payload, params.id)
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
