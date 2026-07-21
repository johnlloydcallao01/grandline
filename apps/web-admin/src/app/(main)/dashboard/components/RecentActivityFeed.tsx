'use client'

import React, { useMemo } from 'react'
import type { RecentActivity } from '../actions'

interface RecentActivityFeedProps {
  data: RecentActivity[]
  loading?: boolean
}

const typeConfig = {
  enrollment: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  completion: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SkeletonItem(_props: Record<string, unknown>) {
  return (
    <div className="animate-pulse flex items-start gap-3 pb-6">
      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
      </div>
    </div>
  )
}

export function RecentActivityFeed({ data, loading }: RecentActivityFeedProps) {
  const formatted = useMemo(() => {
    if (!data?.length) return []
    return data.map(a => ({
      ...a,
      relativeTime: formatRelativeTime(a.timestamp),
      config: typeConfig[a.type] || typeConfig.enrollment,
    }))
  }, [data])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
        <div className="px-1 pb-3 border-b border-gray-100 dark:border-[var(--card-border)] mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        </div>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
        </div>
      </div>
    )
  }

  if (!formatted.length) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-8 text-center">
        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4">
      <div className="px-1 pb-3 border-b border-gray-100 dark:border-[var(--card-border)] mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-50 dark:divide-gray-800">
          {formatted.map((activity, idx) => (
            <li key={activity.id} className={`py-3 ${idx === 0 ? 'pt-0' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full ${activity.config.bg} shrink-0 mt-0.5`}>
                  <span className={activity.config.color}>{activity.config.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">{activity.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{activity.relativeTime}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
