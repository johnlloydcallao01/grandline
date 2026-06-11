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
          { entryNumber: { contains: search } },
          { sourceReference: { contains: search } },
          { memo: { contains: search } },
        ],
      } as never
    }

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.journalEntries,
      where,
      limit: 10000,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
    })

    const choices = result.docs.map((d) => {
      const doc = d as unknown as { entryNumber?: string; sourceReference?: string; memo?: string }
      const label = [doc.entryNumber, doc.sourceReference, doc.memo ? `(${doc.memo.slice(0, 40)})` : ''].filter(Boolean).join(' ')
      return { value: d.id, label }
    })

    return NextResponse.json({ choices })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
