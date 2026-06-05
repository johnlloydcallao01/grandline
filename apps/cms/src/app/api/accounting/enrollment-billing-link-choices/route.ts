import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let where = {} as never
    if (search) {
      where = {
        or: [
          { sourceReference: { contains: search } } as never,
        ],
      } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      where,
      limit: 10000,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
    })

    const choices = result.docs.map((d) => ({
      value: d.id,
      label: (d as unknown as { sourceReference?: string }).sourceReference || `Billing Link #${d.id}`,
    }))

    return NextResponse.json({ choices })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
