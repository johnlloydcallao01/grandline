import { NextRequest, NextResponse } from 'next/server'
import { getCompletionToRevenue } from '@/accounting/queries/getCompletionToRevenue'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getCompletionToRevenue(payload)
    return NextResponse.json(rows)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
