'use server'

import { getServerToken } from '@/app/actions/auth'
import { env } from '@/lib/env'

export type DashboardKpiMetric = {
  id: string
  label: string
  value: string
  numericValue: number
  trend: 'up' | 'down' | 'neutral'
  change: string
}

export type RecentTransactionRow = {
  id: string
  documentNumber: string
  documentDate: string
  partyName: string
  total: number
  totalFormatted: string
  status: string
  statusLabel: string
  statusTone: 'green' | 'amber' | 'blue' | 'gray'
  type: string
  typeLabel: string
}

export type SystemHealthItem = {
  id: string
  label: string
  value: string
  sub: string
  status: 'healthy' | 'warning' | 'critical' | 'neutral'
  linkTo?: string
}

export type AgingBucketsChartData = {
  current: number
  bucket1to30: number
  bucket31to60: number
  bucket61to90: number
  bucketOver90: number
}

export type DashboardChartData = {
  arAgingBuckets: AgingBucketsChartData
  apAgingBuckets: AgingBucketsChartData
}

export type DashboardResponse = {
  kpis: DashboardKpiMetric[]
  recentInvoices: RecentTransactionRow[]
  recentBills: RecentTransactionRow[]
  recentPayments: RecentTransactionRow[]
  systemHealth: SystemHealthItem[]
  chartData: DashboardChartData
  lastUpdated: string
}

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const token = await getServerToken()
  if (!token) throw new Error('No admin session available.')

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/accounting/dashboard`, {
    headers: {
      Authorization: `JWT ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as DashboardResponse | { error?: string } | null
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Failed to load dashboard data.'
    throw new Error(errorMessage)
  }

  return payload as DashboardResponse
}
