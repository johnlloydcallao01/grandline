import { NextRequest, NextResponse } from 'next/server'
import { getDashboard } from '@/accounting/queries/getDashboard'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const dashboard = await getDashboard(payload)
    return NextResponse.json(dashboard)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
