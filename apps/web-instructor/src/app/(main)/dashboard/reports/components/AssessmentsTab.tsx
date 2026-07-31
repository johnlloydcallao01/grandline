'use client'

import React, { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts'
import type { ReportsData } from '../actions'

interface AssessmentsTabProps {
  data: ReportsData | null
  loading?: boolean
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function BarSkeleton() {
  return (
    <div className="animate-pulse flex items-end gap-3 h-48 p-4">
      {[55, 70, 40, 85, 50, 65].map((h, i) => (
        <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function ScoreBarChart({ data }: { data: { range: string; count: number }[] }) {
  const option = useMemo(() => {
    if (!data?.length) return null
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p: any[]) => `<strong>${p[0].name}</strong><br/>Submissions: ${p[0].value}`,
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
        data: data.map(d => ({
          value: d.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#2563eb80' },
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
        <p className="text-sm text-gray-400 dark:text-gray-500">No score data available</p>
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

function MonthlySubmissionsChart({ data }: { data: { month: string; count: number }[] }) {
  const option = useMemo(() => {
    if (!data?.length) return null
    const labels = data.map(d => {
      const [year, month] = d.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p: any[]) => `<strong>${p[0].name}</strong><br/>Submissions: ${p[0].value}`,
      },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 10, color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      series: [{
        type: 'bar',
        barWidth: '50%',
        data: data.map(d => ({
          value: d.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#22c55e' },
              { offset: 1, color: '#22c55e80' },
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
        <p className="text-sm text-gray-400 dark:text-gray-500">No submission data available</p>
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

function PassFailPieChart({ data }: { data: { status: string; count: number }[] }) {
  const option = useMemo(() => {
    if (!data?.length) return null
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<strong>${p.name}</strong><br/>Submissions: ${p.value}<br/>Share: ${p.percent.toFixed(1)}%`,
      },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          formatter: (p: { name: string; percent: number }) =>
            `${p.name}: ${p.percent.toFixed(0)}%`,
          fontSize: 11,
          color: '#374151',
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold', fontSize: 13 },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
        },
        data: [
          {
            name: 'Passed',
            value: data.find(d => d.status === 'passed')?.count || 0,
            itemStyle: { color: '#22c55e' },
          },
          {
            name: 'Failed',
            value: data.find(d => d.status === 'failed')?.count || 0,
            itemStyle: { color: '#ef4444' },
          },
        ].filter(d => d.value > 0),
        animationDuration: 800,
      }],
    }
  }, [data])

  if (!option) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 dark:text-gray-500">No pass/fail data available</p>
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

export function AssessmentsTab({ data, loading }: AssessmentsTabProps) {
  const assessments = data?.assessments

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm animate-pulse">
              <div className="space-y-3">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
                <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm"><BarSkeleton /></div>
          <div className="lg:col-span-1 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm"><BarSkeleton /></div>
          <div className="lg:col-span-1 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm"><BarSkeleton /></div>
        </div>
      </div>
    )
  }

  if (!assessments) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 dark:text-gray-500">No assessment data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submissions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatNumber(assessments.totalSubmissions)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Total submissions</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatNumber(assessments.totalAssessments)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Total quizzes/exams</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pass Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{assessments.passRate}%</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Overall pass rate</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{assessments.avgScore}%</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Average score</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Attempts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{assessments.avgAttempts}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Per submission</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Score Distribution</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">By range</span>
          </div>
          <ScoreBarChart data={assessments.scoreDistribution} />
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Monthly Submissions</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Trend</span>
          </div>
          <MonthlySubmissionsChart data={assessments.monthlySubmissions} />
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pass / Fail Breakdown</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Results</span>
          </div>
          <PassFailPieChart data={assessments.passFailDistribution} />
        </div>
      </div>
    </div>
  )
}
