import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  buildExpenseApprovalDetailResponse,
  type ExpenseApprovalRequestDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const requestRecord = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.approvalRequests,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })) as unknown as ExpenseApprovalRequestDoc

    if (String(requestRecord.entityType || '') !== 'expense') {
      throw new Error('Approval request is not linked to an expense.')
    }

    return NextResponse.json(
      await buildExpenseApprovalDetailResponse({
        payload,
        request: requestRecord,
      }),
    )
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
