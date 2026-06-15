import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  requireAccountingAdmin,
} from '../_utils/auth'

const mapBranchResponse = (record: Record<string, unknown>) => ({
  id: record.id,
  branchCode: typeof record.branchCode === 'string' ? record.branchCode : null,
  name: typeof record.name === 'string' ? record.name : null,
  status: typeof record.status === 'string' ? record.status : null,
  address: typeof record.address === 'string' ? record.address : null,
  notes: typeof record.notes === 'string' ? record.notes : null,
  createdBy: record.createdBy ?? null,
  updatedBy: record.updatedBy ?? null,
  createdAt: typeof record.createdAt === 'string' ? record.createdAt : null,
  updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null,
})

const normalizeBody = (body: Record<string, unknown>) => ({
  branchCode:
    typeof body.branchCode === 'string'
      ? body.branchCode.trim().toUpperCase()
      : String(body.branchCode ?? '').trim().toUpperCase(),
  name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
  status: (typeof body.status === 'string' ? body.status : 'active') as string,
  address:
    body.address !== undefined && body.address !== ''
      ? String(body.address).trim()
      : null,
  notes:
    body.notes !== undefined && body.notes !== ''
      ? String(body.notes).trim()
      : null,
})

const assertCreatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  const branchCode = String(body.branchCode || '').trim().toUpperCase()
  const name = String(body.name || '').trim()

  if (!branchCode) {
    throw new AccountingApiError('Branch code is required.', 400)
  }

  if (!name) {
    throw new AccountingApiError('Branch name is required.', 400)
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.branches,
    where: {
      branchCode: {
        equals: branchCode,
      },
    } as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    throw new AccountingApiError(`Branch code "${branchCode}" already exists. Use a different code.`, 409)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
      depth: 0,
      sort: 'branchCode',
      page,
      limit,
      overrideAccess: true,
    })

    return NextResponse.json({
      ...result,
      docs: result.docs.map((doc) => mapBranchResponse(doc as unknown as Record<string, unknown>)),
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = normalizeBody(await request.json())
    await assertCreatePayload(payload, body)

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 0,
    })

    return NextResponse.json(mapBranchResponse(record as unknown as Record<string, unknown>), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
