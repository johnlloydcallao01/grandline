'use server';

import { getServerToken } from '@/app/actions/auth';
import { env } from '@/lib/env';

export type Metric = {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export type Pagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export type Cell = { text: string; emphasis?: boolean; align?: 'left' | 'right' | 'center'; tone?: string }

type BaseResponse<T> = {
  tab: string
  metrics: Metric[]
  rows: T[]
  pagination: Pagination
  totals: { totalRows: number; filteredRows: number }
}

export type CouponImpactRow = {
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

export type ScholarshipUtilizationRow = {
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

export type DiscountScholarshipData =
  | (BaseResponse<CouponImpactRow> & { tab: 'coupon-revenue-impact' })
  | (BaseResponse<ScholarshipUtilizationRow> & { tab: 'scholarship-utilization' })

export type DiscountScholarshipParams = {
  tab?: string
  search?: string
  page?: number
  limit?: number
}

export async function fetchDiscountScholarshipAnalytics(params: DiscountScholarshipParams = {}): Promise<DiscountScholarshipData> {
  const token = await getServerToken();
  if (!token) throw new Error('No admin session available.');

  const searchParams = new URLSearchParams()
  searchParams.set('tab', params.tab || 'coupon-revenue-impact')
  if (params.search) searchParams.set('search', params.search)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))

  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/accounting/lms/reports/discount-scholarship-analytics?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch discount scholarship analytics: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
