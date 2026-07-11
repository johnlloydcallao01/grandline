import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS, LMS_ADJUSTMENT_DIRECTION_OPTIONS, LMS_ADJUSTMENT_TYPE_OPTIONS } from '@/accounting/constants/accounting'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

type AdjustmentDoc = {
  id: number | string
  enrollmentBillingLink?: { id?: number | string; sourceReference?: string | null; finalChargeSnapshot?: number | null } | number | string | null
  adjustmentType?: string | null
  reason?: string | null
  amount?: number | null
  direction?: string | null
  approvedBy?: { id?: number | string; name?: string | null; email?: string | null } | number | string | null
  appliedAt?: string | null
  notes?: string | null
}

type EnrollmentBillingLinkDoc = {
  id: number | string
  sourceReference?: string | null
  finalChargeSnapshot?: number | null
  course?: { id?: number | string; title?: string | null; courseCode?: string | null } | number | string | null
}

type Cell = string | { text: string; tone?: 'amber' | 'blue' | 'gray' | 'green' | 'red'; emphasis?: boolean; align?: 'left' | 'right' | 'center' }

type AdjustmentRow = {
  id: string
  enrollmentBillingLinkId: string
  enrollmentBillingLinkLabel: string
  adjustmentType: string
  adjustmentTypeLabel: string
  reason: string
  amount: number
  amountLabel: string
  direction: string
  directionLabel: string
  directionTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  approvedById: string
  approvedByLabel: string
  appliedAt: string | null
  appliedAtLabel: string
  notes: string
  searchableText: string
  cells: Cell[]
}

const TYPE_LABELS = new Map<string, string>(LMS_ADJUSTMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]))
const DIRECTION_LABELS = new Map<string, string>(LMS_ADJUSTMENT_DIRECTION_OPTIONS.map((o) => [o.value, o.label]))

const parseIntegerParam = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const p = Number(value)
  return Number.isFinite(p) ? p : fallback
}

const parseListParam = (searchParams: URLSearchParams, key: string): string[] =>
  Array.from(new Set(searchParams.getAll(key).flatMap((v) => String(v || '').split(',')).map((v) => v.trim()).filter(Boolean)))

const normalizeSearch = (value: unknown) => String(value ?? '').toLowerCase().trim()

const formatDate = (value: string | null | undefined) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

const getDirectionTone = (direction: string | null | undefined): 'amber' | 'blue' | 'gray' | 'green' | 'red' => {
  if (direction === 'increase') return 'blue'
  if (direction === 'decrease') return 'amber'
  return 'gray'
}

const buildBillingLinkLabel = (link: AdjustmentDoc['enrollmentBillingLink']) => {
  if (!link) return '-'
  if (typeof link === 'number' || typeof link === 'string') return String(link)
  return String(link.sourceReference || `Link ${link.id || ''}`)
}

const buildApprovedByLabel = (user: AdjustmentDoc['approvedBy']) => {
  if (!user) return '-'
  if (typeof user === 'number' || typeof user === 'string') return String(user)
  return String(user.name || user.email || `User ${user.id || ''}`)
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const adjustmentTypes = parseListParam(searchParams, 'adjustmentType')
    const directions = parseListParam(searchParams, 'direction')
    const quickFilters = parseListParam(searchParams, 'quickFilter')
    const page = Math.max(1, parseIntegerParam(searchParams.get('page'), 1))
    const limit = Math.min(100, Math.max(1, parseIntegerParam(searchParams.get('limit'), 10)))

    const [adjustments, billingLinks] = await Promise.all([
      findAllDocs<AdjustmentDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
        depth: 2,
        sort: '-appliedAt',
      }),
      findAllDocs<EnrollmentBillingLinkDoc>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 1,
        sort: '-linkedAt',
      }),
    ])

    const allRows = adjustments.map<AdjustmentRow>((adj) => {
      const adjType = String(adj.adjustmentType || '')
      const dir = String(adj.direction || '')
      const linkId = String(getRelationshipId(adj.enrollmentBillingLink) || '')
      const linkLabel = buildBillingLinkLabel(adj.enrollmentBillingLink)
      const amount = normalizeAmount(adj.amount)
      const approvedById = String(getRelationshipId(adj.approvedBy) || '')
      const approvedByLabel = buildApprovedByLabel(adj.approvedBy)

      return {
        id: String(adj.id),
        enrollmentBillingLinkId: linkId,
        enrollmentBillingLinkLabel: linkLabel,
        adjustmentType: adjType,
        adjustmentTypeLabel: TYPE_LABELS.get(adjType) || adjType || '-',
        reason: String(adj.reason || ''),
        amount,
        amountLabel: formatCurrency(amount),
        direction: dir,
        directionLabel: DIRECTION_LABELS.get(dir) || dir || '-',
        directionTone: getDirectionTone(dir),
        approvedById,
        approvedByLabel,
        appliedAt: adj.appliedAt || null,
        appliedAtLabel: formatDate(adj.appliedAt),
        notes: String(adj.notes || ''),
        searchableText: [linkLabel, adjType, dir, amount, approvedByLabel, adj.appliedAt, adj.notes].map((v) => normalizeSearch(v)).filter(Boolean).join(' '),
        cells: [
          { text: linkLabel, emphasis: true },
          TYPE_LABELS.get(adjType) || adjType || '-',
          { text: DIRECTION_LABELS.get(dir) || dir || '-', tone: getDirectionTone(dir) },
          { text: formatCurrency(amount), align: 'right' },
          approvedByLabel,
          formatDate(adj.appliedAt),
        ],
      }
    })

    const normalizedSearch = normalizeSearch(search)
    const filteredRows = allRows.filter((row) => {
      if (normalizedSearch && !row.searchableText.includes(normalizedSearch)) return false
      if (adjustmentTypes.length > 0 && !adjustmentTypes.includes(row.adjustmentType)) return false
      if (directions.length > 0 && !directions.includes(row.direction)) return false
      if (quickFilters.length > 0) {
        const match = quickFilters.some((qf) => {
          if (qf.startsWith('adjustmentType:')) return row.adjustmentType === qf.slice(15)
          if (qf.startsWith('direction:')) return row.direction === qf.slice(10)
          return false
        })
        if (!match) return false
      }
      return true
    })

    const totalDocs = filteredRows.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const paginatedRows = filteredRows.slice((page - 1) * limit, page * limit)

    const increaseCount = allRows.filter((r) => r.direction === 'increase').length
    const decreaseCount = allRows.filter((r) => r.direction === 'decrease').length
    const netAdjustment = allRows.reduce((s, r) => s + (r.direction === 'increase' ? r.amount : -r.amount), 0)

    return NextResponse.json({
      section: {
        id: 'billing-adjustments',
        label: 'Billing Adjustments',
        description: 'Manual LMS billing adjustments layered on top of course pricing snapshots on enrollment billing links.',
        searchPlaceholder: 'Search billing link, adjustment type, direction, amount, approver, or applied date',
        filters: {
          adjustmentTypes: LMS_ADJUSTMENT_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          directions: LMS_ADJUSTMENT_DIRECTION_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
          quickFilters: [
            { label: 'Increase Adjustments', value: 'direction:increase' },
            { label: 'Decrease Adjustments', value: 'direction:decrease' },
            { label: 'Certificate Fees', value: 'adjustmentType:certificate_fee' },
            { label: 'Late Fees', value: 'adjustmentType:late_fee' },
          ],
        },
        metrics: [
          { id: 'total-adjustments', label: 'Adjustments', value: allRows.length, change: 'Manual billing adjustments layered on LMS links', trend: allRows.length > 0 ? 'up' as const : 'neutral' as const },
          { id: 'increase-adjustments', label: 'Increase Adjustments', value: increaseCount, change: 'Adjustments increasing billed value or charges', trend: increaseCount > 0 ? 'up' as const : 'neutral' as const },
          { id: 'decrease-adjustments', label: 'Decrease Adjustments', value: decreaseCount, change: 'Adjustments reducing billed value', trend: decreaseCount > 0 ? 'neutral' as const : 'down' as const },
          { id: 'net-adjustment', label: 'Net Adjustment', value: formatCurrency(netAdjustment), change: 'Net impact of current active LMS adjustments', trend: netAdjustment > 0 ? 'up' as const : netAdjustment < 0 ? 'down' as const : 'neutral' as const },
        ],
        table: {
          title: 'Billing Adjustment Register',
          description: 'Adjustment records aligned to accounting-billing-adjustments, including billing link, type, direction, amount, approver, and applied date.',
          columns: ['Billing Link', 'Adjustment Type', 'Direction', 'Amount', 'Approved By', 'Applied At'],
          rows: paginatedRows,
        },
      },
      appliedFilters: {
        search,
        adjustmentTypes,
        directions,
        quickFilters,
      },
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
      totals: {
        totalRows: allRows.length,
        filteredRows: totalDocs,
      },
      referenceData: {
        enrollmentBillingLinks: billingLinks.map((link) => ({
          id: link.id,
          sourceReference: link.sourceReference || null,
          finalChargeSnapshot: normalizeAmount(link.finalChargeSnapshot),
        })),
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload, user } = await requireAccountingAdmin(request)
    const body = await request.json()

    if (!body.enrollmentBillingLink) throw new Error('Enrollment billing link is required.')
    if (!body.adjustmentType) throw new Error('Adjustment type is required.')
    if (body.amount === undefined || body.amount === null || Number(body.amount) < 0) throw new Error('A valid non-negative amount is required.')

    const record = await payload.create({
      collection: ACCOUNTING_COLLECTION_SLUGS.billingAdjustments,
      overrideAccess: true,
      data: {
        enrollmentBillingLink: Number(body.enrollmentBillingLink) || 0,
        adjustmentType: String(body.adjustmentType || ''),
        reason: String(body.reason || '').trim() || null,
        amount: Math.max(0, Number(body.amount) || 0),
        direction: String(body.direction || 'increase'),
        approvedBy: body.approvedBy ? Number(body.approvedBy) : undefined,
        appliedAt: body.appliedAt || new Date().toISOString(),
        notes: String(body.notes || '').trim() || null,
        createdBy: user.id,
        updatedBy: user.id,
      } as never,
      depth: 0,
    })

    return NextResponse.json({ id: record.id }, { status: 201 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
