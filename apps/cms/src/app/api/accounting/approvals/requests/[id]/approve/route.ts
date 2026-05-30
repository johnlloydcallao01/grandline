import { NextRequest, NextResponse } from 'next/server'
import { AccountingApprovalService } from '@/accounting/services/approvals/AccountingApprovalService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json().catch(() => ({}))
    const params = await context.params
    const result = await AccountingApprovalService.approveRequest({
      payload,
      approvalRequestId: params.id,
      approverUserId: user.id,
      notes: body?.notes,
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
