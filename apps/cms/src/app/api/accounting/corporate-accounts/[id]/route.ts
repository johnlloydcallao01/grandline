import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import {
  AccountingApiError,
  handleAccountingApiError,
  parseNumberParam,
  requireAccountingAdmin,
} from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const countCorporateBillingLinksForAccount = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const usage = await payload.count({
    collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
    where: {
      corporateAccount: {
        equals: accountId,
      },
    } as never,
    overrideAccess: true,
  })
  return Number(usage.totalDocs || 0)
}

const computeAccountUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  accountId: number | string,
) => {
  const [corporateBillingLinkCount] = await Promise.all([
    countCorporateBillingLinksForAccount(payload, accountId),
  ])
  return {
    corporateBillingLinkCount,
    hasDependents: corporateBillingLinkCount > 0,
  }
}

const buildDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeAccountUsageSummary(payload, record.id as number | string)
  const r = record as Record<string, unknown>
  const cust = r.customer as unknown as Record<string, unknown> | undefined
  return {
    id: String(r.id),
    accountCode: String(r.accountCode || ''),
    name: String(r.name || ''),
    customer: cust ? String(cust.id ?? cust) : '',
    customerLabel: cust ? String(cust.displayName || cust.customerCode || `Customer #${cust.id}`) : '-',
    billingContact: String(r.billingContact || ''),
    email: String(r.email || ''),
    phone: String(r.phone || ''),
    creditTerms: String(r.creditTerms || ''),
    paymentTerms: String(r.paymentTerms || ''),
    status: String(r.status || 'active'),
    notes: String(r.notes || ''),
    createdAt: r.createdAt ? String(r.createdAt) : null,
    updatedAt: r.updatedAt ? String(r.updatedAt) : null,
    usageSummary: {
      corporateBillingLinkCount: usage.corporateBillingLinkCount,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: parseNumberParam(id) || id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = await request.json()

    const toId = (v: unknown): number | null => {
      if (v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : null
    }

    const data: Record<string, unknown> = { updatedBy: user.id }
    if (body.accountCode !== undefined) data.accountCode = String(body.accountCode || '').trim() || undefined
    if (body.name !== undefined) data.name = String(body.name || '').trim()
    if (body.billingContact !== undefined) data.billingContact = String(body.billingContact || '').trim() || undefined
    if (body.email !== undefined) data.email = String(body.email || '').trim() || undefined
    if (body.phone !== undefined) data.phone = String(body.phone || '').trim() || undefined
    if (body.creditTerms !== undefined) data.creditTerms = String(body.creditTerms || '').trim() || undefined
    if (body.paymentTerms !== undefined) data.paymentTerms = String(body.paymentTerms || '').trim() || undefined
    if (body.status !== undefined) data.status = String(body.status || 'active')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || undefined
    if (body.customer !== undefined) data.customer = toId(body.customer)

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
      data: data as never,
    })

    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const accountId = parseNumberParam(id) || id

    const usage = await computeAccountUsageSummary(payload, accountId)

    if (usage.corporateBillingLinkCount > 0) {
      throw new AccountingApiError(
        `Cannot delete corporate account: referenced by ${usage.corporateBillingLinkCount} corporate billing link(s). Remove all references before deleting.`,
        409,
      )
    }

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.corporateAccounts,
      id: accountId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
