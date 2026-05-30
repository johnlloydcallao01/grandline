import { NextRequest, NextResponse } from 'next/server'
import { AccountingReceiptService } from '@/accounting/services/receipts/AccountingReceiptService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const body = await request.json().catch(() => ({}))
    const receipt = await AccountingReceiptService.issueReceipt({
      payload,
      paymentId: params.id,
      proofDocument: body?.proofDocument,
      notes: body?.notes,
      userId: user.id,
    })
    return NextResponse.json(receipt)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
