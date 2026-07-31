'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StatCard, EnrollmentTrendChart, GradeDistributionChart, StatusDistributionChart, CourseStatsTable, PendingSubmissionsTable, RecentActivityFeed } from './components';
import { getInstructorDashboardData, type InstructorDashboardData } from './actions';

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="py-4 sm:py-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-48" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-64" />
        </div>
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
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
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
          <div className="flex items-end gap-3 h-64">
            {[55, 70, 40, 85, 50, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
          <div className="flex items-center justify-center h-64">
            <div className="relative h-40 w-40">
              <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="absolute inset-5 rounded-full bg-white dark:bg-[var(--card-background)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm h-60" />
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm h-60" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInstructorDashboardData();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error && !data) {
    return (
      <div className="p-4 sm:p-6">
        <DashboardError message={error} onRetry={load} />
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats;
  const trends = data?.courseTrends;
  const gradeDistribution = data?.gradeDistribution || [];
  const statusDistribution = data?.statusDistribution || [];
  const courseStats = data?.courseStats || [];
  const pendingSubmissions = data?.pendingSubmissions || [];
  const recentActivity = data?.recentActivity || [];

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Instructor';

  return (
    <div className="py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Welcome back, {displayName.split(' ')[0]}
          </h1>
          <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Your instructor workspace overview
            {data?.instructor?.specialization && (
              <span className="ml-2 text-gray-400 dark:text-gray-500">&middot; {data.instructor.specialization}</span>
            )}
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
            <svg className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="sr-only sm:not-sr-only">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard
          title="My Courses"
          value={stats?.totalCourses ?? 0}
          subtitle={`${stats?.activeCourses ?? 0} published`}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          loading={loading}
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle="Enrolled across courses"
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          loading={loading}
        />
        <StatCard
          title="Active Enrollments"
          value={stats?.activeEnrollments ?? 0}
          subtitle={`${stats?.completedEnrollments ?? 0} completed`}
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{
            direction: (stats?.completionRate ?? 0) > 50 ? 'up' : 'neutral',
            value: `${stats?.completionRate ?? 0}% completion`,
          }}
          loading={loading}
        />
        <StatCard
          title="Average Grade"
          value={stats?.averageGrade ? `${stats.averageGrade}%` : 'N/A'}
          subtitle="Across all enrollments"
          color={stats?.averageGrade && stats.averageGrade >= 70 ? 'teal' : 'orange'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          loading={loading}
        />
        <StatCard
          title="Pending Grading"
          value={stats?.pendingGrading ?? 0}
          subtitle={`${stats?.recentSubmissions ?? 0} in last 7 days`}
          color={stats?.pendingGrading && stats.pendingGrading > 0 ? 'red' : 'green'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          loading={loading}
          trend={stats?.pendingGrading && stats.pendingGrading > 0 ? { direction: 'down', value: 'Needs attention' } : { direction: 'up', value: 'All clear' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentTrendChart
          enrollments={trends?.monthlyEnrollments || []}
          completions={trends?.monthlyCompletions || []}
          loading={loading}
        />
        <GradeDistributionChart
          data={gradeDistribution}
          loading={loading}
        />
      </div>

      {/* Course Performance + Status + Activity + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CourseStatsTable
            data={courseStats}
            loading={loading}
          />
        </div>
        <div className="space-y-6">
          <StatusDistributionChart
            data={statusDistribution}
            loading={loading}
          />
          <RecentActivityFeed
            data={recentActivity}
            loading={loading}
          />
          <PendingSubmissionsTable
            data={pendingSubmissions}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
