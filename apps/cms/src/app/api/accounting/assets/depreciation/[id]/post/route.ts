import { NextRequest, NextResponse } from 'next/server'
import { AccountingDepreciationService } from '@/accounting/services/assets/AccountingDepreciationService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const result = await AccountingDepreciationService.postDepreciationEntry({
      payload,
      depreciationEntryId: params.id,
      userId: user.id,
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
