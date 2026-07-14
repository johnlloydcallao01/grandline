'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  PieChart,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  fetchDashboardData,
  type DashboardResponse,
  type DashboardKpiMetric,
  type RecentTransactionRow,
  type SystemHealthItem,
  type AgingBucketsChartData,
} from './actions'

function statusToneStyles(tone: RecentTransactionRow['statusTone']): string {
  const map: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return map[tone] || map.gray
}

function healthDot(status: SystemHealthItem['status']) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    neutral: 'bg-gray-300',
  }
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status] || colors.neutral}`} />
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hour ago'
  return `${hours} hours ago`
}

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(1)}K`
  return `₱${value.toFixed(2)}`
}

const CHART_COLORS = {
  receivables: '#0EA5E9',
  payables: '#F59E0B',
  cashBank: '#10B981',
  workingCapital: '#6366F1',
  agingCurrent: '#10B981',
  aging1to30: '#84CC16',
  aging31to60: '#F59E0B',
  aging61to90: '#F97316',
  agingOver90: '#EF4444',
  axisLine: '#E5E7EB',
  splitLine: '#F3F4F6',
  label: '#6B7280',
}

function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return { isMobile }
}

function KpiCard({ metric }: { metric: DashboardKpiMetric }) {
  const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight
  const trendColor =
    metric.trend === 'down'
      ? 'text-red-600 bg-red-50'
      : metric.trend === 'neutral'
        ? 'text-gray-500 bg-gray-100'
        : 'text-green-600 bg-green-50'

  const iconMap: Record<string, React.ElementType> = {
    receivables: CreditCard,
    payables: CreditCard,
    'cash-bank': Coins,
    'working-capital': BarChart3,
    overdue: AlertCircle,
    'base-currency': DollarSign,
  }
  const IconComponent = iconMap[metric.id] || PieChart

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-sm font-medium text-gray-500 truncate">{metric.label}</p>
          <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-gray-900 truncate leading-tight sm:leading-normal">{metric.value}</p>
          <div className="mt-1.5 sm:mt-3 flex items-center gap-1 sm:gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2.5 py-[1px] sm:py-0.5 text-[10px] sm:text-xs font-medium leading-tight sm:leading-normal ${trendColor}`}>
              <TrendIcon className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-none">{metric.change}</span>
            </span>
          </div>
        </div>
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function FinancialPositionChart({
  receivables,
  payables,
  cashBank,
  workingCapital,
  isMobile,
}: {
  receivables: number
  payables: number
  cashBank: number
  workingCapital: number
  isMobile: boolean
}) {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>${formatCurrencyShort(p.value)}`
      },
    },
    grid: {
      left: isMobile ? 44 : 80,
      right: isMobile ? 8 : 30,
      top: isMobile ? 10 : 20,
      bottom: isMobile ? 18 : 30,
    },
    xAxis: {
      type: 'category' as const,
      data: isMobile ? ['Recv', 'Pay', 'Cash', 'WC'] : ['Receivables', 'Payables', 'Cash & Bank', 'Working Capital'],
      axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: CHART_COLORS.label, fontSize: isMobile ? 8 : 12, fontWeight: 500 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: '#9CA3AF',
        fontSize: isMobile ? 8 : 11,
        formatter: (v: number) => {
          if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(1)}M`
          if (v >= 1_000) return `₱${(v / 1_000).toFixed(0)}K`
          return `₱${v}`
        },
      },
      splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
    },
    series: [
      {
        type: 'bar' as const,
        data: [
          { value: receivables, itemStyle: { color: CHART_COLORS.receivables, borderRadius: [4, 4, 0, 0] } },
          { value: payables, itemStyle: { color: CHART_COLORS.payables, borderRadius: [4, 4, 0, 0] } },
          { value: cashBank, itemStyle: { color: CHART_COLORS.cashBank, borderRadius: [4, 4, 0, 0] } },
          { value: workingCapital, itemStyle: { color: CHART_COLORS.workingCapital, borderRadius: [4, 4, 0, 0] } },
        ],
        barWidth: isMobile ? 20 : 56,
        label: {
          show: !isMobile,
          position: 'top',
          formatter: (p: { value: number }) => formatCurrencyShort(p.value),
          color: '#374151',
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  }), [receivables, payables, cashBank, workingCapital, isMobile])

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 sm:px-5 py-2.5 sm:py-3.5">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Financial Position Overview</h3>
        <p className="mt-px sm:mt-0.5 text-[10px] sm:text-xs text-gray-500">Comparison of key financial metrics</p>
      </div>
      <div className="h-[170px] sm:h-[280px] overflow-x-auto sm:overflow-x-hidden overscroll-x-contain">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge autoResize />
      </div>
    </div>
  )
}

function AgingDonutChart({
  buckets,
  title,
  totalLabel,
  totalValue,
  isMobile,
}: {
  buckets: AgingBucketsChartData
  title: string
  totalLabel: string
  totalValue: string
  isMobile: boolean
}) {
  const total = buckets.current + buckets.bucket1to30 + buckets.bucket31to60 + buckets.bucket61to90 + buckets.bucketOver90

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: { name: string; value: number; percent: number }) =>
        `<strong>${p.name}</strong><br/>${formatCurrencyShort(p.value)} (${p.percent.toFixed(1)}%)`,
    },
    graphic: [
      {
        type: 'text' as const,
        left: 'center',
        top: isMobile ? '36%' : '42%',
        style: {
          text: isMobile ? formatCurrencyShort(total) : totalValue,
          fill: '#111827',
          fontSize: isMobile ? 11 : 16,
          fontWeight: 700,
          textAlign: 'center' as const,
        },
      },
      ...(isMobile
        ? []
        : [{
            type: 'text' as const,
            left: 'center',
            top: '55%',
            style: {
              text: totalLabel,
              fill: '#6B7280',
              fontSize: 11,
              fontWeight: 500,
              textAlign: 'center' as const,
            },
          }]),
    ],
    series: [
      {
        type: 'pie' as const,
        radius: ['40%', '65%'],
        avoidLabelOverlap: true,
        label: {
          show: !isMobile,
          formatter: (p: { name: string; percent: number }) => `${p.name}\n${p.percent.toFixed(1)}%`,
          fontSize: 10,
          color: '#6B7280',
          lineHeight: 14,
        },
        labelLine: isMobile ? { show: false } : { length: 8, length2: 6, smooth: true },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile ? 11 : 12,
            fontWeight: 'bold' as const,
          },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.15)' },
        },
        data: [
          { value: buckets.current, name: 'Current', itemStyle: { color: CHART_COLORS.agingCurrent } },
          { value: buckets.bucket1to30, name: '1-30 Days', itemStyle: { color: CHART_COLORS.aging1to30 } },
          { value: buckets.bucket31to60, name: '31-60 Days', itemStyle: { color: CHART_COLORS.aging31to60 } },
          { value: buckets.bucket61to90, name: '61-90 Days', itemStyle: { color: CHART_COLORS.aging61to90 } },
          { value: buckets.bucketOver90, name: '90+ Days', itemStyle: { color: CHART_COLORS.agingOver90 } },
        ],
      },
    ],
  }), [buckets, totalLabel, totalValue, isMobile])

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 sm:px-5 py-2.5 sm:py-3.5">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-px sm:mt-0.5 text-[10px] sm:text-xs text-gray-500">{formatCurrencyShort(total)} total outstanding</p>
      </div>
      <div className="h-[190px] sm:h-[280px] overflow-x-auto sm:overflow-x-hidden overscroll-x-contain">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge autoResize />
      </div>
    </div>
  )
}

function TransactionMiniList({
  title,
  icon: Icon,
  rows,
  accentColor,
  emptyLabel,
}: {
  title: string
  icon: React.ElementType
  rows: RecentTransactionRow[]
  accentColor: string
  emptyLabel: string
}) {
  const borderColor = `border-l-${accentColor}-400`
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 sm:px-5 py-2.5 sm:py-3.5">
        <Icon className="h-4 w-4 text-gray-500 shrink-0" />
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.length === 0 ? (
          <div className="px-4 sm:px-5 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-400">{emptyLabel}</div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className={`border-l-2 px-3 sm:px-5 py-2.5 sm:py-3 transition-colors hover:bg-gray-50 ${borderColor}`}>
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{row.documentNumber}</p>
                  <p className="mt-px sm:mt-0.5 text-[11px] sm:text-sm text-gray-500 truncate">{row.partyName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">{row.totalFormatted}</p>
                </div>
              </div>
              <div className="mt-1 sm:mt-2 flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-gray-400">{row.documentDate}</span>
                <span className={`inline-flex rounded-md border px-1.5 sm:px-2 py-[1px] sm:py-0.5 text-[10px] sm:text-xs font-medium ${statusToneStyles(row.statusTone)}`}>
                  {row.statusLabel}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 sm:h-32 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="h-[170px] sm:h-[280px] animate-pulse rounded-xl bg-gray-50" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-[190px] sm:h-[280px] animate-pulse rounded-xl bg-gray-50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 sm:h-64 animate-pulse rounded-xl bg-gray-50" />
        ))}
      </div>
      <div className="h-44 sm:h-48 animate-pulse rounded-xl bg-gray-50" />
    </div>
  )
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { addToast } = useToast()
  const { isMobile } = useResponsive()

  const load = useCallback(async (silent?: boolean) => {
    if (!silent) {
      setIsLoading(true)
    }
    setError(null)
    try {
      const res = await fetchDashboardData()
      setData(res)
      setLastUpdatedDisplay(formatRelativeTime(res.lastUpdated))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!data?.lastUpdated) return
    setLastUpdatedDisplay(formatRelativeTime(data.lastUpdated))
    const interval = setInterval(() => {
      setLastUpdatedDisplay(formatRelativeTime(data.lastUpdated))
    }, 30_000)
    return () => clearInterval(interval)
  }, [data?.lastUpdated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    void load()
    addToast({ title: 'Refreshing', message: 'Dashboard data is being refreshed.', type: 'info' })
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-[10px]">
      <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-blue-600">Accounting / Dashboard</p>
          <h1 className="mt-1 text-lg sm:text-2xl font-bold text-gray-900">Accounting Dashboard</h1>
          <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-600">
            Financial overview, recent transactions, and system health at a glance.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {data ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5" />
              Updated {lastUpdatedDisplay}
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 rounded-md border border-red-200 bg-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSkeleton />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 min-w-0">
            {data.kpis.map((metric) => (
              <div key={metric.id} className="min-w-0">
                <KpiCard metric={metric} />
              </div>
            ))}
          </div>

          <FinancialPositionChart
            receivables={
              data.chartData.arAgingBuckets.current +
              data.chartData.arAgingBuckets.bucket1to30 +
              data.chartData.arAgingBuckets.bucket31to60 +
              data.chartData.arAgingBuckets.bucket61to90 +
              data.chartData.arAgingBuckets.bucketOver90
            }
            payables={
              data.chartData.apAgingBuckets.current +
              data.chartData.apAgingBuckets.bucket1to30 +
              data.chartData.apAgingBuckets.bucket31to60 +
              data.chartData.apAgingBuckets.bucket61to90 +
              data.chartData.apAgingBuckets.bucketOver90
            }
            cashBank={data.kpis.find(k => k.id === 'cash-bank')?.numericValue ?? 0}
            workingCapital={data.kpis.find(k => k.id === 'working-capital')?.numericValue ?? 0}
            isMobile={isMobile}
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2 min-w-0">
            <AgingDonutChart
              buckets={data.chartData.arAgingBuckets}
              title="AR Aging Distribution"
              totalLabel="Total AR"
              totalValue={data.kpis.find(k => k.id === 'receivables')?.value ?? '₱0.00'}
              isMobile={isMobile}
            />
            <AgingDonutChart
              buckets={data.chartData.apAgingBuckets}
              title="AP Aging Distribution"
              totalLabel="Total AP"
              totalValue={data.kpis.find(k => k.id === 'payables')?.value ?? '₱0.00'}
              isMobile={isMobile}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3 min-w-0">
            <TransactionMiniList
              title="Recent Invoices"
              icon={FileText}
              rows={data.recentInvoices}
              accentColor="blue"
              emptyLabel="No recent invoices"
            />
            <TransactionMiniList
              title="Recent Bills"
              icon={FileText}
              rows={data.recentBills}
              accentColor="amber"
              emptyLabel="No recent bills"
            />
            <TransactionMiniList
              title="Recent Payments"
              icon={CreditCard}
              rows={data.recentPayments}
              accentColor="green"
              emptyLabel="No recent payments"
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 sm:px-5 py-2.5 sm:py-3.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500 shrink-0" />
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">System Health</h3>
              </div>
              <p className="mt-px sm:mt-0.5 text-[10px] sm:text-xs text-gray-500">
                Key system configuration status. Items needing attention are highlighted.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
              {data.systemHealth.map((item) => {
                const Container = item.linkTo ? 'a' : 'div'
                const containerProps = item.linkTo
                  ? { href: item.linkTo, target: '_self', rel: undefined }
                  : {}

                return (
                  <Container
                    key={item.id}
                    {...containerProps}
                    className={`flex items-start gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-3 sm:py-4 transition-colors ${
                      item.linkTo ? 'cursor-pointer hover:bg-blue-50/40 active:bg-blue-50' : ''
                    }`}
                  >
                    <div className={`flex h-8 sm:h-9 w-8 sm:w-9 shrink-0 items-center justify-center rounded-lg border ${
                      (() => {
                        const map: Record<string, string> = {
                          healthy: 'text-green-500 bg-green-50 border-green-200',
                          warning: 'text-amber-500 bg-amber-50 border-amber-200',
                          critical: 'text-red-500 bg-red-50 border-red-200',
                          neutral: 'text-gray-400 bg-gray-50 border-gray-200',
                        }
                        return map[item.status] || map.neutral
                      })()
                    }`}>
                      {healthDot(item.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{item.label}</p>
                        {item.linkTo ? (
                          <ChevronRight className="h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0 text-gray-300" />
                        ) : null}
                      </div>
                      <p className="mt-px sm:mt-0.5 text-xs sm:text-sm font-semibold text-gray-800">{item.value}</p>
                      <p className="mt-px text-[10px] sm:text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </Container>
                )
              })}
            </div>
          </div>
        </>
      ) : null}

    </div>
  )
}
