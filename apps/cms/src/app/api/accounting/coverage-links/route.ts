import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')))
    const statuses = searchParams.getAll('status')
    const quickFilters = searchParams.getAll('quickFilter')

    const awardWhere: Record<string, unknown> = {}
    if (search.trim()) {
      awardWhere.or = [
        { 'enrollmentBillingLink.sourceReference': { like: search } } as never,
        { 'scholarshipSponsor.name': { like: search } } as never,
        { 'scholarshipSponsor.sponsorCode': { like: search } } as never,
        { notes: { like: search } } as never,
      ]
    }
    if (statuses.length > 0) {
      awardWhere.status = { in: statuses } as never
    }

    const billingWhere: Record<string, unknown> = {}
    if (search.trim()) {
      billingWhere.or = [
        { 'corporateAccount.name': { like: search } } as never,
        { 'corporateAccount.accountCode': { like: search } } as never,
        { 'enrollmentBillingLink.sourceReference': { like: search } } as never,
        { 'invoice.invoiceNumber': { like: search } } as never,
        { notes: { like: search } } as never,
      ]
    }
    if (statuses.length > 0) {
      billingWhere.status = { in: statuses } as never
    }

    const [scholarshipAwards, corporateBillingLinks] = await Promise.all([
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
        where: awardWhere as never,
        depth: 2,
        limit: 200,
        sort: '-createdAt',
        overrideAccess: true,
      }),
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
        where: billingWhere as never,
        depth: 2,
        limit: 200,
        sort: '-createdAt',
        overrideAccess: true,
      }),
    ])

    const scholarshipRows = scholarshipAwards.docs.map((doc) => {
      const sponsor = doc.scholarshipSponsor as unknown as Record<string, unknown> | undefined
      const sponsorName = sponsor?.name || sponsor?.sponsorCode || `Sponsor #${doc.scholarshipSponsor}`
      return {
        id: `scholarship-${doc.id}`,
        linkType: 'Scholarship Award',
        entity: sponsorName,
        coverageType: doc.awardType || '-',
        coveredAmount: doc.awardAmount ?? 0,
        traineeShareAmount: doc.traineeShareAmount ?? 0,
        status: doc.status || '-',
        cells: [
          'Scholarship Award',
          { text: sponsorName, emphasis: true },
          doc.awardType || '-',
          { text: `PHP ${(doc.awardAmount ?? 0).toLocaleString()}`, emphasis: true, align: 'right' as const },
          { text: `PHP ${(doc.traineeShareAmount ?? 0).toLocaleString()}`, align: 'right' as const },
          { text: doc.status || '-', tone: doc.status === 'active' ? 'green' as const : 'amber' as const },
        ],
      }
    })

    const corporateRows = corporateBillingLinks.docs.map((doc) => {
      const account = doc.corporateAccount as unknown as Record<string, unknown> | undefined
      const accountName = account?.name || account?.accountCode || `Account #${doc.corporateAccount}`
      return {
        id: `corporate-${doc.id}`,
        linkType: 'Corporate Billing Link',
        entity: accountName,
        coverageType: doc.coverageType || '-',
        coveredAmount: doc.coveredAmount ?? 0,
        traineeShareAmount: doc.traineeShareAmount ?? 0,
        status: doc.status || '-',
        cells: [
          'Corporate Billing Link',
          { text: accountName, emphasis: true },
          doc.coverageType || '-',
          { text: `PHP ${(doc.coveredAmount ?? 0).toLocaleString()}`, emphasis: true, align: 'right' as const },
          { text: `PHP ${(doc.traineeShareAmount ?? 0).toLocaleString()}`, align: 'right' as const },
          { text: doc.status || '-', tone: doc.status === 'active' ? 'green' as const : 'amber' as const },
        ],
      }
    })

    let allRows = [...scholarshipRows, ...corporateRows]

    if (quickFilters.includes('scholarship') && !quickFilters.includes('corporate')) {
      allRows = allRows.filter((r) => r.linkType === 'Scholarship Award')
    } else if (quickFilters.includes('corporate') && !quickFilters.includes('scholarship')) {
      allRows = allRows.filter((r) => r.linkType === 'Corporate Billing Link')
    }
    if (quickFilters.includes('active')) {
      allRows = allRows.filter((r) => r.status === 'active')
    }

    allRows.sort((a, b) => String(b.id).localeCompare(String(a.id)))

    const totalDocs = allRows.length
    const totalPages = Math.ceil(totalDocs / limit) || 1
    const safePage = Math.min(page, totalPages)
    const startIdx = (safePage - 1) * limit
    const paginatedRows = allRows.slice(startIdx, startIdx + limit)

    const activeScholarshipCount = scholarshipAwards.docs.filter(
      (d) => d.status === 'active',
    ).length

    const activeCorporateCount = corporateBillingLinks.docs.filter(
      (d) => d.status === 'active',
    ).length

    return NextResponse.json({
      section: {
        id: 'coverage-links',
        label: 'Coverage Links',
        description: 'Review sponsor awards and corporate billing links that connect enrollment billing to payer entities.',
        searchPlaceholder: 'Search sponsor, corporate account, coverage type, enrollment link, or status',
        filters: {
          quickFilters: [
            { label: 'Scholarship Awards', value: 'scholarship' },
            { label: 'Corporate Billing Links', value: 'corporate' },
            { label: 'Active', value: 'active' },
          ],
        },
        metrics: [
          { id: 'scholarship-awards', label: 'Scholarship Awards', value: String(scholarshipAwards.totalDocs), change: 'Awards tied to sponsor coverage', trend: 'up' as const },
          { id: 'corporate-links', label: 'Corporate Billing Links', value: String(corporateBillingLinks.totalDocs), change: 'Company coverage links on billing records', trend: 'up' as const },
          { id: 'active-links', label: 'Active Coverage Links', value: String(activeScholarshipCount + activeCorporateCount), change: 'Links currently affecting billing sync', trend: 'up' as const },
          { id: 'total-links', label: 'Total Records', value: String(totalDocs), change: 'Combined coverage records', trend: 'neutral' as const },
        ],
        table: {
          title: 'Coverage Link Register',
          description: 'Coverage links drawn from scholarship awards and corporate billing-link records in the backend.',
          columns: ['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status'],
          rows: paginatedRows.map((row) => ({
            id: row.id,
            linkType: row.linkType,
            entity: row.entity,
            coverageType: row.coverageType,
            coveredAmount: row.coveredAmount,
            traineeShareAmount: row.traineeShareAmount,
            status: row.status,
            cells: row.cells,
          })),
        },
      },
      appliedFilters: {
        search,
        statuses,
        quickFilters,
      },
      pagination: {
        page: safePage,
        limit,
        totalDocs,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
      },
      totals: {
        totalRows: totalDocs,
        filteredRows: totalDocs,
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
