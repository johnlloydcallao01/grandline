import { type Where } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { AccountingInvoiceService } from '@/accounting/services/invoices/AccountingInvoiceService'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const customer = searchParams.get('customer')

    const where: Where = {}

    if (status) {
      where.status = { equals: status }
    }

    if (customer) {
      where.customer = { equals: customer }
    }

    const invoices = await payload.find({
      collection: 'accounting-invoices',
      page,
      limit,
      depth: 2,
      sort: '-invoiceDate',
      where,
      overrideAccess: true,
    })

    return NextResponse.json(invoices)
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    const invoice = await payload.create({
      collection: 'accounting-invoices',
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
          collection: 'accounting-invoice-line-items',
          overrideAccess: true,
          data: {
            ...line,
            invoice: invoice.id,
            createdBy: user.id,
            updatedBy: user.id,
          },
        })
      }
    }

    const result = body?.autoPost
      ? await AccountingInvoiceService.postInvoice({
          payload,
          invoiceId: invoice.id,
          userId: user.id,
        })
      : await payload.findByID({
          collection: 'accounting-invoices',
          id: invoice.id,
          depth: 2,
          overrideAccess: true,
        })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
