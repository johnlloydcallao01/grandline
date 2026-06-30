import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../../_utils/auth'
import { findDocumentCategoryDetailById } from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    return NextResponse.json(
      await findDocumentCategoryDetailById({
        payload,
        id,
      }),
    )
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
