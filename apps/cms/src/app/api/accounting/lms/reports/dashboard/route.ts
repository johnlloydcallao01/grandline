import { NextRequest, NextResponse } from 'next/server'
import { AccountingLmsDashboardService } from '@/accounting/services/reports/AccountingLmsDashboardService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const dashboard = await AccountingLmsDashboardService.getDashboard(payload)
    return NextResponse.json(dashboard)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
