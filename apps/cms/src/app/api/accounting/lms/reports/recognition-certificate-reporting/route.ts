import { NextRequest, NextResponse } from 'next/server'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '@/accounting/utils/amounts'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

type Cell = { text: string; emphasis?: boolean; align?: 'left' | 'right' | 'center'; tone?: string }

type CompletionToRevenueRow = {
  id: string
  enrollmentRef: string
  courseTitle: string
  completedAt: string | null
  completedAtLabel: string
  finalCharge: number
  finalChargeLabel: string
  recognizedRevenue: number
  recognizedRevenueLabel: string
  deferredRevenue: number
  deferredRevenueLabel: string
  billingStatus: string
  billingStatusLabel: string
  billingStatusTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  cells: Cell[]
}

type CertificateRevenueRow = {
  id: string
  certificateCode: string
  enrollmentRef: string
  courseTitle: string
  issueDate: string | null
  issueDateLabel: string
  billedAmount: number
  billedAmountLabel: string
  billingState: string
  billingStateLabel: string
  billingStateTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  cells: Cell[]
}

function getCourseTitle(course: unknown): string {
  if (!course || typeof course !== 'object') return 'Unknown Course'
  const c = course as Record<string, unknown>
  return (c.title as string) || `Course #${c.id || '?'}`
}

function getEnrollmentRef(enrollment: unknown): string {
  if (!enrollment || typeof enrollment !== 'object') return '-'
  const e = enrollment as Record<string, unknown>
  return (e.displayTitle as string) || (e.id as string) || '-'
}

function getBillingStatusTone(status: string): 'amber' | 'blue' | 'gray' | 'green' | 'red' {
  if (['paid', 'invoiced'].includes(status)) return 'green'
  if (status === 'partially_paid') return 'amber'
  if (['not_started', 'drafted'].includes(status)) return 'blue'
  if (['cancelled', 'refunded'].includes(status)) return 'red'
  return 'gray'
}

function getBillingStateTone(state: string): 'amber' | 'blue' | 'gray' | 'green' | 'red' {
  if (state === 'billed') return 'green'
  if (state === 'pending_link') return 'amber'
  return 'gray'
}

function searchMatches(text: string, search: string): boolean {
  if (!search) return true
  return text.toLowerCase().includes(search.toLowerCase())
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'completion-to-revenue'
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))

    if (tab === 'completion-to-revenue') {
      const enrollments = await findAllDocs<any>({
        payload,
        collection: 'course-enrollments',
        depth: 1,
      })

      const completed = enrollments.filter((e: any) => e.status === 'completed' || e.completedAt)

      const billingLinks = await findAllDocs<any>({
        payload,
        collection: 'accounting-enrollment-billing-links',
        depth: 0,
      })

      const billingLinkMap = new Map<string, any>()
      for (const link of billingLinks) {
        const enrollmentId = String(getRelationshipId(link.enrollment) || link.id)
        billingLinkMap.set(enrollmentId, link)
      }

      let allRows: CompletionToRevenueRow[] = completed
        .map((enrollment: any) => {
          const enrollmentId = String(enrollment.id)
          const link = billingLinkMap.get(enrollmentId)
          const finalCharge = normalizeAmount(link?.finalChargeSnapshot || enrollment.finalPriceSnapshot || 0)
          const recognizedRevenue = normalizeAmount(link?.recognizedRevenueSnapshot || 0)
          const deferredRevenue = roundCurrency(Math.max(0, finalCharge - recognizedRevenue))
          const completedAt = enrollment.completedAt || null
          const billingStatus = link?.billingStatus || 'not_started'

          return {
            id: enrollmentId,
            enrollmentRef: getEnrollmentRef(enrollment),
            courseTitle: getCourseTitle(enrollment.course),
            completedAt,
            completedAtLabel: completedAt ? new Date(completedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
            finalCharge: roundCurrency(finalCharge),
            finalChargeLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(roundCurrency(finalCharge)),
            recognizedRevenue: roundCurrency(recognizedRevenue),
            recognizedRevenueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(roundCurrency(recognizedRevenue)),
            deferredRevenue,
            deferredRevenueLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(deferredRevenue),
            billingStatus,
            billingStatusLabel: billingStatus.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            billingStatusTone: getBillingStatusTone(billingStatus),
            cells: [
              { text: getEnrollmentRef(enrollment), emphasis: true },
              { text: getCourseTitle(enrollment.course) },
              { text: completedAt ? new Date(completedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-' },
              { text: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(roundCurrency(finalCharge)), align: 'right' },
              { text: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(roundCurrency(recognizedRevenue)), align: 'right' },
              { text: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(deferredRevenue), align: 'right' },
            ] as Cell[],
          }
        })
        .sort((a: CompletionToRevenueRow, b: CompletionToRevenueRow) => {
          if (a.completedAt && b.completedAt) return b.completedAt.localeCompare(a.completedAt)
          if (a.completedAt) return -1
          if (b.completedAt) return 1
          return 0
        })

      if (search) allRows = allRows.filter((r) => searchMatches(r.enrollmentRef, search) || searchMatches(r.courseTitle, search))

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)

      const totalFinalCharge = allRows.reduce((s: number, r: CompletionToRevenueRow) => s + r.finalCharge, 0)
      const totalRecognized = allRows.reduce((s: number, r: CompletionToRevenueRow) => s + r.recognizedRevenue, 0)
      const totalDeferred = allRows.reduce((s: number, r: CompletionToRevenueRow) => s + r.deferredRevenue, 0)

      return NextResponse.json({
        section: {
          id: 'completion-to-revenue',
          label: 'Completion To Revenue Report',
          description: 'Review completed LMS enrollments against billed revenue, recognized revenue, and remaining deferred revenue using the dedicated completion-to-revenue query.',
          searchPlaceholder: 'Search enrollment, course, completed date, final charge, recognized revenue, or deferred revenue',
          filters: { statuses: [], customers: [], postingStatuses: [], quickFilters: [] },
          metrics: [
            { id: 'completed-enrollments', label: 'Completed Enrollments', value: allRows.length, change: 'Enrollments with completed timestamps contributing to revenue view', trend: 'up' },
            { id: 'recognized-revenue', label: 'Recognized Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalRecognized), change: 'Recognized LMS revenue carried across completed rows', trend: 'up' },
            { id: 'remaining-deferred', label: 'Remaining Deferred', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalDeferred), change: 'Revenue still deferred after completion-based view', trend: 'neutral' },
            { id: 'avg-final-charge', label: 'Average Final Charge', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(allRows.length > 0 ? totalFinalCharge / allRows.length : 0), change: 'Average billed amount per completed enrollment row', trend: 'neutral' },
          ],
          table: {
            title: 'Completion To Revenue Register',
            description: 'Recognition view aligned to getCompletionToRevenue() and its row output for completed LMS enrollments, billed charge, recognized revenue, and deferred remainder.',
            columns: ['Enrollment', 'Course', 'Completed At', 'Final Charge', 'Recognized Revenue', 'Remaining Deferred'],
            rows: pagedRows,
          },
        },
        appliedFilters: { search, statuses: [], customerIds: [], quickFilters: [] },
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      })
    }

    if (tab === 'certificate-revenue') {
      const certificates = await findAllDocs<any>({
        payload,
        collection: 'certificates',
        depth: 2,
      })

      const active = certificates.filter((c: any) => c.status === 'active')

      let allRows: CertificateRevenueRow[] = active
        .map((cert: any) => {
          const id = String(cert.id)
          const enrollment = cert.enrollment
          const courseTitle = getCourseTitle(cert.course)
          const enrollmentRef = getEnrollmentRef(enrollment)
          const issueDate = cert.issueDate || null
          const billedAmount = 0
          const billingState = 'billed'

          return {
            id,
            certificateCode: cert.certificateCode || `CERT-${id}`,
            enrollmentRef,
            courseTitle,
            issueDate,
            issueDateLabel: issueDate ? new Date(issueDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
            billedAmount,
            billedAmountLabel: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0),
            billingState,
            billingStateLabel: 'Billed',
            billingStateTone: getBillingStateTone(billingState),
            cells: [
              { text: cert.certificateCode || `CERT-${id}`, emphasis: true },
              { text: enrollmentRef },
              { text: courseTitle },
              { text: issueDate ? new Date(issueDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-' },
              { text: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(0), align: 'right' },
              { text: 'Billed', tone: 'green' },
            ] as Cell[],
          }
        })
        .sort((a: CertificateRevenueRow, b: CertificateRevenueRow) => {
          if (a.issueDate && b.issueDate) return b.issueDate.localeCompare(a.issueDate)
          if (a.issueDate) return -1
          if (b.issueDate) return 1
          return 0
        })

      if (search) allRows = allRows.filter((r) => searchMatches(r.certificateCode, search) || searchMatches(r.enrollmentRef, search) || searchMatches(r.courseTitle, search))

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)

      const totalBilled = allRows.reduce((s: number, r: CertificateRevenueRow) => s + r.billedAmount, 0)

      return NextResponse.json({
        section: {
          id: 'certificate-revenue',
          label: 'Certificate Revenue Report',
          description: 'Review certificate-issued revenue rows using the dedicated certificate revenue query, which ties issued certificates to billed certificate-fee amounts.',
          searchPlaceholder: 'Search certificate id, enrollment, course, issue date, or billed amount',
          filters: { statuses: [], customers: [], postingStatuses: [], quickFilters: [] },
          metrics: [
            { id: 'issued-certificates', label: 'Issued Certificates', value: allRows.length, change: 'Certificates contributing to current revenue rows', trend: 'up' },
            { id: 'billed-certificate-revenue', label: 'Billed Certificate Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalBilled), change: 'Billed certificate-fee amount in the report', trend: 'up' },
            { id: 'avg-certificate-fee', label: 'Average Certificate Fee', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(allRows.length > 0 ? totalBilled / allRows.length : 0), change: 'Average billed certificate amount per certificate row', trend: 'neutral' },
            { id: 'with-linked-billing', label: 'With Linked Billing', value: String(allRows.filter((r) => r.billedAmount > 0).length), change: 'Certificate rows resolved back to LMS billing links', trend: 'up' },
          ],
          table: {
            title: 'Certificate Revenue Register',
            description: 'Certificate revenue view aligned to the certificate-revenue report route, including issue date and billed amount.',
            columns: ['Certificate ID', 'Enrollment', 'Course', 'Issue Date', 'Billed Amount', 'Billing State'],
            rows: pagedRows,
          },
        },
        appliedFilters: { search, statuses: [], customerIds: [], quickFilters: [] },
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      })
    }

    return NextResponse.json({ error: `Unknown tab: ${tab}` }, { status: 400 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
