'use client'

import React, { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import { getGradebookData } from './actions'
import type { GradebookData } from '@encreasl/cms-types'

const Link = NextLink as any

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
)
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>
)
const GraduationCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
)
const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
)

function gradeColor(grade: number): string {
  if (grade >= 70) return 'text-green-600 dark:text-green-400'
  if (grade >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function GradeValue({ grade }: { grade: number | null }) {
  if (grade === null) return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
  return <span className={`text-sm font-semibold ${gradeColor(grade)}`}>{Math.round(grade)}%</span>
}

export default function GradebookPage() {
  const [data, setData] = useState<GradebookData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setData(await getGradebookData())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gradebook')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const query = searchTerm.trim().toLowerCase()
  const filtered = !data ? [] : query
    ? data.courses.filter((course) => course.title.toLowerCase().includes(query) || course.code.toLowerCase().includes(query))
    : data.courses

  const summary = data?.summary
  const totalEnrollments = summary?.totalEnrollments ?? 0
  const totalGraded = summary?.totalGraded ?? 0
  const totalPassed = summary?.totalPassed ?? 0

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><GraduationCapIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load gradebook</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  const metricCards = [
    { label: 'Courses', value: summary?.totalCourses ?? 0, icon: <BookIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Enrolled', value: totalEnrollments, icon: <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />, color: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Graded', value: totalGraded, icon: <TrendingUpIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Passed', value: totalPassed, icon: <CheckCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-50 dark:bg-purple-900/30' },
  ]

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gradebook</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">View grades by course &mdash; select a course to see student performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isLoading ? '—' : card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search courses..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Enrolled</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Graded</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Grade</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Passed</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="mx-auto h-4 w-8 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="mx-auto h-4 w-8 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="mx-auto h-4 w-12 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="mx-auto h-4 w-8 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="ml-auto h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <GraduationCapIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No courses found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{query ? 'No courses match your search.' : 'You are not assigned as an instructor or co-instructor on any courses yet.'}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-[var(--card-border)] dark:bg-gray-800/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Enrolled</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Graded</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Grade</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Passed</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((course) => (
                <tr key={course.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/30">
                        <BookIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                        {course.code && <p className="text-xs text-gray-400">{course.code}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{course.enrollmentCount}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{course.gradedCount}</td>
                  <td className="px-4 py-3 text-center"><GradeValue grade={course.avgGrade} /></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{course.passedCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/gradebook/${course.id}`}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">
                      View Gradebook
                      <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}