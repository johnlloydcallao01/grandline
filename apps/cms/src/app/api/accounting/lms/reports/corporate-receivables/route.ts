import { NextRequest, NextResponse } from 'next/server'
import { getCorporateReceivables } from '@/accounting/queries/getCorporateReceivables'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getCorporateReceivables(payload)
    return NextResponse.json(rows)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
