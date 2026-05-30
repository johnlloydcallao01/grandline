import { NextRequest, NextResponse } from 'next/server'
import { AccountingInstructorCostService } from '@/accounting/services/instructor-costs/AccountingInstructorCostService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()
    const payout = await AccountingInstructorCostService.generatePayout({
      payload,
      courseId: params.id,
      periodStart: body?.periodStart,
      periodEnd: body?.periodEnd,
    })
    return NextResponse.json(payout)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
