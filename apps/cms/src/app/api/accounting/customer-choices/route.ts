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
          { displayName: { contains: search } },
          { customerCode: { contains: search } },
        ],
      } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.customers,
      where,
      limit: 10000,
      sort: 'displayName',
      depth: 0,
      overrideAccess: true,
    })

    const choices = result.docs.map((d) => ({
      value: d.id,
      label: `${(d as unknown as { customerCode?: string }).customerCode || ''} — ${(d as unknown as { displayName?: string }).displayName || ''}`,
    }))

    return NextResponse.json({ choices })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
