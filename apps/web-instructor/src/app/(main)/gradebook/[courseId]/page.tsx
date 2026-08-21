'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import NextLink from 'next/link'
import { getGradebookData } from '../actions'
import type { GradebookCourse, GradebookData } from '@encreasl/cms-types'

const Link = NextLink as any

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
)
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
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
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  suspended: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  dropped: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles}`}>{label}</span>
}

function EvalBadge({ evaluation }: { evaluation: 'passed' | 'failed' | null }) {
  if (!evaluation) return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
  const styles = evaluation === 'passed'
    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles}`}>{evaluation.charAt(0).toUpperCase() + evaluation.slice(1)}</span>
}

function gradeColor(grade: number, passingGrade: number): string {
  if (grade >= passingGrade) return 'text-green-600 dark:text-green-400'
  if (grade >= Math.max(0, passingGrade - 20)) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function GradeValue({ grade, passingGrade }: { grade: number | null; passingGrade: number }) {
  if (grade === null) return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
  return <span className={`text-sm font-semibold ${gradeColor(grade, passingGrade)}`}>{Math.round(grade)}%</span>
}

export default function CourseGradebookPage() {
  const params = useParams()
  const courseId = Number(params.courseId as string)

  const [data, setData] = useState<GradebookData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setData(await getGradebookData(courseId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gradebook')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => { load() }, [load])

  const course: GradebookCourse | null = data?.courses[0] ?? null

  const query = searchTerm.trim().toLowerCase()
  const enrollments = useMemo(() => {
    if (!data) return []
    return data.enrollments.filter((enrollment) => {
      if (String(enrollment.courseId) !== String(courseId)) return false
      if (!query) return true
      return enrollment.traineeName.toLowerCase().includes(query)
        || enrollment.traineeEmail.toLowerCase().includes(query)
    })
  }, [data, query, courseId])

  const gradedCount = enrollments.filter((e) => e.finalGrade != null).length
  const passedCount = enrollments.filter((e) => e.finalEvaluation === 'passed').length
  const avgGrade = gradedCount > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.finalGrade ?? 0), 0) / gradedCount)
    : null

  const metricCards = [
    { label: 'Enrolled', value: course?.enrollmentCount ?? enrollments.length, icon: <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Graded', value: gradedCount, icon: <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />, color: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Avg Grade', value: avgGrade != null ? `${avgGrade}%` : '—', icon: <TrendingUpIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Passed', value: passedCount, icon: <GraduationCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-50 dark:bg-purple-900/30' },
  ]

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><GraduationCapIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load gradebook</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  if (!isLoading && !course) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <GraduationCapIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Course not found</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">This course does not exist or you are not assigned as its instructor.</p>
          <Link href="/gradebook" className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Back to Gradebook</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-3">
        <Link href="/gradebook" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><BackIcon className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{course?.title || 'Gradebook'}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Gradebook &mdash; student grades and evaluations</p>
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
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search students..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Current</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Final</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Evaluation</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-36 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="h-5 w-16 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-12 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-12 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="h-5 w-14 rounded bg-gray-100 dark:bg-gray-800" /></td>
                  <td className="px-4 py-4"><div className="ml-auto h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No students found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{query ? 'No students match your search.' : 'No enrollments have been recorded for this course yet.'}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-[var(--card-border)] dark:bg-gray-800/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Current</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Final</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Evaluation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/30">
                          <UserIcon className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.traineeName}</p>
                          {enrollment.traineeEmail && <p className="max-w-[180px] truncate text-xs text-gray-400">{enrollment.traineeEmail}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={enrollment.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{enrollment.progressPercentage != null ? `${Math.round(enrollment.progressPercentage)}%` : '—'}</td>
                    <td className="px-4 py-3"><GradeValue grade={enrollment.currentGrade} passingGrade={course?.passingGrade ?? 70} /></td>
                    <td className="px-4 py-3"><GradeValue grade={enrollment.finalGrade} passingGrade={course?.passingGrade ?? 70} /></td>
                    <td className="px-4 py-3"><EvalBadge evaluation={enrollment.finalEvaluation} /></td>
                    <td className="px-4 py-3">{enrollment.pendingCount > 0
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><ClockIcon className="h-3 w-3" />{enrollment.pendingCount} pending</span>
                      : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href="/submissions/assignments" className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">Assignments</Link>
                        <Link href="/submissions/assessments" className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">Assessments</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}