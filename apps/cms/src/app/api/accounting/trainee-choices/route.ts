import { NextRequest, NextResponse } from 'next/server'
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
          { srn: { contains: search } } as never,
        ],
      } as never
    }

    const result = await payload.find({
      collection: 'trainees',
      where,
      limit: 10000,
      sort: 'srn',
      depth: 1,
      overrideAccess: true,
    })

    const choices = result.docs.map((d) => {
      const doc = d as unknown as { user?: Record<string, unknown>; srn?: string; id: unknown }
      const user = doc.user
      const userName = user ? String((user as { email?: string; name?: string }).email || (user as { name?: string }).name || '') : ''
      const srn = doc.srn || ''
      const label = srn ? `${srn} — ${userName}` : userName || `Trainee #${doc.id}`
      return { value: doc.id, label }
    })

    return NextResponse.json({ choices })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
