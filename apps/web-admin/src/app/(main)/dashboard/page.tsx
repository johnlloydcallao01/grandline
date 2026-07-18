'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Users, BookOpen, Award,
  RefreshCw, AlertCircle,
} from '@/components/ui/IconWrapper'
import { getDashboardData, type DashboardData } from './actions'
import { StatCard } from './components/StatCard'
import { EnrollmentTrendChart } from './components/EnrollmentTrendChart'
import { CategoryDistributionChart } from './components/CategoryDistributionChart'
import { RecentEnrollmentsTable } from './components/RecentEnrollmentsTable'
import { PopularCoursesTable } from './components/PopularCoursesTable'
import { RecentActivityFeed } from './components/RecentActivityFeed'

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="py-4 sm:py-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 rounded w-36" />
          <div className="h-4 bg-gray-100 rounded w-56" />
        </div>
        <div className="h-8 bg-gray-100 rounded w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 [&>:last-child:nth-child(odd)]:col-span-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-7 bg-gray-100 rounded w-12" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 rounded w-36 mb-4" />
          <div className="flex items-end gap-3 h-64">
            {[55, 70, 40, 85, 50, 65, 45, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 rounded w-36 mb-4" />
          <div className="flex items-center justify-center h-64">
            <div className="relative h-40 w-40">
              <div className="h-full w-full rounded-full bg-gray-100" />
              <div className="absolute inset-5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-100 rounded w-32" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-100 rounded w-28" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-gray-100" />
                  <div className="h-3 bg-gray-100 rounded flex-1" />
                </div>
                <div className="h-1.5 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDashboardData()
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
        <DashboardError message={error} onRetry={load} />
      </div>
    )
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  const overview = data?.overview
  const trends = data?.trends
  const categoryDistribution = data?.categoryDistribution || []
  const recentEnrollments = data?.recentEnrollments || []
  const popularCourses = data?.popularCourses || []
  const recentActivity = data?.recentActivity || []

  return (
    <div className="py-4 sm:py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-500">
            Enterprise LMS platform overview
            {lastRefreshed && (
              <span className="ml-2 text-gray-400">
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
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 [&>:last-child:nth-child(odd)]:col-span-full">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents ?? 0}
          subtitle="Registered trainees"
          formatter={formatNumber}
          color="blue"
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Total Courses"
          value={overview?.totalCourses ?? 0}
          subtitle="Active courses on platform"
          formatter={formatNumber}
          color="purple"
          icon={<BookOpen className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Enrollments"
          value={overview?.activeEnrollments ?? 0}
          subtitle={`${overview?.totalEnrollments ?? 0} total`}
          formatter={formatNumber}
          color="green"
          icon={<Award className="w-5 h-5" />}
          loading={loading}
          trend={{
            direction: (overview?.completionRate ?? 0) > 50 ? 'up' : 'neutral',
            value: `${overview?.completionRate ?? 0}% completion`,
          }}
        />
        <StatCard
          title="Instructors"
          value={overview?.totalInstructors ?? 0}
          subtitle="Active instructors"
          formatter={formatNumber}
          color="orange"
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Certificates"
          value={overview?.totalCertificates ?? 0}
          subtitle={`${overview?.completedEnrollments ?? 0} completions`}
          formatter={formatNumber}
          color="pink"
          icon={<Award className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentTrendChart
          enrollments={trends?.monthlyEnrollments || []}
          completions={trends?.monthlyCompletions || []}
          loading={loading}
        />
        <CategoryDistributionChart
          data={categoryDistribution}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentEnrollmentsTable
            data={recentEnrollments}
            loading={loading}
          />
        </div>
        <div className="space-y-6">
          <PopularCoursesTable
            data={popularCourses}
            loading={loading}
          />
          <RecentActivityFeed
            data={recentActivity}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
