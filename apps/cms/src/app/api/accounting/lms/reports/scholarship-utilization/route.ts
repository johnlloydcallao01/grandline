import { NextRequest, NextResponse } from 'next/server'
import { getScholarshipUtilization } from '@/accounting/queries/getScholarshipUtilization'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getScholarshipUtilization(payload)
    return NextResponse.json(rows)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
