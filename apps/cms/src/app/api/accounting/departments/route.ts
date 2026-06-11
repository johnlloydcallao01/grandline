import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  requireAccountingAdmin,
} from '../_utils/auth'

const normalizeBody = (body: Record<string, unknown>) => ({
  departmentCode:
    typeof body.departmentCode === 'string'
      ? body.departmentCode.trim().toUpperCase()
      : String(body.departmentCode ?? '').trim().toUpperCase(),
  name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
  status: (typeof body.status === 'string' ? body.status : 'active') as string,
  branch: body.branch !== undefined && body.branch !== '' ? body.branch : null,
  notes:
    body.notes !== undefined && body.notes !== ''
      ? String(body.notes).trim()
      : null,
})

const assertCreatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
) => {
  const departmentCode = String(body.departmentCode || '').trim().toUpperCase()
  const name = String(body.name || '').trim()

  if (!departmentCode) {
    throw new AccountingApiError('Department code is required.', 400)
  }

  if (!name) {
    throw new AccountingApiError('Department name is required.', 400)
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.departments,
    where: {
      departmentCode: {
        equals: departmentCode,
      },
    } as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    throw new AccountingApiError(`Department code "${departmentCode}" already exists. Use a different code.`, 409)
  }

  if (body.branch !== undefined && body.branch !== '' && body.branch !== null) {
    try {
      await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.branches,
        id: body.branch as string | number,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      throw new AccountingApiError(`Branch with ID "${String(body.branch)}" not found. Provide a valid branch ID or leave empty.`, 400)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))

    const result = await payload.find({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      depth: 1,
      sort: 'departmentCode',
      page,
      limit,
      overrideAccess: true,
    })

    return NextResponse.json(result)
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
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 1,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
