import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: 'accounting-currencies',
      id: parseNumberParam(id) || id,
      depth: 0,
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

    const record = await payload.update({
      collection: 'accounting-currencies',
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
      data: {
        ...body,
        updatedBy: user.id,
      },
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

    await payload.delete({
      collection: 'accounting-currencies',
      id: parseNumberParam(id) || id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
