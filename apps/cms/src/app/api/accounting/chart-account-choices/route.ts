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
          { code: { contains: search } },
          { name: { contains: search } },
        ],
      } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.chartOfAccounts,
      where,
      limit: 10000,
      sort: 'code',
      depth: 0,
      overrideAccess: true,
    })

    const choices = result.docs.map((d) => {
      const doc = d as unknown as { code?: string; name?: string }
      return { value: d.id, label: `${doc.code || ''} — ${doc.name || ''}` }
    })

    return NextResponse.json({ choices })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
