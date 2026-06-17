import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingReceiptService } from '@/accounting/services/receipts/AccountingReceiptService'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
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

    if (String(currentReceipt.status || '') !== 'draft') {
      throw new Error('Only draft official receipts can be issued.')
    }

    const paymentId = getRelationshipId(currentReceipt.paymentReceived)
    if (!paymentId) {
      throw new Error('Official receipt must be linked to a payment received record.')
    }

    const issuedReceipt = (await AccountingReceiptService.issueReceipt({
      payload,
      paymentId,
      proofDocument: getRelationshipId(currentReceipt.proofDocument) || undefined,
      notes: currentReceipt.notes || undefined,
      userId: user.id,
    })) as ReceiptDoc

    return NextResponse.json(buildReceiptDetailResponse(issuedReceipt))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
