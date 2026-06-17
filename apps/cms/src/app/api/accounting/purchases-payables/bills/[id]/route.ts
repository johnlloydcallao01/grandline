import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, ACCOUNTING_HOOK_CONTEXT } from '@/accounting/constants/accounting'
import { AccountingBillService } from '@/accounting/services/bills/AccountingBillService'
import { AccountingCommercialService } from '@/accounting/services/AccountingCommercialService'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import {
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
  AccountingApiError,
} from '../../../_utils/auth'
import {
  assertBillMutationPayload,
  buildBillDetailResponse,
  normalizeBillMutationBody,
  type BillDoc,
} from '../_shared'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const resolveBill = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  id: string,
) =>
  (await payload.findByID({
    collection: ACCOUNTING_COLLECTION_SLUGS.bills,
    id: parseNumberParam(id) || id,
    depth: 1,
    overrideAccess: true,
  })) as BillDoc

const computeDeleteBarriers = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  bill: BillDoc,
) => {
  const billId = String(bill.id)

  const [paymentsMade, vendorCredits, documentLinks] = await Promise.all([
    findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.paymentsMade,
      depth: 0,
      where: {
        status: {
          equals: 'posted',
        },
      },
    }),
    findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.vendorCredits,
      depth: 0,
      where: {
        status: {
          in: ['posted', 'partially_paid', 'paid'],
        },
      },
    }),
    findAllDocs<any>({
      payload,
      collection: ACCOUNTING_COLLECTION_SLUGS.documentLinks,
      depth: 0,
      where: {
        and: [
          {
            entityType: {
              equals: 'bill',
            },
          },
          {
            entityId: {
              equals: billId,
            },
          },
        ],
      },
    }),
  ])

  const appliedPaymentsCount = paymentsMade.reduce((count: number, payment: any) => {
    const matched = Array.isArray(payment.applications)
      ? payment.applications.some(
          (application: any) => String(getRelationshipId(application?.bill) || '') === billId,
        )
      : false
    return count + (matched ? 1 : 0)
  }, 0)

  const appliedVendorCreditsCount = vendorCredits.reduce((count: number, vendorCredit: any) => {
    const sourceBillMatch = String(getRelationshipId(vendorCredit.sourceBill) || '') === billId
    const applicationMatch = Array.isArray(vendorCredit.applications)
      ? vendorCredit.applications.some(
          (application: any) => String(getRelationshipId(application?.bill) || '') === billId,
        )
      : false
    return count + (sourceBillMatch || applicationMatch ? 1 : 0)
  }, 0)

  const barriers: string[] = []

  if (['posted', 'partially_paid', 'paid', 'voided'].includes(String(bill.status || ''))) {
    barriers.push('bill is already posted or settled')
  }

  if (appliedPaymentsCount > 0) {
    barriers.push(`referenced by ${appliedPaymentsCount} payment(s) made`)
  }

  if (appliedVendorCreditsCount > 0) {
    barriers.push(`referenced by ${appliedVendorCreditsCount} vendor credit(s)`)
  }

  if (documentLinks.length > 0) {
    barriers.push(`linked to ${documentLinks.length} support document(s)`)
  }

  if (getRelationshipId(bill.postedJournalEntry)) {
    barriers.push('linked to a posted journal entry')
  }

  return barriers
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const bill = await resolveBill(payload, id)

    return NextResponse.json(await buildBillDetailResponse(payload, bill))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = normalizeBillMutationBody((await request.json()) as Record<string, unknown>)
    const billId = parseNumberParam(id) || id
    const currentBill = await resolveBill(payload, id)

    AccountingCommercialService.assertMutableStatus(currentBill.status, 'Bill')
    await assertBillMutationPayload(payload, body)

    const updatedBill = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
      id: billId,
      depth: 1,
      overrideAccess: true,
      data: {
        billNumber: body.billNumber,
        vendor: body.vendor,
        billDate: body.billDate,
        postingDate: body.postingDate,
        dueDate: body.dueDate,
        status: body.status || 'draft',
        currency: body.currency || 'PHP',
        exchangeRate: body.exchangeRate ?? 1,
        referenceNumber: body.referenceNumber,
        memo: body.memo,
        payableAccountOverride: body.payableAccountOverride,
        notes: body.notes,
        updatedBy: user.id,
      } as any,
    }) as any

    if (body.lines) {
      const existingLines = await findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems,
        depth: 0,
        where: {
          bill: {
            equals: billId,
          },
        },
        sort: 'lineNumber',
      })

      for (const line of existingLines) {
        await payload.delete({
          collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
          id: line.id,
          overrideAccess: true,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
          },
        })
      }

      for (const line of body.lines) {
        await payload.create({
          collection: ACCOUNTING_COLLECTION_SLUGS.billLineItems as any,
          overrideAccess: true,
          depth: 0,
          context: {
            [ACCOUNTING_HOOK_CONTEXT.skipBillTotalsSync]: true,
          },
          data: {
            bill: billId,
            lineNumber: line.lineNumber,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxCode: line.taxCode,
            expenseAccount: line.expenseAccount,
            assetAccount: line.assetAccount,
            payableAccountOverride: line.payableAccountOverride,
            createdBy: user.id,
            updatedBy: user.id,
          } as any,
        })
      }

      await AccountingBillService.syncTotals(payload, billId)
    }

    const refreshedBill = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
      id: updatedBill.id,
      depth: 1,
      overrideAccess: true,
    }) as any

    return NextResponse.json(await buildBillDetailResponse(payload, refreshedBill as BillDoc))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const billId = parseNumberParam(id) || id
    const bill = await resolveBill(payload, id)
    const barriers = await computeDeleteBarriers(payload, bill)

    if (barriers.length > 0) {
      throw new AccountingApiError(
        `Cannot delete bill: ${barriers.join(', ')}. Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.bills as any,
      id: billId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
