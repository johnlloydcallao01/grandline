import { NextRequest, NextResponse } from 'next/server'
import { AccountingRevenueRecognitionService } from '@/accounting/services/revenue-recognition/AccountingRevenueRecognitionService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json().catch(() => ({}))
    const trigger =
      body?.trigger === 'activation' || body?.trigger === 'completion' || body?.trigger === 'certificate_issued'
        ? body.trigger
        : 'completion'

    const schedule = await AccountingRevenueRecognitionService.processEnrollmentRecognitionTrigger({
      payload,
      enrollmentId: params.id,
      trigger,
    })

    return NextResponse.json(schedule)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
