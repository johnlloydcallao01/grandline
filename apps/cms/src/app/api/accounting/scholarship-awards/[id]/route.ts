import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
      id: id as never,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await params
    const body = await request.json()

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
      id: id as never,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      },
      depth: 2,
    })

    return NextResponse.json(record)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await params

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
      id: id as never,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
