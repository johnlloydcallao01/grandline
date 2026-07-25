'use client'

import React, { useMemo } from 'react'
import type { PopularCourse } from '../actions'

interface PopularCoursesTableProps {
  data: PopularCourse[]
  loading?: boolean
}

function SkeletonRow(_props: Record<string, unknown>) {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800" /><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-44" /></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-full" /></td>
    </tr>
  )
}

function getRankIcon(index: number) {
  if (index === 0) return 'text-amber-500'
  if (index === 1) return 'text-gray-400 dark:text-gray-500'
  if (index === 2) return 'text-orange-400'
  return 'text-gray-300 dark:text-gray-600'
}

export function PopularCoursesTable({ data, loading }: PopularCoursesTableProps) {
  const maxEnrollments = useMemo(() => {
    if (!data?.length) return 1
    return Math.max(...data.map(c => c.enrollmentCount), 1)
  }, [data])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Popular Courses</h3>
        </div>
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-8 text-center">
        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No course data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Popular Courses</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">By enrollment</span>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {data.map((course, index) => {
          const barWidth = maxEnrollments > 0 ? (course.enrollmentCount / maxEnrollments) * 100 : 0
          return (
            <div key={course.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3 mb-1.5">
                <span className={`text-xs font-bold w-4 text-center ${getRankIcon(index)}`}>
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">{course.title}</span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tabular-nums">{course.enrollmentCount}</span>
              </div>
              <div className="flex items-center gap-3 ml-7">
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-700"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-10 text-right">
                  {course.completionRate}% done
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
