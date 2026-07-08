import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = await request.json()
    const recordId = parseNumberParam(id) || id

    await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      id: recordId,
      depth: 0,
      overrideAccess: true,
    })

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = { updatedBy: user.id }
    if ('fixedAsset' in body) data.fixedAsset = toId(body.fixedAsset)
    if ('fiscalYear' in body) data.fiscalYear = toId(body.fiscalYear)
    if ('period' in body) data.period = toId(body.period)
    if ('depreciationDate' in body) data.depreciationDate = body.depreciationDate
    if ('amount' in body) data.amount = Number(body.amount)
    if ('status' in body) data.status = String(body.status)
    if ('notes' in body) data.notes = body.notes !== '' ? String(body.notes).trim() : null

    if ('fixedAsset' in data && !data.fixedAsset) throw new AccountingApiError('Fixed asset is required.', 400)
    if ('fiscalYear' in data && !data.fiscalYear) throw new AccountingApiError('Fiscal year is required.', 400)
    if ('period' in data && !data.period) throw new AccountingApiError('Period is required.', 400)
    if ('depreciationDate' in data && !data.depreciationDate) throw new AccountingApiError('Depreciation date is required.', 400)
    if ('amount' in data && Number(data.amount) <= 0) throw new AccountingApiError('Amount must be greater than 0.', 400)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      id: recordId,
      depth: 1,
      overrideAccess: true,
      data: data as never,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const recordId = parseNumberParam(id) || id

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
      id: recordId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
