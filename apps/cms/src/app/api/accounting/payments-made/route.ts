import { NextRequest, NextResponse } from 'next/server'
import { AccountingPaymentMadeService } from '@/accounting/services/payments/AccountingPaymentMadeService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const records = await payload.find({
      collection: 'accounting-payments-made',
      depth: 2,
      sort: '-paymentDate',
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
      collection: 'accounting-payments-made',
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 2,
    })

    const result = body?.autoPost
      ? await AccountingPaymentMadeService.postPayment({
          payload,
          paymentId: record.id,
          userId: user.id,
        })
      : record

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
