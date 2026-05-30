import { NextRequest, NextResponse } from 'next/server'
import { AccountingFixedAssetService } from '@/accounting/services/assets/AccountingFixedAssetService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const result = await AccountingFixedAssetService.ensureDepreciationSchedule({
      payload,
      assetId: params.id,
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
