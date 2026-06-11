import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

const normalizeBody = (body: Record<string, unknown>) => ({
  ...(body.departmentCode !== undefined
    ? {
        departmentCode:
          typeof body.departmentCode === 'string'
            ? body.departmentCode.trim().toUpperCase()
            : String(body.departmentCode ?? '').trim().toUpperCase(),
      }
    : {}),
  ...(body.name !== undefined
    ? { name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim() }
    : {}),
  ...(body.status !== undefined ? { status: String(body.status) } : {}),
  ...(body.branch !== undefined ? { branch: body.branch !== '' ? body.branch : null } : {}),
  ...(body.notes !== undefined
    ? { notes: body.notes !== '' ? String(body.notes).trim() : null }
    : {}),
  ...(body.createdBy !== undefined ? { createdBy: body.createdBy as number | undefined } : {}),
  ...(body.updatedBy !== undefined ? { updatedBy: body.updatedBy as number | undefined } : {}),
})

const assertUpdatePayload = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  body: Record<string, unknown>,
  currentId: number | string,
) => {
  if ('departmentCode' in body) {
    const departmentCode = String(body.departmentCode || '').trim().toUpperCase()

    if (!departmentCode) {
      throw new AccountingApiError('Department code is required.', 400)
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

    if (existing.docs[0] && String(existing.docs[0].id) !== String(currentId)) {
      throw new AccountingApiError(`Department code "${departmentCode}" already exists. Use a different code.`, 409)
    }
  }

  if ('name' in body) {
    const name = String(body.name || '').trim()
    if (!name) {
      throw new AccountingApiError('Department name is required.', 400)
    }
  }

  if ('branch' in body && body.branch !== undefined && body.branch !== '' && body.branch !== null) {
    try {
      await payload.findByID({
        collection: ACCOUNTING_COLLECTION_SLUGS.branches,
        id: body.branch as string | number,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      throw new AccountingApiError(`Branch with ID "${String(body.branch)}" not found.`, 400)
    }
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
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
    const body = normalizeBody(await request.json())
    const currentId = parseNumberParam(id) || id

    await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      id: currentId,
      depth: 0,
      overrideAccess: true,
    })

    await assertUpdatePayload(payload, body, currentId)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      id: currentId,
      depth: 1,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      } as never,
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
    const departmentId = parseNumberParam(id) || id

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      id: departmentId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
