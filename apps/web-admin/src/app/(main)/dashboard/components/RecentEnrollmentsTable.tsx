'use client'

import React, { useMemo } from 'react'
import type { RecentEnrollment } from '../actions'

interface RecentEnrollmentsTableProps {
  data: RecentEnrollment[]
  loading?: boolean
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  suspended: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  dropped: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  pending: 'Pending',
  suspended: 'Suspended',
  dropped: 'Dropped',
}

function SkeletonRow(_props: Record<string, unknown>) {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-20 ml-auto" /></td>
    </tr>
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function RecentEnrollmentsTable({ data, loading }: RecentEnrollmentsTableProps) {
  const formatted = useMemo(() => {
    if (!data?.length) return []
    return data.map(e => ({
      ...e,
      formattedDate: formatDate(e.enrolledAt),
    }))
  }, [data])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Enrollments</h3>
        </div>
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    )
  }

  if (!formatted.length) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-8 text-center">
        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No enrollments yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Enrollments</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">Latest {formatted.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trainee</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {formatted.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.traineeName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate block max-w-[200px]">{enrollment.courseTitle}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{enrollment.formattedDate}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[enrollment.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {statusLabels[enrollment.status] || enrollment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(enrollment.progressPercentage || 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums w-8 text-right">
                      {enrollment.progressPercentage || 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
