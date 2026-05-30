import { NextRequest, NextResponse } from 'next/server'
import { getExpenseRegister } from '@/accounting/queries/getExpenseRegister'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getExpenseRegister(payload)
    return NextResponse.json({ rows, totalRows: rows.length })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
