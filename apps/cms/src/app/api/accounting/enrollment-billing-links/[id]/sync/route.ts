import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Enrollment billing link not found', 404)

    return NextResponse.json({
      id: String(existing.id),
      sourceReference: String(existing.sourceReference || `BL-${existing.id}`),
      billingStatus: String(existing.billingStatus || 'not_started'),
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
