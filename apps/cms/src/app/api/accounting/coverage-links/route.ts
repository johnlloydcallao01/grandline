import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../_utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)

    const [scholarshipAwards, corporateBillingLinks] = await Promise.all([
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
        depth: 2,
        limit: 100,
        sort: '-createdAt',
        overrideAccess: true,
      }),
      payload.find({
        collection: ACCOUNTING_COLLECTION_SLUGS.corporateBillingLinks,
        depth: 2,
        limit: 100,
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

    const allRows = [...scholarshipRows, ...corporateRows].sort(
      (a, b) => String(b.id).localeCompare(String(a.id)),
    )

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
        filters: [
          { label: 'Scholarship Awards', value: 'scholarship' },
          { label: 'Corporate Billing Links', value: 'corporate' },
          { label: 'Active', value: 'active' },
        ],
        metrics: [
          { label: 'Scholarship Awards', value: String(scholarshipAwards.totalDocs), change: 'Awards tied to sponsor coverage', trend: 'up' as const },
          { label: 'Corporate Billing Links', value: String(corporateBillingLinks.totalDocs), change: 'Company coverage links on billing records', trend: 'up' as const },
          { label: 'Active Coverage Links', value: String(activeScholarshipCount + activeCorporateCount), change: 'Links currently affecting billing sync', trend: 'up' as const },
          { label: 'Total Records', value: String(allRows.length), change: 'Combined coverage records', trend: 'neutral' as const },
        ],
        table: {
          title: 'Coverage Link Register',
          description: 'Coverage links drawn from scholarship awards and corporate billing-link records in the backend.',
          columns: ['Link Type', 'Entity', 'Coverage Type', 'Covered Amount', 'Trainee Share', 'Status'],
          rows: allRows.map((row) => ({
            id: row.id,
            cells: row.cells,
          })),
        },
      },
    })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
