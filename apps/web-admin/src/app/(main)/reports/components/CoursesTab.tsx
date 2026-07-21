'use client'

import React, { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts'
import type { ReportsData } from '../actions'

interface CoursesTabProps {
  data: ReportsData | null
  loading?: boolean
}

const CHART_COLORS = [
  '#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48',
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

function PieChartCard({ title: _title, data }: { title: string; data: { name?: string; status?: string; level?: string; count: number }[] }) {
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
          name: d.name || d.status || d.level || 'Unknown',
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
      style={{ height: 260, width: '100%' }}
    />
  )
}

function TopCoursesTable({ data }: { data: ReportsData['courses']['topCourses'] }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">No course data available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollments</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Grade</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <span className="font-medium text-gray-900">{course.title}</span>
              </td>
              <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{formatNumber(course.enrollmentCount)}</td>
              <td className="py-3 px-4 text-right tabular-nums">
                <span className={course.completionRate >= 50 ? 'text-emerald-600 font-medium' : 'text-gray-700'}>
                  {course.completionRate}%
                </span>
              </td>
              <td className="py-3 px-4 text-right tabular-nums">
                <span className={course.avgGrade >= 70 ? 'text-emerald-600 font-medium' : course.avgGrade >= 50 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
                  {course.avgGrade}%
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.status === 'published' ? 'bg-emerald-50 text-emerald-700' : course.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-700'}`}>
                  {course.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CoursesTab({ data, loading }: CoursesTabProps) {
  const courses = data?.courses

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><PieSkeleton /></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><PieSkeleton /></div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm"><BarSkeleton /></div>
        </div>
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
    )
  }

  if (!courses) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No course data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(courses.totalCourses)}</p>
            <p className="text-xs text-gray-400">On platform</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Completion</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{courses.avgCompletionRate}%</p>
            <p className="text-xs text-gray-400">Per course</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Enrollments</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(courses.avgEnrollmentPerCourse)}</p>
            <p className="text-xs text-gray-400">Per course</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{courses.categoryDistribution.length}</p>
            <p className="text-xs text-gray-400">Course categories</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Course Status</h3>
            <span className="text-xs text-gray-400">Distribution</span>
          </div>
          <PieChartCard title="Course Status" data={courses.courseStatusDistribution.map(d => ({ status: d.status, count: d.count }))} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <span className="text-xs text-gray-400">Distribution</span>
          </div>
          <PieChartCard title="Categories" data={courses.categoryDistribution.map(d => ({ name: d.name, count: d.count }))} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Difficulty</h3>
            <span className="text-xs text-gray-400">Levels</span>
          </div>
          <PieChartCard title="Difficulty" data={courses.difficultyDistribution.map(d => ({ level: d.level, count: d.count }))} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Top Courses by Enrollment</h3>
        </div>
        <TopCoursesTable data={courses.topCourses} />
      </div>
    </div>
  )
}
