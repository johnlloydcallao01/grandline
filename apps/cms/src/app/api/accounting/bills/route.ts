import { type Where } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { AccountingBillService } from '@/accounting/services/bills/AccountingBillService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const vendor = searchParams.get('vendor')

    const where: Where = {}

    if (status) {
      where.status = { equals: status }
    }

    if (vendor) {
      where.vendor = { equals: vendor }
    }

    const bills = await payload.find({
      collection: 'accounting-bills',
      page,
      limit,
      depth: 2,
      sort: '-billDate',
      where,
      overrideAccess: true,
    })

    return NextResponse.json(bills)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const bill = await payload.create({
      collection: 'accounting-bills',
      overrideAccess: true,
      data: {
        ...body,
        createdBy: user.id,
        updatedBy: user.id,
      },
      depth: 2,
    })

    if (Array.isArray(body?.lines)) {
      for (const line of body.lines) {
        await payload.create({
          collection: 'accounting-bill-line-items',
          overrideAccess: true,
          data: {
            ...line,
            bill: bill.id,
            createdBy: user.id,
            updatedBy: user.id,
          },
        })
      }
    }

    const result = body?.autoPost
      ? await AccountingBillService.postBill({
          payload,
          billId: bill.id,
          userId: user.id,
        })
      : await payload.findByID({
          collection: 'accounting-bills',
          id: bill.id,
          depth: 2,
          overrideAccess: true,
        })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
