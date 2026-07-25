'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  RefreshCw, AlertCircle, BarChart3, Users,
  BookOpen, CheckCircle, Award,
} from '@/components/ui/IconWrapper'
import { getReportsData, type ReportsData } from './actions'
import { OverviewTab, LearnersTab, CoursesTab, AssessmentsTab, CertificationsTab } from './components'

type TabId = 'overview' | 'learners' | 'courses' | 'assessments' | 'certifications'

interface TabConfig {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'learners', label: 'Learners', icon: <Users className="w-4 h-4" /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'assessments', label: 'Assessments', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
]

function ReportsSkeleton() {
  return (
    <div className="py-4 sm:py-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-36" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-56" />
        </div>
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="flex gap-1 border-b border-gray-200 dark:border-[var(--card-border)] pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 bg-gray-100 dark:bg-gray-800 rounded w-28" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-72">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
          <div className="flex items-end gap-3 h-56">
            {[55, 70, 40, 85, 50, 65, 45, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-72">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
          <div className="flex items-end gap-3 h-56">
            {[35, 60, 50, 75, 45, 55, 70, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load reports</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getReportsData()
      setData(result)
      setLastRefreshed(new Date())
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    void load()
  }, [load])

  useEffect(() => {
    void load()
  }, [load])

  if (error && !data) {
    return (
      <div className="p-4 sm:p-6">
        <ReportsError message={error} onRetry={load} />
      </div>
    )
  }

  if (loading) {
    return <ReportsSkeleton />
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={data} loading={false} />
      case 'learners':
        return <LearnersTab data={data} loading={false} />
      case 'courses':
        return <CoursesTab data={data} loading={false} />
      case 'assessments':
        return <AssessmentsTab data={data} loading={false} />
      case 'certifications':
        return <CertificationsTab data={data} loading={false} />
      default:
        return null
    }
  }

  return (
    <div className="py-4 sm:py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Reports</h1>
          <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Enterprise LMS analytics and performance reports
            {lastRefreshed && (
              <span className="ml-2 text-gray-400 dark:text-gray-500">
                &middot; Updated {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--card-background)] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
        <nav className="flex gap-0 -mb-px overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap shrink-0 " +
                (activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50")
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}
