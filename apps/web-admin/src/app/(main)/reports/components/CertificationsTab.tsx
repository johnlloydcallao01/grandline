'use client'

import React, { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts'
import type { ReportsData } from '../actions'

interface CertificationsTabProps {
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
      {[55, 70, 40, 85, 50, 65, 45, 75].map((h, i) => (
        <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function IssuanceChart({ dates }: { dates: string[] }) {
  const option = useMemo(() => {
    if (!dates?.length) return null
    const countByLocalDate = new Map<string, number>()
    for (const iso of dates) {
      const d = new Date(iso)
      if (isNaN(d.getTime())) continue
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const localKey = `${y}-${m}-${day}`
      countByLocalDate.set(localKey, (countByLocalDate.get(localKey) || 0) + 1)
    }
    const sorted = Array.from(countByLocalDate.entries())
      .map(([k, v]) => ({ key: k, count: v }))
      .sort((a, b) => a.key.localeCompare(b.key))
    const labels = sorted.map(s => {
      const [y, m, day] = s.key.split('-')
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(day))
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    })
    const values = sorted.map(s => s.count)
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p: any[]) => `<strong>${p[0].name}</strong><br/>Certificates: ${p[0].value}`,
      },
      grid: { left: 60, right: 20, top: 20, bottom: 50 },
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
        data: values.map(v => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#8b5cf680' },
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
  }, [dates])

  if (!option) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No certificate data available</p>
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

function TopCoursesTable({ data }: { data: { title: string; count: number }[] }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">No certificate data available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificates</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((course, i) => {
            const total = data.reduce((s, d) => s + d.count, 0)
            return (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="font-medium text-gray-900">{course.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums font-semibold">{formatNumber(course.count)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-gray-600 tabular-nums">
                    {total > 0 ? Math.round((course.count / total) * 100) : 0}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function CertificationsTab({ data, loading }: CertificationsTabProps) {
  const certs = data?.certifications

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
              <div className="space-y-3">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-7 bg-gray-100 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><BarSkeleton /></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100"><div className="h-4 bg-gray-100 rounded w-32" /></div>
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                  <div className="flex-1"><div className="h-3 bg-gray-100 rounded w-3/4" /></div>
                  <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!certs) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No certification data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Issued</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(certs.totalCertificates)}</p>
            <p className="text-xs text-gray-400">All certificates</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(certs.activeCertificates)}</p>
            <p className="text-xs text-gray-400">Currently valid</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revoked</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(certs.revokedCertificates)}</p>
            <p className="text-xs text-gray-400">Revoked certificates</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expired</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(certs.expiredCertificates)}</p>
            <p className="text-xs text-gray-400">Expired certificates</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compliance</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{certs.certComplianceRate}%</p>
            <p className="text-xs text-gray-400">Cert vs completions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Certificate Issuance</h3>
            <span className="text-xs text-gray-400">By date issued</span>
          </div>
          <IssuanceChart dates={certs.certificateDates} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Top Courses by Certification</h3>
          </div>
          <TopCoursesTable data={certs.topCourses} />
        </div>
      </div>
    </div>
  )
}
