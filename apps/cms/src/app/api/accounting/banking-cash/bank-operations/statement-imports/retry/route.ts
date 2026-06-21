import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { type StatementImportDoc } from '../_shared'

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = ((await request.json().catch(() => ({}))) || {}) as { ids?: Array<string | number> }
    const requestedIds = Array.isArray(body.ids)
      ? Array.from(new Set(body.ids.map((value) => String(value || '').trim()).filter(Boolean)))
      : []

    if (requestedIds.length === 0) {
      return NextResponse.json({ success: true, retriedCount: 0 })
    }

    let retriedCount = 0
    for (const id of requestedIds) {
      const currentRecord = (await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
        id,
        depth: 0,
        overrideAccess: true,
      })) as StatementImportDoc

      const currentStatus = String(currentRecord.importStatus || '')
      if (!['parse_error', 'reupload_required'].includes(currentStatus)) continue

      await payload.update({
        collection: ACCOUNTING_COLLECTION_SLUGS.bankStatementImports,
        id,
        overrideAccess: true,
        depth: 0,
        data: {
          importStatus: 'queued',
          parseErrorSummary: null,
          updatedBy: user.id,
        } as never,
      })

      retriedCount += 1
    }

    return NextResponse.json({ success: true, retriedCount })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
