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
  ...(body.branchCode !== undefined
    ? {
        branchCode:
          typeof body.branchCode === 'string'
            ? body.branchCode.trim().toUpperCase()
            : String(body.branchCode ?? '').trim().toUpperCase(),
      }
    : {}),
  ...(body.name !== undefined
    ? { name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim() }
    : {}),
  ...(body.status !== undefined ? { status: String(body.status) } : {}),
  ...(body.address !== undefined
    ? { address: body.address !== '' ? String(body.address).trim() : null }
    : {}),
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
  if ('branchCode' in body) {
    const branchCode = String(body.branchCode || '').trim().toUpperCase()

    if (!branchCode) {
      throw new AccountingApiError('Branch code is required.', 400)
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

    if (existing.docs[0] && String(existing.docs[0].id) !== String(currentId)) {
      throw new AccountingApiError(`Branch code "${branchCode}" already exists. Use a different code.`, 409)
    }
  }

  if ('name' in body) {
    const name = String(body.name || '').trim()
    if (!name) {
      throw new AccountingApiError('Branch name is required.', 400)
    }
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
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
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
      id: currentId,
      depth: 0,
      overrideAccess: true,
    })

    await assertUpdatePayload(payload, body, currentId)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
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
    const branchId = parseNumberParam(id) || id

    const departmentsCount = await payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.departments,
      where: {
        branch: {
          equals: branchId,
        },
      } as never,
      overrideAccess: true,
    })

    const locationsCount = await payload.count({
      collection: ACCOUNTING_COLLECTION_SLUGS.locations,
      where: {
        branch: {
          equals: branchId,
        },
      } as never,
      overrideAccess: true,
    })

    const barriers: string[] = []

    if (departmentsCount.totalDocs > 0) {
      barriers.push(`referenced by ${departmentsCount.totalDocs} department(s)`)
    }

    if (locationsCount.totalDocs > 0) {
      barriers.push(`referenced by ${locationsCount.totalDocs} location(s)`)
    }

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete branch: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.branches,
      id: branchId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
