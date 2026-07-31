'use client'

import React from 'react'
import type { ReportsData } from '../actions'

interface OverviewTabProps {
  data: ReportsData | null
  loading?: boolean
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
          <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

function StatCard({
  title, value, subtitle, icon, color = 'blue', formatter
}: {
  title: string
  value: number
  subtitle?: string
  icon?: React.ReactNode
  color?: string
  formatter?: (n: number) => string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string; accent: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-500' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-400', accent: 'bg-purple-500' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-600 dark:text-orange-400', accent: 'bg-orange-500' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', iconBg: 'bg-pink-100 dark:bg-pink-900/50', iconColor: 'text-pink-600 dark:text-pink-400', accent: 'bg-pink-500' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-950/30', iconBg: 'bg-teal-100 dark:bg-teal-900/50', iconColor: 'text-teal-600 dark:text-teal-400', accent: 'bg-teal-500' },
  }
  const c = colorMap[color] || colorMap.blue
  const displayValue = formatter ? formatter(value) : String(value)
  return (
    <div className="group relative bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight">{displayValue}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg ${c.iconBg} shrink-0 ring-1 ring-black/5`}>
            <div className={`w-5 h-5 ${c.iconColor}`}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function TrendsChartSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" />
      <div className="flex items-end gap-3 h-48">
        {[55, 70, 40, 85, 50, 65, 45, 75].map((h, i) => (
          <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function OverviewTab({ data, loading }: OverviewTabProps) {
  const overview = data?.overview

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i}><StatCardSkeleton /></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm"><TrendsChartSkeleton /></div>
          <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm" key="skel2"><TrendsChartSkeleton /></div>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 dark:text-gray-500">No overview data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 [&>:last-child:nth-child(odd)]:col-span-full lg:[&>:last-child:nth-child(odd)]:col-span-1">
        <StatCard title="My Courses" value={overview.totalCourses} subtitle="On platform" color="blue" formatter={formatNumber} />
        <StatCard title="Enrollments" value={overview.totalEnrollments} subtitle={`${overview.activeEnrollments} active`} color="green" formatter={formatNumber} />
        <StatCard title="Students" value={overview.totalStudents} subtitle="Registered trainees" color="purple" formatter={formatNumber} />
        <StatCard title="Completion Rate" value={overview.completionRate} subtitle={`${overview.completedEnrollments} completed`} color="teal" formatter={(n) => `${n}%`} />
        <StatCard title="Avg Grade" value={overview.avgGrade} subtitle={`${overview.avgProgress}% avg progress`} color="pink" formatter={(n) => `${n}%`} />
        <StatCard title="Certificates" value={overview.totalCertificates} subtitle="Issued" color="orange" formatter={formatNumber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Enrollment Overview</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Status breakdown</span>
          </div>
          <div className="space-y-3 mt-4">
            {[
              { label: 'Active', count: overview.activeEnrollments, color: 'bg-blue-500', total: overview.totalEnrollments },
              { label: 'Completed', count: overview.completedEnrollments, color: 'bg-emerald-500', total: overview.totalEnrollments },
              { label: 'Dropped', count: overview.droppedEnrollments, color: 'bg-red-500', total: overview.totalEnrollments },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold tabular-nums">
                    {formatNumber(item.count)}
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                      ({item.total > 0 ? Math.round((item.count / item.total) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Performance Metrics</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Key indicators</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { label: 'Avg Grade', value: overview.avgGrade, suffix: '%', color: 'bg-purple-500' },
              { label: 'Avg Progress', value: overview.avgProgress, suffix: '%', color: 'bg-teal-500' },
              { label: 'Assessments', value: overview.totalAssessments, suffix: '', color: 'bg-orange-500' },
              { label: 'Assignments', value: overview.totalAssignments, suffix: '', color: 'bg-pink-500' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-2">{item.label}</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {item.value}{item.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
