'use client'

import React, { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts'
import type { CategoryDistribution } from '../actions'

interface CategoryDistributionChartProps {
  data: CategoryDistribution[]
  loading?: boolean
}

const CHART_COLORS = [
  '#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48',
]

function ChartSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-center h-64">
      <div className="relative h-40 w-40">
        <div className="h-full w-full rounded-full bg-gray-100" />
        <div className="absolute inset-5 rounded-full bg-white" />
      </div>
    </div>
  )
}

export function CategoryDistributionChart({ data, loading }: CategoryDistributionChartProps) {
  const option = useMemo(() => {
    if (!data?.length) return null

    const maxItems = 8
    const top = data.slice(0, maxItems)
    const other = data.slice(maxItems)
    const otherCount = other.reduce((s, d) => s + d.count, 0)

    const items = otherCount > 0
      ? [...top, { name: 'Others', count: otherCount, percentage: 0 }]
      : top

    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Courses: ${p.value}<br/>Share: ${p.percent.toFixed(1)}%`,
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          padAngle: 1.5,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: (p: { name: string; percent: number }) =>
              p.percent > 3 ? `${p.name}\n${p.percent.toFixed(0)}%` : '',
            fontSize: 10,
            color: '#374151',
            lineHeight: 14,
          },
          emphasis: {
            label: { show: true, fontWeight: 'bold', fontSize: 12 },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
          },
          data: items.map((d, i) => ({
            name: d.name,
            value: d.count,
            itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
          })),
          animationDuration: 1000,
          animationEasing: 'cubicOut' as const,
        },
      ],
      color: CHART_COLORS,
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: '#6b7280' },
        legendHoverLink: true,
      },
    }
  }, [data])

  if (loading) {
    return <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><ChartSkeleton /></div>
  }

  if (!option) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center h-72">
        <p className="text-sm text-gray-400">No category data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Course Categories</h3>
        <span className="text-xs text-gray-400">Distribution</span>
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        style={{ height: 280, width: '100%' }}
      />
    </div>
  )
}
