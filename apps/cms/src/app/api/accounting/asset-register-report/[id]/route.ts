import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      id: parseNumberParam(id) || id,
      depth: 2,
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

    const data: Record<string, unknown> = { updatedBy: user.id }

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    if ('name' in body) data.name = String(body.name).trim()
    if ('assetCategory' in body) data.assetCategory = String(body.assetCategory)
    if ('purchaseDate' in body) data.purchaseDate = body.purchaseDate
    if ('inServiceDate' in body) data.inServiceDate = body.inServiceDate !== '' ? body.inServiceDate : null
    if ('cost' in body) data.cost = Number(body.cost)
    if ('salvageValue' in body) data.salvageValue = Number(body.salvageValue)
    if ('usefulLifeMonths' in body) data.usefulLifeMonths = Number(body.usefulLifeMonths)
    if ('depreciationMethod' in body) data.depreciationMethod = String(body.depreciationMethod)
    if ('status' in body) data.status = String(body.status)
    if ('assetCode' in body) data.assetCode = String(body.assetCode).trim()
    if ('notes' in body) data.notes = body.notes !== '' ? String(body.notes).trim() : null

    const mapRel = (key: string) => { if (key in body) return toId(body[key]); return undefined }
    const expenseAccount = mapRel('expenseAccount')
    const assetAccount = mapRel('assetAccount')
    const accumDeprAccount = mapRel('accumulatedDepreciationAccount')
    const branch = mapRel('branch')
    const department = mapRel('department')
    const location = mapRel('location')

    if (expenseAccount !== undefined) data.expenseAccount = expenseAccount
    if (assetAccount !== undefined) data.assetAccount = assetAccount
    if (accumDeprAccount !== undefined) data.accumulatedDepreciationAccount = accumDeprAccount
    if (branch !== undefined) data.branch = branch
    if (department !== undefined) data.department = department
    if (location !== undefined) data.location = location

    if ('name' in data && !data.name) throw new AccountingApiError('Asset name is required.', 400)
    if ('cost' in data && Number(data.cost) <= 0) throw new AccountingApiError('Cost must be greater than 0.', 400)
    if ('usefulLifeMonths' in data && Number(data.usefulLifeMonths) < 1) throw new AccountingApiError('Useful life must be at least 1 month.', 400)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
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

    const [deprCount, dispCount] = await Promise.all([
      payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.depreciationEntries,
        where: { fixedAsset: { equals: recordId } } as never,
        overrideAccess: true,
      }),
      payload.count({
        collection: ACCOUNTING_COLLECTION_SLUGS.assetDisposals,
        where: { fixedAsset: { equals: recordId } } as never,
        overrideAccess: true,
      }),
    ])

    const barriers: string[] = []
    if (deprCount.totalDocs > 0) barriers.push(`referenced by ${deprCount.totalDocs} depreciation entr(ies)`)
    if (dispCount.totalDocs > 0) barriers.push(`referenced by ${dispCount.totalDocs} disposal record(s)`)

    if (barriers.length > 0) {
      throw new AccountingApiError(`Cannot delete asset: ${barriers.join(', ')}. Remove all references before deleting.`, 409)
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.fixedAssets,
      id: recordId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
