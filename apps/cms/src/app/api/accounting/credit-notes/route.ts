import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'
import { AccountingCreditNoteService } from '@/accounting/services/invoices/AccountingCreditNoteService'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const records = await payload.find({
      collection: 'accounting-credit-notes',
      depth: 2,
      sort: '-creditDate',
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
      collection: 'accounting-credit-notes',
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 2,
    })

    const result = body?.autoPost
      ? await AccountingCreditNoteService.postCreditNote({
          payload,
          creditNoteId: record.id,
          userId: user.id,
        })
      : record

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
