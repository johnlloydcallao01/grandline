import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '@/app/api/accounting/_utils/auth'
import {
  buildCustomerBalanceDetailResponse,
  type CustomerBalanceCustomerDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const customerId = parseNumberParam(id) || id

    const customer = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      id: customerId,
      depth: 1,
      overrideAccess: true,
    })) as CustomerBalanceCustomerDoc

    return NextResponse.json(await buildCustomerBalanceDetailResponse(payload, customer))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
