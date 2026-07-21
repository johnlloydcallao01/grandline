'use client'

import React, { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts'
import type { ReportsData } from '../actions'

interface LearnersTabProps {
  data: ReportsData | null
  loading?: boolean
}

const CHART_COLORS = [
  '#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6',
]

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function PieSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-center h-64">
      <div className="relative h-40 w-40">
        <div className="h-full w-full rounded-full bg-gray-100" />
        <div className="absolute inset-5 rounded-full bg-white" />
      </div>
    </div>
  )
}

function BarSkeleton() {
  return (
    <div className="animate-pulse flex items-end gap-3 h-48 p-4">
      {[55, 70, 40, 85, 50].map((h, i) => (
        <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function StatusPieChart({ data }: { data: { status: string; count: number }[] }) {
  const option = useMemo(() => {
    if (!data?.length) return null
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Count: ${p.value}<br/>Share: ${p.percent.toFixed(1)}%`,
      },
      series: [{
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        padAngle: 1.5,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
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
        data: data.map((d, i) => ({
          name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
          value: d.count,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
        animationDuration: 1000,
        animationEasing: 'cubicOut',
      }],
      color: CHART_COLORS,
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: '#6b7280' },
      },
    }
  }, [data])

  if (!option) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 280, width: '100%' }}
    />
  )
}

function TypePieChart({ data }: { data: { type: string; count: number }[] }) {
  const option = useMemo(() => {
    if (!data?.length) return null
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Count: ${p.value}<br/>Share: ${p.percent.toFixed(1)}%`,
      },
      series: [{
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        padAngle: 1.5,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
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
        data: data.map((d, i) => ({
          name: d.type.charAt(0).toUpperCase() + d.type.slice(1),
          value: d.count,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
        animationDuration: 1000,
        animationEasing: 'cubicOut',
      }],
      color: CHART_COLORS,
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: '#6b7280' },
      },
    }
  }, [data])

  if (!option) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 280, width: '100%' }}
    />
  )
}

function GradeBarChart({ data }: { data: { range: string; count: number }[] }) {
  const option = useMemo(() => {
    if (!data?.length) return null
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p: any[]) => {
          const item = p[0]
          return `<strong>${item.name}</strong><br/>Students: ${item.value}`
        },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: data.map(d => d.range),
        axisLabel: { fontSize: 10, color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      series: [{
        type: 'bar',
        barWidth: '60%',
        data: data.map((d, i) => ({
          value: d.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: CHART_COLORS[i % CHART_COLORS.length] },
              { offset: 1, color: CHART_COLORS[i % CHART_COLORS.length] + '80' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (p: { value: number }) => p.value > 0 ? String(p.value) : '',
          fontSize: 10,
          color: '#6b7280',
        },
        animationDuration: 800,
        animationEasing: 'cubicOut',
      }],
    }
  }, [data])

  if (!option) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No grade data available</p>
      </div>
    )
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 260, width: '100%' }}
    />
  )
}

export function LearnersTab({ data, loading }: LearnersTabProps) {
  const learners = data?.learners

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
              <div className="space-y-3">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-7 bg-gray-100 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><PieSkeleton /></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><PieSkeleton /></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100"><div className="h-4 bg-gray-100 rounded w-32" /></div>
          <div className="p-4"><BarSkeleton /></div>
        </div>
      </div>
    )
  }

  if (!learners) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No learner data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Trainees</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(learners.totalTrainees)}</p>
            <p className="text-xs text-gray-400">Registered users</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Learners</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(learners.activeTrainees)}</p>
            <p className="text-xs text-gray-400">Currently enrolled</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New This Month</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(learners.newTraineesThisMonth)}</p>
            <p className="text-xs text-gray-400">New enrollments</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment Types</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{learners.enrollmentTypeDistribution.length}</p>
            <p className="text-xs text-gray-400">Distinct types</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Enrollment Status</h3>
            <span className="text-xs text-gray-400">Distribution</span>
          </div>
          <StatusPieChart data={learners.enrollmentStatusDistribution} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Enrollment Type</h3>
            <span className="text-xs text-gray-400">By type</span>
          </div>
          <TypePieChart data={learners.enrollmentTypeDistribution} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Grade Distribution</h3>
          <span className="text-xs text-gray-400">Student grades</span>
        </div>
        <GradeBarChart data={learners.gradeDistribution} />
      </div>
    </div>
  )
}
