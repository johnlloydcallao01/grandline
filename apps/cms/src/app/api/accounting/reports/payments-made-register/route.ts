import { NextRequest, NextResponse } from 'next/server'
import { getPaymentsMadeRegister } from '@/accounting/queries/getPaymentsMadeRegister'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getPaymentsMadeRegister(payload)
    return NextResponse.json({ rows, totalRows: rows.length })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
