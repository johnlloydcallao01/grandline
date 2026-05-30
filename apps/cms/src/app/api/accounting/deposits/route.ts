import { NextRequest, NextResponse } from 'next/server'
import { AccountingBankingService } from '@/accounting/services/banking/AccountingBankingService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const records = await payload.find({
      collection: 'accounting-deposits',
      depth: 2,
      sort: '-depositDate',
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
      collection: 'accounting-deposits',
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 2,
    })

    const result = body?.autoPost
      ? await AccountingBankingService.postDeposit({
          payload,
          depositId: record.id,
          userId: user.id,
        })
      : record

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
