import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertMutablePaymentMade,
  assertPaymentMadeMutationPayload,
  buildPaymentMadeDetailContext,
  computePaymentMadeDeleteBarriers,
  normalizePaymentMadeMutationBody,
  type PaymentMadeDoc,
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

    await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json(await buildPaymentMadeDetailContext(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const currentPaymentMade = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })) as PaymentMadeDoc

    assertMutablePaymentMade(currentPaymentMade)

    const body = normalizePaymentMadeMutationBody((await request.json()) as Record<string, unknown>)
    await assertPaymentMadeMutationPayload(payload, body)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      id: params.id,
      overrideAccess: true,
      data: {
        ...body,
        status: 'draft',
        updatedBy: user.id,
      } as never,
      depth: 2,
    })

    return NextResponse.json(await buildPaymentMadeDetailContext(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const currentPaymentMade = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })) as PaymentMadeDoc

    const barriers = await computePaymentMadeDeleteBarriers(payload, currentPaymentMade)
    if (barriers.length > 0) {
      throw new Error(
        `Cannot delete payment made: ${barriers.join(', ')}. Remove all linked references before deleting.`,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
