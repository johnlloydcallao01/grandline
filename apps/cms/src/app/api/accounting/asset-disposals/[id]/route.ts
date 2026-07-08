import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
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
    if ('disposalDate' in body) data.disposalDate = body.disposalDate
    if ('disposalType' in body) data.disposalType = String(body.disposalType)
    if ('proceedsAmount' in body) data.proceedsAmount = Number(body.proceedsAmount ?? 0)
    if ('bookValueAtDisposal' in body) data.bookValueAtDisposal = Number(body.bookValueAtDisposal ?? 0)
    if ('gainOrLossAmount' in body) data.gainOrLossAmount = Number(body.gainOrLossAmount ?? 0)
    if ('proceedsAccount' in body) data.proceedsAccount = toId(body.proceedsAccount)
    if ('gainAccount' in body) data.gainAccount = toId(body.gainAccount)
    if ('lossAccount' in body) data.lossAccount = toId(body.lossAccount)
    if ('status' in body) data.status = String(body.status)
    if ('notes' in body) data.notes = body.notes !== '' ? String(body.notes).trim() : null

    if ('fixedAsset' in data && !data.fixedAsset) throw new AccountingApiError('Fixed asset is required.', 400)
    if ('disposalDate' in data && !data.disposalDate) throw new AccountingApiError('Disposal date is required.', 400)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
      id: recordId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
