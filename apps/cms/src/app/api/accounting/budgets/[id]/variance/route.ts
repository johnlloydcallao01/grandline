import { NextRequest, NextResponse } from 'next/server'
import { getBudgetVsActual } from '@/accounting/queries/getBudgetVsActual'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const result = await getBudgetVsActual(payload, params.id)
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
