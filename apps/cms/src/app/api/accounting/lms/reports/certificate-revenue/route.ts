import { NextRequest, NextResponse } from 'next/server'
import { getCertificateRevenue } from '@/accounting/queries/getCertificateRevenue'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const rows = await getCertificateRevenue(payload)
    return NextResponse.json(rows)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
