import { NextRequest, NextResponse } from 'next/server'
import { findAllDocs } from '@/accounting/utils/findAllDocs'
import { getRelationshipId } from '@/accounting/utils/accounting-audit'
import { normalizeAmount, roundCurrency } from '@/accounting/utils/amounts'
import { ACCOUNTING_COLLECTION_SLUGS } from '@/accounting/constants/accounting'
import { handleAccountingApiError, requireAccountingAdmin } from '../../../_utils/auth'

type Cell = { text: string; emphasis?: boolean; align?: 'left' | 'right' | 'center'; tone?: string }

type CouponImpactRow = {
  id: string
  couponCode: string
  enrollmentCount: number
  grossRevenue: number
  grossRevenueLabel: string
  discountAmount: number
  discountAmountLabel: string
  netRevenue: number
  netRevenueLabel: string
  impactRatio: number
  impactRatioLabel: string
  impactRatioTone: 'amber' | 'blue' | 'gray' | 'green' | 'red'
  cells: Cell[]
}

type ScholarshipUtilizationRow = {
  id: string
  sponsorCode: string
  sponsorName: string
  awardCount: number
  awardedAmount: number
  awardedAmountLabel: string
  billedSponsorAmount: number
  billedSponsorAmountLabel: string
  traineeShareAmount: number
  traineeShareAmountLabel: string
  cells: Cell[]
}

function getSponsorCode(sponsor: unknown): string {
  if (!sponsor || typeof sponsor !== 'object') return ''
  const s = sponsor as Record<string, unknown>
  return (s.sponsorCode as string) || ''
}

function getSponsorName(sponsor: unknown): string {
  if (!sponsor || typeof sponsor !== 'object') return 'Unknown Sponsor'
  const s = sponsor as Record<string, unknown>
  return (s.name as string) || `Sponsor #${s.id || '?'}`
}

function getImpactTone(ratio: number): 'amber' | 'blue' | 'gray' | 'green' | 'red' {
  if (ratio >= 15) return 'amber'
  if (ratio >= 5) return 'blue'
  if (ratio >= 1) return 'green'
  return 'gray'
}

function searchInRow(row: CouponImpactRow | ScholarshipUtilizationRow, search: string): boolean {
  if (!search) return true
  const s = search.toLowerCase()
  if ('couponCode' in row) return row.couponCode.toLowerCase().includes(s)
  if ('sponsorCode' in row) return (row.sponsorCode.toLowerCase().includes(s) || row.sponsorName.toLowerCase().includes(s))
  return false
}

export async function GET(request: NextRequest) {
  try {
    const { payload } = await requireAccountingAdmin(request)
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'coupon-revenue-impact'
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))

    if (tab === 'coupon-revenue-impact') {
      const redemptions = await findAllDocs<any>({
        payload,
        collection: 'coupon-redemptions',
        depth: 0,
      })

      const applied = redemptions.filter((r: any) => r.status === 'applied')
      const couponMap = new Map<string, { enrollments: Set<string>; grossRevenue: number; discountAmount: number }>()

      for (const redemption of applied) {
        const code = String(redemption.codeSnapshot || 'UNKNOWN').toUpperCase()
        const entry = couponMap.get(code) || { enrollments: new Set(), grossRevenue: 0, discountAmount: 0 }
        entry.enrollments.add(String(getRelationshipId(redemption.courseEnrollment) || redemption.id))
        entry.grossRevenue += normalizeAmount(redemption.subtotalSnapshot)
        entry.discountAmount += normalizeAmount(redemption.discountAmountSnapshot)
        couponMap.set(code, entry)
      }

      let allRows: CouponImpactRow[] = Array.from(couponMap.entries())
        .map(([code, data]) => {
          const grossRevenue = roundCurrency(data.grossRevenue)
          const discountAmount = roundCurrency(data.discountAmount)
          const netRevenue = roundCurrency(Math.max(0, grossRevenue - discountAmount))
          const impactRatio = grossRevenue > 0 ? roundCurrency((discountAmount / grossRevenue) * 100) : 0
          const grossRevenueLabel = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(grossRevenue)
          const discountAmountLabel = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(discountAmount)
          const netRevenueLabel = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(netRevenue)
          const impactRatioLabel = `${impactRatio.toFixed(1)}%`
          return {
            id: code,
            couponCode: code,
            enrollmentCount: data.enrollments.size,
            grossRevenue,
            grossRevenueLabel,
            discountAmount,
            discountAmountLabel,
            netRevenue,
            netRevenueLabel,
            impactRatio,
            impactRatioLabel,
            impactRatioTone: getImpactTone(impactRatio),
            cells: [
              { text: code, emphasis: true },
              { text: String(data.enrollments.size), align: 'right' },
              { text: grossRevenueLabel, align: 'right' },
              { text: discountAmountLabel, align: 'right' },
              { text: netRevenueLabel, align: 'right' },
              { text: impactRatioLabel, tone: getImpactTone(impactRatio) },
            ] as Cell[],
          }
        })
        .sort((a, b) => b.discountAmount - a.discountAmount)

      if (search) allRows = allRows.filter((r) => searchInRow(r, search))

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)
      const totalDiscount = allRows.reduce((s, r) => s + r.discountAmount, 0)
      const totalNetRevenue = allRows.reduce((s, r) => s + r.netRevenue, 0)
      const totalEnrollments = allRows.reduce((s, r) => s + r.enrollmentCount, 0)

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'coupon-campaigns', label: 'Coupon Campaigns', value: String(allRows.length), change: 'Coupon groupings contributing to current LMS impact rows', trend: 'up' },
          { id: 'discount-total', label: 'Discount Amount', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalDiscount), change: 'Total coupon discount impact across LMS links', trend: 'up' },
          { id: 'net-revenue', label: 'Net Revenue', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalNetRevenue), change: 'Net revenue after coupon reductions', trend: 'up' },
          { id: 'coupon-enrollments', label: 'Coupon Enrollments', value: String(totalEnrollments), change: 'Enrollments carrying coupon discounts', trend: 'neutral' },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      })
    }

    if (tab === 'scholarship-utilization') {
      const awards = await findAllDocs<any>({
        payload,
        collection: ACCOUNTING_COLLECTION_SLUGS.scholarshipAwards,
        depth: 2,
      })

      const activeAwards = awards.filter((a: any) => a.status === 'active')
      const sponsorMap = new Map<string, { sponsorCode: string; sponsorName: string; awardCount: number; awardedAmount: number; billedSponsorAmount: number; traineeShareAmount: number }>()

      for (const award of activeAwards) {
        const sponsorId = String(getRelationshipId(award.scholarshipSponsor) || 'unknown')
        const sponsor = award.scholarshipSponsor
        const entry = sponsorMap.get(sponsorId) || {
          sponsorCode: getSponsorCode(sponsor),
          sponsorName: getSponsorName(sponsor),
          awardCount: 0,
          awardedAmount: 0,
          billedSponsorAmount: 0,
          traineeShareAmount: 0,
        }
        entry.sponsorCode = getSponsorCode(sponsor)
        entry.sponsorName = getSponsorName(sponsor)
        entry.awardCount += 1
        const awardedAmount = normalizeAmount(award.awardAmount)
        const traineeShare = normalizeAmount(award.traineeShareAmount)
        entry.awardedAmount += awardedAmount
        entry.traineeShareAmount += traineeShare
        if (award.awardType === 'third_party_billed') {
          entry.billedSponsorAmount += awardedAmount
        }
        sponsorMap.set(sponsorId, entry)
      }

      let allRows: ScholarshipUtilizationRow[] = Array.from(sponsorMap.entries())
        .map(([sponsorId, data]) => {
          const awardedAmount = roundCurrency(data.awardedAmount)
          const billedSponsorAmount = roundCurrency(data.billedSponsorAmount)
          const traineeShareAmount = roundCurrency(data.traineeShareAmount)
          const awardedAmountLabel = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(awardedAmount)
          const billedSponsorAmountLabel = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(billedSponsorAmount)
          const traineeShareAmountLabel = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(traineeShareAmount)
          return {
            id: sponsorId,
            sponsorCode: data.sponsorCode || `SPN-${sponsorId}`,
            sponsorName: data.sponsorName,
            awardCount: data.awardCount,
            awardedAmount,
            awardedAmountLabel,
            billedSponsorAmount,
            billedSponsorAmountLabel,
            traineeShareAmount,
            traineeShareAmountLabel,
            cells: [
              { text: data.sponsorCode || `SPN-${sponsorId}`, emphasis: true },
              { text: data.sponsorName },
              { text: String(data.awardCount), align: 'right' },
              { text: awardedAmountLabel, align: 'right' },
              { text: billedSponsorAmountLabel, align: 'right' },
              { text: traineeShareAmountLabel, align: 'right' },
            ] as Cell[],
          }
        })
        .sort((a, b) => b.awardedAmount - a.awardedAmount)

      if (search) allRows = allRows.filter((r) => searchInRow(r, search))

      const totalDocs = allRows.length
      const totalPages = Math.ceil(totalDocs / limit)
      const offset = (page - 1) * limit
      const pagedRows = allRows.slice(offset, offset + limit)
      const totalAwarded = allRows.reduce((s, r) => s + r.awardedAmount, 0)
      const totalBilled = allRows.reduce((s, r) => s + r.billedSponsorAmount, 0)
      const totalTraineeShare = allRows.reduce((s, r) => s + r.traineeShareAmount, 0)

      return NextResponse.json({
        tab,
        metrics: [
          { id: 'active-sponsors', label: 'Active Sponsors', value: String(allRows.length), change: 'Sponsors contributing to the current utilization report', trend: 'up' },
          { id: 'awarded-total', label: 'Awarded Amount', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalAwarded), change: 'Total scholarship value across active awards', trend: 'up' },
          { id: 'billed-sponsor', label: 'Billed Sponsor Amount', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalBilled), change: 'Value tagged as third-party billed to sponsors', trend: 'up' },
          { id: 'trainee-share', label: 'Trainee Share', value: new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(totalTraineeShare), change: 'Residual trainee share after sponsor support', trend: 'neutral' },
        ],
        rows: pagedRows,
        pagination: { page, limit, totalDocs, totalPages, hasPrevPage: page > 1, hasNextPage: page < totalPages },
        totals: { totalRows: allRows.length, filteredRows: pagedRows.length },
      })
    }

    return NextResponse.json({ error: `Unknown tab: ${tab}` }, { status: 400 })
  } catch (error) {
    return handleAccountingApiError(error)
  }
}
