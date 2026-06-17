import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingReceiptService } from '@/accounting/services/receipts/AccountingReceiptService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { buildReceiptDetailResponse, type ReceiptDoc } from '../../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    const currentReceipt = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })) as ReceiptDoc

    if (String(currentReceipt.status || '') !== 'issued') {
      throw new Error('Only issued official receipts can be voided.')
    }

    const voidedReceipt = (await AccountingReceiptService.voidReceipt({
      payload,
      receiptId: params.id,
      userId: user.id,
    })) as ReceiptDoc

    return NextResponse.json(buildReceiptDetailResponse(voidedReceipt))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
