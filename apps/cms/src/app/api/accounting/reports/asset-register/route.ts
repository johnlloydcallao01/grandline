import { NextRequest, NextResponse } from 'next/server'
import { getAssetRegister } from '@/accounting/queries/getAssetRegister'
import { handleAccountingApiError, requireAccountingAdmin } from '../../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const result = await getAssetRegister(payload)
    return NextResponse.json(result)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
