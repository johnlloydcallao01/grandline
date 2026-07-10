import { NextRequest, NextResponse } from 'next/server'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'
import { buildDetailResponse } from './[id]/route'

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] => {
  return Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
}

const normalizeSearch = (value: unknown) => String(value || '').trim().toLowerCase()

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Expired', value: 'expired' },
  { label: 'Archived', value: 'archived' },
]

const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Percent', value: 'percent' },
  { label: 'Fixed Course', value: 'fixed_course' },
  { label: 'Fixed Cart', value: 'fixed_cart' },
]

const SCOPE_TYPE_OPTIONS = [
  { label: 'All Courses', value: 'all_courses' },
  { label: 'Specific Courses', value: 'specific_courses' },
  { label: 'Specific Categories', value: 'specific_categories' },
]

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseIntegerParam(searchParams.get('page'), 1)
    const limit = parseIntegerParam(searchParams.get('limit'), 10)
    const statuses = parseListParam(searchParams, 'status')
    const discountTypes = parseListParam(searchParams, 'discountType')
    const quickFilters = parseListParam(searchParams, 'quickFilter')

    const [couponResult, coursesResult, categoriesResult, traineesResult] = await Promise.all([
      payload.find({
        collection: 'coupon-codes',
        limit: 10000,
        sort: '-createdAt',
        overrideAccess: true,
        depth: 2,
      }),
      payload.find({
        collection: 'courses',
        limit: 500,
        sort: 'title',
        overrideAccess: true,
        depth: 0,
      }),
      payload.find({
        collection: 'course-categories',
        limit: 500,
        sort: 'name',
        overrideAccess: true,
        depth: 0,
      }),
      payload.find({
        collection: 'trainees',
        limit: 500,
        sort: '-createdAt',
        overrideAccess: true,
        depth: 1,
      }),
    ])

    const allRows = couponResult.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
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
        statusLabel: String(d.status ? String(d.status).charAt(0).toUpperCase() + String(d.status).slice(1) : 'Draft'),
        discountType: String(d.discountType || 'percent'),
        discountTypeLabel: String(DISCOUNT_TYPE_OPTIONS.find((o) => o.value === d.discountType)?.label || d.discountType || 'Percent'),
        amount: Number(d.amount) || 0,
        maxDiscountAmount: d.maxDiscountAmount != null ? Number(d.maxDiscountAmount) : null,
        scopeType: String(d.scopeType || 'all_courses'),
        scopeTypeLabel: String(SCOPE_TYPE_OPTIONS.find((o) => o.value === d.scopeType)?.label || d.scopeType || 'All Courses'),
        includedCourseIds: includedCourses.map((c) => String(c.id ?? c)),
        includedCourseLabels: includedCourses.map((c) => String(c.title || c.courseCode || c.name || `Course #${c.id}`)),
        excludedCourseIds: excludedCourses.map((c) => String(c.id ?? c)),
        excludedCourseLabels: excludedCourses.map((c) => String(c.title || c.courseCode || c.name || `Course #${c.id}`)),
        includedCategoryIds: includedCategories.map((cat) => String(cat.id ?? cat)),
        includedCategoryLabels: includedCategories.map((cat) => String(cat.name || `Category #${cat.id}`)),
        excludedCategoryIds: excludedCategories.map((cat) => String(cat.id ?? cat)),
        excludedCategoryLabels: excludedCategories.map((cat) => String(cat.name || `Category #${cat.id}`)),
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
          return userObj ? String(userObj.email || `Trainee #${t.id}`) : `Trainee #${t.id}`
        }),
        allowedEmails: Array.isArray(d.allowedEmails) ? d.allowedEmails.map((entry: unknown) => {
          const e = entry as Record<string, unknown>
          return String(e.email || '')
        }) : [],
        metadata: d.metadata,
        createdAt: d.createdAt ? String(d.createdAt) : null,
        updatedAt: d.updatedAt ? String(d.updatedAt) : null,
      }
    })

    const normalizedSearch = search.trim().toLowerCase()
    let filteredRows = allRows.filter((row) => {
      if (normalizedSearch) {
        const matchesSearch = [
          row.code,
          row.name,
          row.description,
          row.statusLabel,
          row.discountTypeLabel,
          row.scopeTypeLabel,
        ].some((value) => normalizeSearch(value).includes(normalizedSearch))
        if (!matchesSearch) return false
      }
      if (statuses.length > 0 && (!row.status || !statuses.includes(row.status))) return false
      if (discountTypes.length > 0 && (!row.discountType || !discountTypes.includes(row.discountType))) return false
      return true
    })

    if (quickFilters.length > 0) {
      filteredRows = filteredRows.filter((row) =>
        quickFilters.some((filterValue) => {
          if (filterValue === 'active') return row.status === 'active'
          if (filterValue === 'percent') return row.discountType === 'percent'
          if (filterValue === 'fixedCourse') return row.discountType === 'fixed_course'
          if (filterValue === 'hasUsage') return row.usageCount > 0
          return false
        }),
      )
    }

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const currentPage = Math.min(page, totalPages)
    const paginatedRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit)

    const activeCount = allRows.filter((r) => r.status === 'active').length
    const percentCount = allRows.filter((r) => r.discountType === 'percent').length
    const hasUsageCount = allRows.filter((r) => r.usageCount > 0).length

    return NextResponse.json({
      rows: paginatedRows,
      metrics: [
        { id: 'total-coupons', label: 'Coupon Codes', value: allRows.length, change: 'Coupon master records available in LMS', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
        { id: 'active-coupons', label: 'Active Coupons', value: activeCount, change: 'Coupons currently valid for enrollment checkout', trend: activeCount > 0 ? 'up' as const : 'neutral' as const },
        { id: 'percent-coupons', label: 'Percent Discounts', value: percentCount, change: 'Percentage-based coupon codes', trend: percentCount > 0 ? 'neutral' as const : 'down' as const },
        { id: 'has-usage', label: 'Coupons With Usage', value: hasUsageCount, change: 'Coupons that have been redeemed at least once', trend: hasUsageCount > 0 ? 'up' as const : 'neutral' as const },
      ],
      filterOptions: {
        statuses: STATUS_OPTIONS,
        discountTypes: DISCOUNT_TYPE_OPTIONS,
        quickFilters: [
          { label: 'Active Coupons', value: 'active' },
          { label: 'Percent', value: 'percent' },
          { label: 'Fixed Course', value: 'fixedCourse' },
          { label: 'Has Usage', value: 'hasUsage' },
        ],
      },
      meta: {
        searchPlaceholder: 'Search coupon code, name, status, discount type, amount, or scope',
        columns: ['Coupon Code', 'Status', 'Discount Type', 'Amount', 'Scope', 'Usage Count'],
        tableTitle: 'Coupon And Discount Register',
        tableDescription: 'Coupon and discount view aligned to `coupon-codes` plus usage tracking from coupon redemptions.',
      },
      pagination: { page: currentPage, limit, totalDocs, totalPages, hasPrevPage: currentPage > 1, hasNextPage: currentPage < totalPages },
      totals: { totalRows: allRows.length, filteredRows: totalDocs },
      referenceData: {
        courses: coursesResult.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), name: String(r.title || r.courseCode || ''), courseCode: String(r.courseCode || '') }
        }),
        categories: categoriesResult.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          return { id: String(r.id), name: String(r.name || '') }
        }),
        trainees: traineesResult.docs.map((d) => {
          const r = d as unknown as Record<string, unknown>
          const userObj = r.user as unknown as Record<string, unknown> | undefined
          return { id: String(r.id), label: userObj ? String(userObj.email || `Trainee #${r.id}`) : `Trainee #${r.id}` }
        }),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const body = await request.json()

    const existing = await payload.find({
      collection: 'coupon-codes',
      where: {
        code: { equals: String(body.code || '').trim().toUpperCase() },
      } as never,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      throw new Error(`Coupon code "${String(body.code || '').trim().toUpperCase()}" already exists.`)
    }

    const data: Record<string, unknown> = {
      code: String(body.code || '').trim().toUpperCase(),
      name: String(body.name || '').trim() || undefined,
      description: String(body.description || '').trim() || undefined,
      status: String(body.status || 'draft'),
      discountType: String(body.discountType || 'percent'),
      amount: Math.max(0, Number(body.amount) || 0),
      maxDiscountAmount: body.maxDiscountAmount != null ? Math.max(0, Number(body.maxDiscountAmount)) : undefined,
      scopeType: String(body.scopeType || 'all_courses'),
      excludeSaleCourses: body.excludeSaleCourses !== undefined ? Boolean(body.excludeSaleCourses) : false,
      minimumAmount: body.minimumAmount != null ? Math.max(0, Number(body.minimumAmount)) : undefined,
      maximumAmount: body.maximumAmount != null ? Math.max(0, Number(body.maximumAmount)) : undefined,
      usageLimitTotal: body.usageLimitTotal != null ? Math.max(0, Number(body.usageLimitTotal)) : undefined,
      usageLimitPerUser: body.usageLimitPerUser != null ? Math.max(0, Number(body.usageLimitPerUser)) : undefined,
      maxItemsAffected: body.maxItemsAffected != null ? Math.max(1, Number(body.maxItemsAffected)) : undefined,
      stackable: body.stackable !== undefined ? Boolean(body.stackable) : false,
      priority: body.priority != null ? Math.max(0, Number(body.priority)) : 100,
      startsAt: body.startsAt || undefined,
      expiresAt: body.expiresAt || undefined,
    }

    if (body.includedCourses && Array.isArray(body.includedCourses)) {
      data.includedCourses = body.includedCourses.map((id: unknown) => Number(id)).filter((n: number) => n > 0)
    }
    if (body.excludedCourses && Array.isArray(body.excludedCourses)) {
      data.excludedCourses = body.excludedCourses.map((id: unknown) => Number(id)).filter((n: number) => n > 0)
    }
    if (body.includedCategories && Array.isArray(body.includedCategories)) {
      data.includedCategories = body.includedCategories.map((id: unknown) => Number(id)).filter((n: number) => n > 0)
    }
    if (body.excludedCategories && Array.isArray(body.excludedCategories)) {
      data.excludedCategories = body.excludedCategories.map((id: unknown) => Number(id)).filter((n: number) => n > 0)
    }
    if (body.allowedTrainees && Array.isArray(body.allowedTrainees)) {
      data.allowedTrainees = body.allowedTrainees.map((id: unknown) => Number(id)).filter((n: number) => n > 0)
    }
    if (body.allowedEmails && Array.isArray(body.allowedEmails)) {
      data.allowedEmails = body.allowedEmails.map((email: string) => ({ email: String(email).trim() })).filter((e: { email: string }) => e.email)
    }

    const record = await payload.create({
      collection: 'coupon-codes',
      overrideAccess: true,
      data: data as never,
      depth: 2,
    })

    return NextResponse.json(await buildDetailResponse(payload, record as unknown as Record<string, unknown>), { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
