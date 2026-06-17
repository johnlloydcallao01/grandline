import { NextRequest, NextResponse } from 'next/server'
import { AccountingBillService } from '@/accounting/services/bills/AccountingBillService'
import { buildBillDetailResponse, type BillDoc } from '../../_shared'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const bill = await AccountingBillService.postBill({
      payload,
      billId: id,
      userId: user.id,
    })

    return NextResponse.json(await buildBillDetailResponse(payload, bill as BillDoc))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
