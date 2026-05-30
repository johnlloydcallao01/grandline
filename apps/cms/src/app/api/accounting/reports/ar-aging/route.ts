import { NextRequest, NextResponse } from 'next/server'
import { getAccountsReceivableAging } from '@/accounting/queries/getAccountsReceivableAging'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getAccountsReceivableAging(payload)
    return NextResponse.json({ rows, totalRows: rows.length })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
