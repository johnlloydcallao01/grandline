import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertMutableReceipt,
  buildReceiptDetailResponse,
  buildReceiptMutationData,
  normalizeReceiptMutationBody,
  type ReceiptDoc,
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

    const receipt = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })) as ReceiptDoc

    return NextResponse.json(buildReceiptDetailResponse(receipt))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const receiptId = params.id

    const currentReceipt = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: receiptId,
      depth: 0,
      overrideAccess: true,
    })) as ReceiptDoc

    assertMutableReceipt(currentReceipt.status)

    const body = normalizeReceiptMutationBody(await request.json())
    const { data } = await buildReceiptMutationData(payload, body, receiptId)

    const updatedReceipt = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: receiptId,
      overrideAccess: true,
      data: {
        ...data,
        updatedBy: user.id,
      } as never,
      depth: 2,
    })) as ReceiptDoc

    return NextResponse.json(buildReceiptDetailResponse(updatedReceipt))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const receiptId = params.id

    const currentReceipt = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: receiptId,
      depth: 0,
      overrideAccess: true,
    })) as ReceiptDoc

    assertMutableReceipt(currentReceipt.status)

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.receipts,
      id: receiptId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
