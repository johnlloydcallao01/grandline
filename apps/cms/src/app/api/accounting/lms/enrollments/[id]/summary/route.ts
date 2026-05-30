import { NextRequest, NextResponse } from 'next/server'
import { getEnrollmentFinanceSummary } from '@/accounting/queries/getEnrollmentFinanceSummary'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const summary = await getEnrollmentFinanceSummary(payload, params.id)
    return NextResponse.json(summary)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
