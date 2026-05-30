import { NextRequest, NextResponse } from 'next/server'
import { AccountingBillService } from '@/accounting/services/bills/AccountingBillService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const bill = await AccountingBillService.postBill({
      payload,
      billId: params.id,
      userId: user.id,
    })

    return NextResponse.json(bill)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
