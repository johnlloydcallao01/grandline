import { NextRequest, NextResponse } from 'next/server'
import { AccountingVendorCreditService } from '@/accounting/services/bills/AccountingVendorCreditService'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { buildVendorCreditsDetailContext } from '../../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const params = await context.params

    await AccountingVendorCreditService.postVendorCredit({
      payload,
      vendorCreditId: params.id,
      userId: user.id,
    })

    return NextResponse.json(await buildVendorCreditsDetailContext(payload, params.id))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
