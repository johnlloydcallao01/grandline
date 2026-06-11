import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  requireAccountingAdmin,
} from '../_utils/auth'

const normalizeBody = (body: Record<string, unknown>) => ({
  locationCode:
    typeof body.locationCode === 'string'
      ? body.locationCode.trim().toUpperCase()
      : String(body.locationCode ?? '').trim().toUpperCase(),
  name: typeof body.name === 'string' ? body.name.trim() : String(body.name ?? '').trim(),
  status: (typeof body.status === 'string' ? body.status : 'active') as string,
  branch: body.branch !== undefined && body.branch !== '' ? body.branch : null,
  address:
    body.address !== undefined && body.address !== ''
      ? String(body.address).trim()
      : null,
  city:
    body.city !== undefined && body.city !== ''
      ? String(body.city).trim()
      : null,
  state:
    body.state !== undefined && body.state !== ''
      ? String(body.state).trim()
      : null,
  postalCode:
    body.postalCode !== undefined && body.postalCode !== ''
      ? String(body.postalCode).trim()
      : null,
  country:
    body.country !== undefined && body.country !== ''
      ? String(body.country).trim()
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
  const locationCode = String(body.locationCode || '').trim().toUpperCase()
  const name = String(body.name || '').trim()

  if (!locationCode) {
    throw new AccountingApiError('Location code is required.', 400)
  }

  if (!name) {
    throw new AccountingApiError('Location name is required.', 400)
  }

  const existing = await payload.find({
    collection: ACCOUNTING_COLLECTION_SLUGS.locations,
    where: {
      locationCode: {
        equals: locationCode,
      },
    } as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    throw new AccountingApiError(`Location code "${locationCode}" already exists. Use a different code.`, 409)
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
      collection: ACCOUNTING_COLLECTION_SLUGS.locations,
      depth: 1,
      sort: 'locationCode',
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
      collection: ACCOUNTING_COLLECTION_SLUGS.locations,
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
