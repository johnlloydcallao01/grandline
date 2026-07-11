import { NextRequest, NextResponse } from 'next/server'
import type { Payload } from 'payload'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { AccountingApiError, handleAccountingApiError, parseNumberParam, requireAccountingAdmin } from '../../_utils/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const IMMUTABLE_STATUSES = new Set(['paid', 'cancelled', 'refunded'])

const titleCase = (value: string | null | undefined) =>
  String(value || '').split('_').join(' ').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDate = (value: string | null | undefined) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

const buildUserDisplayName = (user: unknown) => {
  if (!user || typeof user !== 'object') return '-'
  const u = user as Record<string, unknown>
  const firstName = String(u.firstName || '')
  const lastName = String(u.lastName || '')
  const name = `${firstName} ${lastName}`.trim()
  return name || String(u.email || '-')
}

const buildLabel = (val: unknown, labelField: string) => {
  if (!val || typeof val !== 'object') return '-'
  const obj = val as Record<string, unknown>
  return String(obj[labelField] || obj.id || '-')
}

const buildDetail = async (
  record: Record<string, unknown>,
) => {
  const r = record as Record<string, unknown>
  const course = r.course
  const courseLabel = (() => {
    if (!course) return '-'
    if (typeof course === 'number' || typeof course === 'string') return String(course)
    const c = course as Record<string, unknown>
    return String(c.title || c.courseCode || `Course ${c.id}`)
  })()
  const trainee = r.trainee
  const traineeUser = trainee && typeof trainee === 'object' ? (trainee as Record<string, unknown>).user : null
  const traineeLabel = traineeUser ? buildUserDisplayName(traineeUser) : buildLabel(trainee, 'srn')
  const userLabel = buildUserDisplayName(r.user)
  const customerLabel = (() => {
    const cust = r.customer
    if (!cust) return '-'
    if (typeof cust === 'number' || typeof cust === 'string') return String(cust)
    const c = cust as Record<string, unknown>
    const code = String(c.customerCode || '')
    const name = String(c.displayName || '')
    return `${code} ${name}`.trim() || '-'
  })()
  const invoiceLabel = buildLabel(r.invoice, 'invoiceNumber')

  return {
    id: String(r.id),
    enrollmentId: String((r.enrollment as Record<string, unknown> | undefined)?.id ?? r.enrollment ?? ''),
    courseId: String((r.course as Record<string, unknown> | undefined)?.id ?? r.course ?? ''),
    courseLabel,
    traineeId: String((r.trainee as Record<string, unknown> | undefined)?.id ?? r.trainee ?? ''),
    traineeLabel: traineeLabel || '-',
    userLabel: userLabel || '-',
    customerId: String((r.customer as Record<string, unknown> | undefined)?.id ?? r.customer ?? ''),
    customerLabel: customerLabel || '-',
    invoiceId: String((r.invoice as Record<string, unknown> | undefined)?.id ?? r.invoice ?? ''),
    invoiceLabel: invoiceLabel || '-',
    sourceReference: String(r.sourceReference || `BL-${r.id}`),
    sourceType: String(r.sourceType || 'enrollment'),
    billingStatus: String(r.billingStatus || 'not_started'),
    billingStatusLabel: titleCase(String(r.billingStatus)),
    listPriceSnapshot: Number(r.listPriceSnapshot) || 0,
    salePriceSnapshot: Number(r.salePriceSnapshot) || 0,
    couponDiscountSnapshot: Number(r.couponDiscountSnapshot) || 0,
    scholarshipDiscountSnapshot: Number(r.scholarshipDiscountSnapshot) || 0,
    corporateCoverageSnapshot: Number(r.corporateCoverageSnapshot) || 0,
    adjustmentsNetSnapshot: Number(r.adjustmentsNetSnapshot) || 0,
    finalChargeSnapshot: Number(r.finalChargeSnapshot) || 0,
    recognizedRevenueSnapshot: Number(r.recognizedRevenueSnapshot) || 0,
    currency: String(r.currency || 'PHP'),
    linkedAt: r.linkedAt ? String(r.linkedAt) : null,
    linkedAtLabel: formatDate(r.linkedAt as string | null | undefined) || '-',
    notes: String(r.notes || ''),
    createdAt: r.createdAt ? String(r.createdAt) : null,
    updatedAt: r.updatedAt ? String(r.updatedAt) : null,
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const record = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
    })
    return NextResponse.json(await buildDetail(record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const { id } = await context.params

    const body = await request.json()

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: parseNumberParam(id) || id,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Enrollment billing link not found', 404)

    const existingStatus = String(existing.billingStatus || '')
    if (IMMUTABLE_STATUSES.has(existingStatus)) {
      throw new AccountingApiError(`Cannot update a billing link with status "${existingStatus}".`, 400)
    }

    const data: Record<string, unknown> = {}
    if (body.enrollment !== undefined) {
      const enrollmentId = Number(body.enrollment) || 0
      const duplicate = await payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        where: { enrollment: { equals: enrollmentId } },
        depth: 0,
        limit: 2,
        overrideAccess: true,
      })
      const isDuplicate = duplicate.docs.some((d) => String(d.id) !== String(parseNumberParam(id) || id))
      if (isDuplicate) {
        throw new AccountingApiError('This enrollment already has a billing link. Each enrollment can have only one billing link.', 409)
      }
      data.enrollment = enrollmentId
      const enrollment = await payload.findByID({
        collection: 'course-enrollments',
        id: enrollmentId,
        depth: 1,
        overrideAccess: true,
      }) as unknown as { course?: { id?: number | string } | number | string | null; student?: { id?: number | string } | number | string | null } | undefined
      if (enrollment) {
        const c = enrollment.course
        data.course = c ? (typeof c === 'number' || typeof c === 'string' ? Number(c) || 0 : Number(c.id) || 0) : 0
        const s = enrollment.student
        data.trainee = s ? (typeof s === 'number' || typeof s === 'string' ? Number(s) || 0 : Number(s.id) || 0) : 0
      }
    }
    if (body.user !== undefined) data.user = body.user ? Number(body.user) || 0 : undefined
    if (body.invoice !== undefined) data.invoice = body.invoice ? Number(body.invoice) || 0 : undefined
    if (body.customer !== undefined) data.customer = body.customer ? Number(body.customer) || 0 : undefined
    if (body.billingStatus !== undefined) data.billingStatus = String(body.billingStatus || 'not_started')
    if (body.sourceType !== undefined) data.sourceType = String(body.sourceType || 'enrollment')
    if (body.sourceReference !== undefined) data.sourceReference = String(body.sourceReference || '').trim()
    if (body.listPriceSnapshot !== undefined) data.listPriceSnapshot = Math.max(0, Number(body.listPriceSnapshot) || 0)
    if (body.salePriceSnapshot !== undefined) data.salePriceSnapshot = Math.max(0, Number(body.salePriceSnapshot) || 0)
    if (body.couponDiscountSnapshot !== undefined) data.couponDiscountSnapshot = Math.max(0, Number(body.couponDiscountSnapshot) || 0)
    if (body.scholarshipDiscountSnapshot !== undefined) data.scholarshipDiscountSnapshot = Math.max(0, Number(body.scholarshipDiscountSnapshot) || 0)
    if (body.corporateCoverageSnapshot !== undefined) data.corporateCoverageSnapshot = Math.max(0, Number(body.corporateCoverageSnapshot) || 0)
    if (body.adjustmentsNetSnapshot !== undefined) data.adjustmentsNetSnapshot = Number(body.adjustmentsNetSnapshot) || 0
    if (body.finalChargeSnapshot !== undefined) data.finalChargeSnapshot = Math.max(0, Number(body.finalChargeSnapshot) || 0)
    if (body.recognizedRevenueSnapshot !== undefined) data.recognizedRevenueSnapshot = Math.max(0, Number(body.recognizedRevenueSnapshot) || 0)
    if (body.currency !== undefined) data.currency = String(body.currency || 'PHP')
    if (body.notes !== undefined) data.notes = String(body.notes || '').trim() || null
    data.updatedBy = user.id

    const record = await payload.update({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: parseNumberParam(id) || id,
      depth: 2,
      overrideAccess: true,
      data: data as never,
    })

    return NextResponse.json(await buildDetail(record as unknown as Record<string, unknown>))
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

async function deleteChildRecords(payload: Payload, linkId: number | string) {
  const CHILD_COLLECTIONS = [
    ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
    ACCOUNTING_COLLECTION_SLUGS.paymentAllocations,
    ACCOUNTING_COLLECTION_SLUGS.receipts,
    ACCOUNTING_COLLECTION_SLUGS.refunds,
    ACCOUNTING_COLLECTION_SLUGS.revenueRecognitionSchedules,
    ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
    ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
  ] as const
  for (const slug of CHILD_COLLECTIONS) {
    let page = 1
    let totalPages = 1
    do {
      const result = await payload.find({
        collection: slug,
        where: { enrollmentBillingLink: { equals: linkId } },
        depth: 0,
        limit: 200,
        page,
        overrideAccess: true,
      })
      for (const doc of result.docs) {
        await payload.delete({ collection: slug, id: doc.id, overrideAccess: true })
      }
      totalPages = result.totalPages || 1
      page += 1
    } while (page <= totalPages)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { id } = await context.params
    const linkId = parseNumberParam(id) || id

    const existing = await payload.findByID({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: linkId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as Record<string, unknown> | undefined

    if (!existing) throw new AccountingApiError('Enrollment billing link not found', 404)

    const existingStatus = String(existing.billingStatus || '')
    if (IMMUTABLE_STATUSES.has(existingStatus)) {
      throw new AccountingApiError(
        `Cannot delete a billing link with status "${existingStatus}".`,
        409,
      )
    }

    await deleteChildRecords(payload, linkId)

    await payload.delete({
      collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
      id: linkId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
