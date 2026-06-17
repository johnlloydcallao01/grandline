import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertPaymentMutationPayload,
  buildPaymentDetailResponse,
  normalizePaymentMutationBody,
  type PaymentDoc,
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

    const payment = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })) as PaymentDoc

    return NextResponse.json(buildPaymentDetailResponse(payment))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const paymentId = params.id

    const currentPayment = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      depth: 0,
      overrideAccess: true,
    })) as PaymentDoc

    AccountingCommercialService.assertMutableStatus(currentPayment.status, 'Payment receipt')

    const body = normalizePaymentMutationBody(await request.json())
    await assertPaymentMutationPayload(payload, body)

    const updatedPayment = (await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      overrideAccess: true,
      data: {
        ...body,
        status: 'draft',
        updatedBy: user.id,
      } as never,
      depth: 2,
    })) as PaymentDoc

    return NextResponse.json(buildPaymentDetailResponse(updatedPayment))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const paymentId = params.id

    const currentPayment = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      depth: 0,
      overrideAccess: true,
    })) as PaymentDoc

    AccountingCommercialService.assertMutableStatus(currentPayment.status, 'Payment receipt')

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsReceived,
      id: paymentId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
