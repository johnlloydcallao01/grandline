import { NextRequest, NextResponse } from 'next/server'
import { AccountingTimeTrackingService } from '@/accounting/services/time/AccountingTimeTrackingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const result = await AccountingTimeTrackingService.submitTimesheet({
      payload,
      timesheetId: params.id,
      userId: user.id,
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
