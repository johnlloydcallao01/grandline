import { NextRequest, NextResponse } from 'next/server'
import { getApprovalQueue } from '@/accounting/queries/getApprovalQueue'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const approverUserId = parseNumberParam(request.nextUrl.searchParams.get('approverUserId'))
    const result = await getApprovalQueue(payload, approverUserId)
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
