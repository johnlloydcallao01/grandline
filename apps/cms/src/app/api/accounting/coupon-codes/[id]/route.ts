import { NextRequest, NextResponse } from 'next/server'
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

export const countRedemptionsForCoupon = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  couponId: number | string,
) => {
  const usage = await payload.count({
    collection: 'coupon-redemptions',
    where: {
      coupon: { equals: couponId },
    } as never,
    overrideAccess: true,
  })
  return Number(usage.totalDocs || 0)
}

export const computeUsageSummary = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  couponId: number | string,
) => {
  const redemptionCount = await countRedemptionsForCoupon(payload, couponId)
  return {
    redemptionCount,
    hasBlockingDependents: redemptionCount > 0,
  }
}

const toName = (v: unknown): string => {
  if (!v) return '-'
  if (typeof v === 'object' && v !== null) {
    const r = v as Record<string, unknown>
    if (r.title) return String(r.title)
    if (r.name) return String(r.name)
    if (r.courseCode) return String(r.courseCode)
    return `#${r.id}`
  }
  return String(v)
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', active: 'Active', paused: 'Paused', expired: 'Expired', archived: 'Archived',
}
const DISCOUNT_LABELS: Record<string, string> = {
  percent: 'Percent', fixed_course: 'Fixed Course', fixed_cart: 'Fixed Cart',
}
const SCOPE_LABELS: Record<string, string> = {
  all_courses: 'All Courses', specific_courses: 'Specific Courses', specific_categories: 'Specific Categories',
}

export const buildDetailResponse = async (
  payload: Awaited<ReturnType<typeof requireAccountingAdmin>>['payload'],
  record: Record<string, unknown>,
) => {
  const usage = await computeUsageSummary(payload, record.id as number | string)
  const d = record as Record<string, unknown>
  const includedCourses = (d.includedCourses as unknown as Array<Record<string, unknown>> | undefined) || []
  const excludedCourses = (d.excludedCourses as unknown as Array<Record<string, unknown>> | undefined) || []
  const includedCategories = (d.includedCategories as unknown as Array<Record<string, unknown>> | undefined) || []
  const excludedCategories = (d.excludedCategories as unknown as Array<Record<string, unknown>> | undefined) || []
  const allowedTrainees = (d.allowedTrainees as unknown as Array<Record<string, unknown>> | undefined) || []

  return {
    id: String(d.id),
    code: String(d.code || ''),
    name: String(d.name || ''),
    description: String(d.description || ''),
    status: String(d.status || 'draft'),
    statusLabel: STATUS_LABELS[String(d.status || 'draft')] || String(d.status || 'Draft'),
    discountType: String(d.discountType || 'percent'),
    discountTypeLabel: DISCOUNT_LABELS[String(d.discountType || 'percent')] || String(d.discountType || 'Percent'),
    amount: Number(d.amount) || 0,
    maxDiscountAmount: d.maxDiscountAmount != null ? Number(d.maxDiscountAmount) : null,
    scopeType: String(d.scopeType || 'all_courses'),
    scopeTypeLabel: SCOPE_LABELS[String(d.scopeType || 'all_courses')] || String(d.scopeType || 'All Courses'),
    includedCourseIds: includedCourses.map((c) => String(c.id ?? c)),
    includedCourseLabels: includedCourses.map((c) => toName(c)),
    excludedCourseIds: excludedCourses.map((c) => String(c.id ?? c)),
    excludedCourseLabels: excludedCourses.map((c) => toName(c)),
    includedCategoryIds: includedCategories.map((cat) => String(cat.id ?? cat)),
    includedCategoryLabels: includedCategories.map((cat) => toName(cat)),
    excludedCategoryIds: excludedCategories.map((cat) => String(cat.id ?? cat)),
    excludedCategoryLabels: excludedCategories.map((cat) => toName(cat)),
    excludeSaleCourses: Boolean(d.excludeSaleCourses),
    minimumAmount: d.minimumAmount != null ? Number(d.minimumAmount) : null,
    maximumAmount: d.maximumAmount != null ? Number(d.maximumAmount) : null,
    usageLimitTotal: d.usageLimitTotal != null ? Number(d.usageLimitTotal) : null,
    usageLimitPerUser: d.usageLimitPerUser != null ? Number(d.usageLimitPerUser) : null,
    maxItemsAffected: d.maxItemsAffected != null ? Number(d.maxItemsAffected) : null,
    stackable: Boolean(d.stackable),
    priority: Number(d.priority) || 100,
    usageCount: Number(d.usageCount) || 0,
    lastUsedAt: d.lastUsedAt ? String(d.lastUsedAt) : null,
    startsAt: d.startsAt ? String(d.startsAt) : null,
    expiresAt: d.expiresAt ? String(d.expiresAt) : null,
    allowedTraineeIds: allowedTrainees.map((t) => String(t.id ?? t)),
    allowedTraineeLabels: allowedTrainees.map((t) => {
      const userObj = t.user as unknown as Record<string, unknown> | undefined
      return userObj ? String(userObj.email || `#${t.id}`) : `#${t.id}`
    }),
    allowedEmails: Array.isArray(d.allowedEmails) ? d.allowedEmails.map((entry: unknown) => {
      const e = entry as Record<string, unknown>
      return String(e.email || '')
    }) : [],
    createdAt: d.createdAt ? String(d.createdAt) : null,
    updatedAt: d.updatedAt ? String(d.updatedAt) : null,
    usageSummary: {
      redemptionCount: usage.redemptionCount,
      hasBlockingDependents: usage.hasBlockingDependents,
    },
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: 'coupon-codes',
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
    })
    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await payload.findByID({
      collection: 'coupon-codes',
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Coupon code not found', 404)

    const immutableStatuses = new Set(['expired', 'archived'])
    if (existing.status && immutableStatuses.has(String(existing.status))) {
      throw new AccountingApiError(`Cannot update a coupon with status "${String(existing.status)}".`, 400)
    }

    const data: Record<string, unknown> = {}
    if (body.code !== undefined) data.code = String(body.code || '').trim().toUpperCase()
    if (body.name !== undefined) data.name = String(body.name || '').trim() || undefined
    if (body.description !== undefined) data.description = String(body.description || '').trim() || undefined
    if (body.status !== undefined) data.status = String(body.status || 'draft')
    if (body.discountType !== undefined) data.discountType = String(body.discountType || 'percent')
    if (body.amount !== undefined) data.amount = Math.max(0, Number(body.amount) || 0)
    if (body.maxDiscountAmount !== undefined) data.maxDiscountAmount = body.maxDiscountAmount != null ? Math.max(0, Number(body.maxDiscountAmount)) : undefined
    if (body.scopeType !== undefined) data.scopeType = String(body.scopeType || 'all_courses')
    if (body.excludeSaleCourses !== undefined) data.excludeSaleCourses = Boolean(body.excludeSaleCourses)
    if (body.minimumAmount !== undefined) data.minimumAmount = body.minimumAmount != null ? Math.max(0, Number(body.minimumAmount)) : undefined
    if (body.maximumAmount !== undefined) data.maximumAmount = body.maximumAmount != null ? Math.max(0, Number(body.maximumAmount)) : undefined
    if (body.usageLimitTotal !== undefined) data.usageLimitTotal = body.usageLimitTotal != null ? Math.max(0, Number(body.usageLimitTotal)) : undefined
    if (body.usageLimitPerUser !== undefined) data.usageLimitPerUser = body.usageLimitPerUser != null ? Math.max(0, Number(body.usageLimitPerUser)) : undefined
    if (body.maxItemsAffected !== undefined) data.maxItemsAffected = body.maxItemsAffected != null ? Math.max(1, Number(body.maxItemsAffected)) : undefined
    if (body.stackable !== undefined) data.stackable = Boolean(body.stackable)
    if (body.priority !== undefined) data.priority = Math.max(0, Number(body.priority))
    if (body.startsAt !== undefined) data.startsAt = body.startsAt || undefined
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt || undefined
    if (body.includedCourses !== undefined) {
      data.includedCourses = Array.isArray(body.includedCourses) ? body.includedCourses.map((id: unknown) => Number(id)).filter((n: number) => n > 0) : []
    }
    if (body.excludedCourses !== undefined) {
      data.excludedCourses = Array.isArray(body.excludedCourses) ? body.excludedCourses.map((id: unknown) => Number(id)).filter((n: number) => n > 0) : []
    }
    if (body.includedCategories !== undefined) {
      data.includedCategories = Array.isArray(body.includedCategories) ? body.includedCategories.map((id: unknown) => Number(id)).filter((n: number) => n > 0) : []
    }
    if (body.excludedCategories !== undefined) {
      data.excludedCategories = Array.isArray(body.excludedCategories) ? body.excludedCategories.map((id: unknown) => Number(id)).filter((n: number) => n > 0) : []
    }
    if (body.allowedTrainees !== undefined) {
      data.allowedTrainees = Array.isArray(body.allowedTrainees) ? body.allowedTrainees.map((id: unknown) => Number(id)).filter((n: number) => n > 0) : []
    }
    if (body.allowedEmails !== undefined) {
      data.allowedEmails = Array.isArray(body.allowedEmails) ? body.allowedEmails.map((email: string) => ({ email: String(email).trim() })).filter((e: { email: string }) => e.email) : []
    }

    const record = await payload.update({
      collection: 'coupon-codes',
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
    const couponId = parseNumberParam(id) || id

    const usage = await computeUsageSummary(payload, couponId)

    if (usage.redemptionCount > 0) {
      throw new AccountingApiError(
        `Cannot delete coupon code: referenced by ${usage.redemptionCount} coupon redemption(s). Deactivate the coupon instead.`,
        409,
      )
    }

    await payload.delete({
      collection: 'coupon-codes',
      id: couponId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
