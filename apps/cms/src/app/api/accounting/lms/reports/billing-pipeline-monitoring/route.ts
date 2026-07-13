import { NextRequest, NextResponse } from 'next/server'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount } from '@/accounting/utils/amounts'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

type PipelineRow = {
  id: string
  sourceReference: string
  courseTitle: string
  traineeName: string
  billingStatus: string
  billingStatusLabel: string
  billingStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  finalCharge: number
  finalChargeLabel: string
  customerLabel: string
  customerId: string | null
  actionStage: string
  invoiceId: string | null
  enrollmentId: string | null
}

type PipelineResponse = {
  tab: string
  metrics: Array<{ id: string; label: string; value: string; change: string; trend: 'up' | 'down' | 'neutral' }>
  rows: PipelineRow[]
  pagination: { page: number; limit: number; totalDocs: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean }
  totals: { totalRows: number; filteredRows: number }
}

function getCourseTitle(course: unknown): string {
  if (!course || typeof course !== 'object') return 'Unknown Course'
  const c = course as Record<string, unknown>
  return (c.title as string) || `Course #${c.id || '?'}`
}

function getTraineeName(trainee: unknown): string {
  if (!trainee || typeof trainee !== 'object') return 'Unknown Trainee'
  const t = trainee as Record<string, unknown>
  const user = t.user
  if (user && typeof user === 'object') {
    const u = user as Record<string, unknown>
    const parts = [u.firstName, u.lastName].filter(Boolean)
    if (parts.length > 0) return parts.join(' ')
  }
  return `Trainee #${t.id || '?'}`
}

function getCustomerLabel(customer: unknown): string {
  if (!customer || typeof customer !== 'object') return ''
  const c = customer as Record<string, unknown>
  return (c.displayName as string) || `Customer #${c.id || '?'}`
}

function getBillingStatusMeta(status: string): { label: string; tone: 'amber' | 'blue' | 'gray' | 'green' | 'red' } {
  switch (status) {
    case 'not_started': return { label: 'Not Started', tone: 'amber' }
    case 'drafted': return { label: 'Drafted', tone: 'blue' }
    case 'invoiced': return { label: 'Invoiced', tone: 'green' }
    case 'partially_paid': return { label: 'Partially Paid', tone: 'blue' }
    case 'paid': return { label: 'Paid', tone: 'green' }
    case 'cancelled': return { label: 'Cancelled', tone: 'gray' }
    case 'refunded': return { label: 'Refunded', tone: 'red' }
    default: return { label: status, tone: 'gray' }
  }
}

function getActionStage(billingStatus: string, customerId: string | null, invoiceId: string | null): string {
  if (billingStatus === 'not_started') return customerId ? 'Needs billing link review' : 'Needs customer creation'
  if (billingStatus === 'drafted') return 'Invoice pending'
  if (billingStatus === 'invoiced' && invoiceId) return 'Awaiting allocation'
  if (billingStatus === 'invoiced') return 'Invoice sent'
  if (billingStatus === 'partially_paid') return 'Partial payment received'
  if (billingStatus === 'paid') return 'Fully settled'
  if (billingStatus === 'cancelled') return 'Cancelled'
  if (billingStatus === 'refunded') return 'Refunded'
  return 'Review needed'
}

function searchMatches(row: PipelineRow, search: string): boolean {
  if (!search) return true
  const s = search.toLowerCase()
  return (
    row.sourceReference.toLowerCase().includes(s) ||
    row.courseTitle.toLowerCase().includes(s) ||
    row.traineeName.toLowerCase().includes(s) ||
    row.billingStatusLabel.toLowerCase().includes(s) ||
    row.finalChargeLabel.toLowerCase().includes(s) ||
    row.actionStage.toLowerCase().includes(s)
  )
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'pending-enrollment-billing'
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))

    if (tab === 'pending-enrollment-billing') {
      const links = await findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 3,
      })

      const allRows: PipelineRow[] = links.map((link: any) => {
        const customerId = getRelationshipId(link.customer)
        const invoiceId = getRelationshipId(link.invoice)
        const billingStatus = String(link.billingStatus || 'not_started')
        const { label, tone } = getBillingStatusMeta(billingStatus)
        const finalCharge = normalizeAmount(link.finalChargeSnapshot)
        const customerLabel = getCustomerLabel(link.customer)

        return {
          id: String(link.id),
          sourceReference: String(link.sourceReference || `BL-${link.id}`),
          courseTitle: getCourseTitle(link.course),
          traineeName: getTraineeName(link.trainee),
          billingStatus,
          billingStatusLabel: label,
          billingStatusTone: tone,
          finalCharge,
          finalChargeLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(finalCharge),
          customerLabel,
          customerId: customerId ? String(customerId) : null,
          actionStage: getActionStage(billingStatus, customerId ? String(customerId) : null, invoiceId ? String(invoiceId) : null),
          invoiceId: invoiceId ? String(invoiceId) : null,
          enrollmentId: String(getRelationshipId(link.enrollment) || ''),
        }
      })

      const filteredRows = search ? allRows.filter((r) => searchMatches(r, search)) : allRows
      const totalDocs = filteredRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = filteredRows.slice(offset, offset + limit)

      const notStartedCount = allRows.filter((r) => r.billingStatus === 'not_started').length
      const needsCustomerCount = allRows.filter((r) => r.billingStatus === 'not_started' && !r.customerId).length
      const totalPendingCharge = allRows.filter((r) => ['not_started', 'drafted'].includes(r.billingStatus)).reduce((s, r) => s + r.finalCharge, 0)

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'pending-requests', label: 'Pending Requests', value: String(filteredRows.length), change: 'Pending LMS enrollment requests from the dashboard summary', trend: 'neutral' },
          { id: 'estimated-billings', label: 'Estimated Pending Billings', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalPendingCharge), change: 'Estimated billing value tied to pending requests', trend: 'up' },
          { id: 'not-started', label: 'Links Not Started', value: String(notStartedCount), change: 'Billing links still in not-started state', trend: 'neutral' },
          { id: 'needs-customer', label: 'Needs Customer Setup', value: String(needsCustomerCount), change: 'Enrollments still needing billing-customer resolution', trend: 'down' },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      } as PipelineResponse)
    }

    if (tab === 'corporate-receivables') {
      const corpLinks = await findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
        depth: 3,
      })

      const corpRows = corpLinks.map((link: any) => {
        const corporateAccount = link.corporateAccount || {}
        const invoice = link.invoice || {}
        const coveredAmount = normalizeAmount(link.coveredAmount)
        const status = String(link.status || 'active')
        const statusTone = status === 'active' ? 'green' as const : status === 'inactive' ? 'gray' as const : 'amber' as const
        const accountName = String(corporateAccount?.name || 'Unknown Account')
        const accountCode = String(corporateAccount?.accountCode || '')

        return {
          id: String(link.id),
          accountCode: accountCode || `CORP-${link.id}`,
          accountName,
          invoiceNumber: String(invoice?.invoiceNumber || ''),
          coveredAmount,
          coveredAmountLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(coveredAmount),
          balanceDue: normalizeAmount(invoice?.balanceDue || coveredAmount),
          balanceDueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(normalizeAmount(invoice?.balanceDue || coveredAmount)),
          status,
          statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
          statusTone,
          coverageType: String(link.coverageType || 'full_company_pay'),
          cells: [],
        }
      })

      const totalDocs = corpRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = corpRows.slice(offset, offset + limit)
      const totalBalance = corpRows.reduce((s, r) => s + r.balanceDue, 0)
      const activeCount = corpRows.filter((r) => r.status === 'active').length
      const sharedCount = corpRows.filter((r) => r.coverageType === 'shared_pay').length

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'corp-balance', label: 'Corporate Balance Due', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalBalance), change: 'Outstanding corporate receivable balance from active links', trend: 'up' },
          { id: 'active-links', label: 'Active Corporate Links', value: String(activeCount), change: 'Corporate billing links contributing to the report', trend: 'up' },
          { id: 'shared-coverage', label: 'Shared Coverage', value: String(sharedCount), change: 'Rows where trainee share still remains', trend: 'neutral' },
          { id: 'avg-balance', label: 'Average Corporate Balance', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(corpRows.length > 0 ? totalBalance / corpRows.length : 0), change: 'Average balance due per active corporate row', trend: 'neutral' },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: corpRows.length, filteredRows: pagedRows.length },
      })
    }

    if (tab === 'trainee-collections') {
      const links = await findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.enrollmentBillingLinks,
        depth: 3,
      })

      const unpaidLinks = links.filter((link: any) => {
        const status = String(link.billingStatus || 'not_started')
        return ['not_started', 'drafted', 'invoiced', 'partially_paid'].includes(status)
      })

      const collRows = unpaidLinks.map((link: any) => {
        const finalCharge = normalizeAmount(link.finalChargeSnapshot)
        const billingStatus = String(link.billingStatus || 'not_started')
        const customerId = getRelationshipId(link.customer)
        const traineeId = getRelationshipId(link.trainee)
        let priority: string
        let priorityTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
        if (finalCharge >= 30000) { priority = 'High'; priorityTone = 'amber' }
        else if (finalCharge >= 10000) { priority = 'Medium'; priorityTone = 'blue' }
        else { priority = 'Low'; priorityTone = 'gray' }

        let collectionState: string
        if (billingStatus === 'not_started') collectionState = 'Outstanding'
        else if (billingStatus === 'drafted') collectionState = 'Awaiting payment'
        else if (billingStatus === 'invoiced') collectionState = 'Invoice sent'
        else collectionState = 'Partially sponsored'

        return {
          id: String(link.id),
          sourceReference: String(link.sourceReference || `ENR-${link.id}`),
          traineeId: traineeId ? `TRN-${traineeId}` : '-',
          customerIdRef: customerId ? `CUST-${customerId}` : '-',
          amountDue: finalCharge,
          amountDueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(finalCharge),
          priority,
          priorityTone,
          collectionState,
          billingStatus,
          customerLabel: getCustomerLabel(link.customer),
          traineeName: getTraineeName(link.trainee),
          cells: [],
        }
      }).sort((a: any, b: any) => b.amountDue - a.amountDue)

      const totalDocs = collRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = collRows.slice(offset, offset + limit)
      const totalDue = collRows.reduce((s: number, r: any) => s + r.amountDue, 0)
      const largestDue = collRows.length > 0 ? collRows[0].amountDue : 0

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'outstanding-due', label: 'Outstanding Trainee Due', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalDue), change: 'Open trainee-side collection balance in the current top list', trend: 'up' },
          { id: 'total-rows', label: 'Unbilled Enrollments', value: String(collRows.length), change: 'Enrollments with pending charges', trend: 'neutral' },
          { id: 'avg-due', label: 'Average Due', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(collRows.length > 0 ? totalDue / collRows.length : 0), change: 'Average due per trainee-collection row', trend: 'neutral' },
          { id: 'largest-due', label: 'Largest Due', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(largestDue), change: 'Highest single trainee balance in the ranked list', trend: 'up' },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: collRows.length, filteredRows: pagedRows.length },
      })
    }

    return NextResponse.json({ error: `Unknown tab: ${tab}` }, { status: 400 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
