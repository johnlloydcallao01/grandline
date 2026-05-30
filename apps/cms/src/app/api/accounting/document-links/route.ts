import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const records = await payload.find({
      collection: 'accounting-document-links',
      depth: 2,
      sort: '-createdAt',
      overrideAccess: true,
    })

    return NextResponse.json(records)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()
    const record = await payload.create({
      collection: 'accounting-document-links',
      overrideAccess: true,
      data: {
        ...body,
        uploadedBy: body?.uploadedBy || user.id,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 2,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
