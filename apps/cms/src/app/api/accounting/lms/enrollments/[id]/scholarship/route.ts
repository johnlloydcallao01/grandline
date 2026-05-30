import { NextRequest, NextResponse } from 'next/server'
import { AccountingScholarshipService } from '@/accounting/services/scholarships/AccountingScholarshipService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json()
    const award = await AccountingScholarshipService.applyScholarshipAward({
      payload,
      enrollmentId: params.id,
      sponsorId: body?.sponsorId,
      awardType: body?.awardType || 'partial',
      awardAmount: body?.awardAmount,
      awardPercent: body?.awardPercent,
      notes: body?.notes,
    })
    return NextResponse.json(award)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
