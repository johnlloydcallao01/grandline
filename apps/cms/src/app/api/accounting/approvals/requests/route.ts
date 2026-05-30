import { NextRequest, NextResponse } from 'next/server'
import { AccountingApprovalService } from '@/accounting/services/approvals/AccountingApprovalService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    const result = await AccountingApprovalService.requestApproval({
      payload,
      entityType: body?.entityType,
      entityId: body?.entityId,
      workflowId: body?.workflowId,
      requestedBy: user.id,
      resolutionNotes: body?.notes,
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
