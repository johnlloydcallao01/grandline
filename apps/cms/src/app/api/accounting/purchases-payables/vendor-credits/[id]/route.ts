import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'
import {
  assertMutableVendorCredit,
  assertVendorCreditMutationPayload,
  buildVendorCreditsDetailContext,
  normalizeVendorCreditMutationBody,
  type VendorCreditDoc,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json(await buildVendorCreditsDetailContext(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params
    const currentVendorCredit = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })) as VendorCreditDoc

    assertMutableVendorCredit(currentVendorCredit)

    const body = normalizeVendorCreditMutationBody(await request.json())
    await assertVendorCreditMutationPayload(payload, body)

    await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: params.id,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
      depth: 2,
    })

    return NextResponse.json(await buildVendorCreditsDetailContext(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const params = await context.params
    const currentVendorCredit = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: params.id,
      depth: 0,
      overrideAccess: true,
    })) as VendorCreditDoc

    const barriers: string[] = []
    const status = String(currentVendorCredit.status || '')

    if (['posted', 'partially_paid', 'paid', 'voided'].includes(status)) {
      barriers.push(`status is ${status.replace(/_/g, ' ')}`)
    }

    if (getRelationshipId(currentVendorCredit.postedJournalEntry)) {
      barriers.push('linked posted journal entry exists')
    }

    if (barriers.length > 0) {
      throw new Error(
        `Cannot delete vendor credit: ${barriers.join(', ')}. Only non-posted vendor credits without blocking links can be removed.`,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
