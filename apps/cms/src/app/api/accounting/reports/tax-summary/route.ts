import { NextRequest, NextResponse } from 'next/server'
import { getTaxSummary } from '@/accounting/queries/getTaxSummary'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getTaxSummary(payload)
    return NextResponse.json({ rows, totalRows: rows.length })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
