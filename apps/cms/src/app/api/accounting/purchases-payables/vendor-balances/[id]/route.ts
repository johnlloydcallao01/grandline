import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '@/app/api/accounting/_utils/auth'
import {
  buildVendorBalanceDetailResponse,
  type VendorBalanceVendorDoc,
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
    const vendorId = parseNumberParam(id) || id

    const vendor = (await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.vendors,
      id: vendorId,
      depth: 1,
      overrideAccess: true,
    })) as VendorBalanceVendorDoc

    return NextResponse.json(await buildVendorBalanceDetailResponse(payload, vendor))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
