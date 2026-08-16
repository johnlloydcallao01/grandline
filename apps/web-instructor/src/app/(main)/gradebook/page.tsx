'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import {
  getGradebookData,
  type GradebookData,
} from './actions'

const Link = NextLink as any

const MAX_VISIBLE_STUDENTS = 100

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
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
const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
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

export default function GradebookPage() {
  const [data, setData] = useState<GradebookData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const studentsRef = useRef<HTMLDivElement>(null)

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
  const filteredCourses = !data ? [] : query
    ? data.courses.filter((course) => course.title.toLowerCase().includes(query) || course.code.toLowerCase().includes(query))
    : data.courses

  const filteredEnrollments = !data ? [] : data.enrollments.filter((enrollment) => {
    if (courseFilter !== 'all' && String(enrollment.courseId) !== courseFilter) return false
    if (!query) return true
    return enrollment.traineeName.toLowerCase().includes(query)
      || enrollment.traineeEmail.toLowerCase().includes(query)
      || enrollment.courseTitle.toLowerCase().includes(query)
  })

  const visibleEnrollments = filteredEnrollments.slice(0, MAX_VISIBLE_STUDENTS)
  const summary = data?.summary

  const viewStudents = (courseId: number) => {
    setCourseFilter(String(courseId))
    setTimeout(() => studentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><GraduationCapIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load gradebook</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  const metricCards = [
    { label: 'Courses Taught', value: summary?.totalCourses ?? '—', icon: <BookIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Enrolled', value: summary?.totalEnrollments ?? '—', icon: <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />, color: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Graded', value: summary?.totalGraded ?? '—', icon: <TrendingUpIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Average Grade', value: summary?.averageGrade != null ? `${summary.averageGrade}%` : '—', icon: <GraduationCapIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-50 dark:bg-purple-950/30' },
  ]

  return (
    <div className="space-y-6 py-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gradebook</h1><p className="mt-1 text-gray-500 dark:text-gray-400">Track grades and progress across the courses you teach</p></div>

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
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[var(--card-border)]">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Course Overview</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isLoading ? 'Loading courses...' : `${filteredCourses.length} of ${summary?.totalCourses ?? 0} courses shown`}</p>
          </div>
          <div className="relative w-full sm:w-72"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search courses or students..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div>
        </div>

        {isLoading ? <div className="space-y-4 p-6">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div> : filteredCourses.length === 0 ? (
          <div className="p-12 text-center"><GraduationCapIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No courses found</h3><p className="text-sm text-gray-500 dark:text-gray-400">{query ? 'No courses match your search.' : 'You are not assigned as an instructor or co-instructor on any courses yet.'}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Enrolled</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Graded</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Grade</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Passed</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Grading</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{filteredCourses.map((course) => <tr key={course.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/30"><BookIcon className="h-4 w-4 text-blue-500" /></div><div className="min-w-0"><p className="max-w-[240px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</p>{course.code && <p className="text-xs text-gray-400">{course.code}</p>}</div></div></td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{course.enrollmentCount}</td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{course.gradedCount}</td><td className="px-4 py-3"><GradeValue grade={course.avgGrade} passingGrade={course.passingGrade} /></td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{course.passedCount}</td><td className="px-4 py-3">{course.pendingCount > 0 ? <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{course.pendingCount} pending</span> : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}</td><td className="px-4 py-3 text-right"><button onClick={() => viewStudents(course.id)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">View Students<ArrowUpRightIcon className="h-3 w-3" /></button></td></tr>)}</tbody></table></div>
        )}
      </div>

      <div ref={studentsRef} className="rounded-xl border border-gray-200 bg-white shadow-sm scroll-mt-6 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[var(--card-border)]">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Students</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isLoading ? 'Loading students...' : `${visibleEnrollments.length} of ${filteredEnrollments.length} students shown`}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All Courses</option>{data?.courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>)}</select>
            {courseFilter !== 'all' && <button onClick={() => setCourseFilter('all')} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Clear Course Filter</button>}
          </div>
        </div>

        {isLoading ? <div className="space-y-4 p-6">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div> : visibleEnrollments.length === 0 ? (
          <div className="p-12 text-center"><UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No students found</h3><p className="text-sm text-gray-500 dark:text-gray-400">{query || courseFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No enrollments have been recorded for your courses yet.'}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1100px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Student</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Progress</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Current</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Final</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Evaluation</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Review</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{visibleEnrollments.map((enrollment) => <tr key={enrollment.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/30"><UserIcon className="h-4 w-4 text-blue-500" /></div><div className="min-w-0"><p className="max-w-[160px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{enrollment.traineeName}</p>{enrollment.traineeEmail && <p className="max-w-[160px] truncate text-xs text-gray-400">{enrollment.traineeEmail}</p>}</div></div></td><td className="px-4 py-3"><span className="block max-w-[200px] truncate text-sm text-gray-700 dark:text-gray-300">{enrollment.courseTitle}</span></td><td className="px-4 py-3"><StatusBadge status={enrollment.status} /></td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{enrollment.progressPercentage != null ? `${Math.round(enrollment.progressPercentage)}%` : '—'}</td><td className="px-4 py-3"><GradeValue grade={enrollment.currentGrade} passingGrade={data?.courses.find((course) => course.id === enrollment.courseId)?.passingGrade ?? 70} /></td><td className="px-4 py-3"><GradeValue grade={enrollment.finalGrade} passingGrade={data?.courses.find((course) => course.id === enrollment.courseId)?.passingGrade ?? 70} /></td><td className="px-4 py-3"><EvalBadge evaluation={enrollment.finalEvaluation} /></td><td className="px-4 py-3">{enrollment.pendingCount > 0 ? <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{enrollment.pendingCount} pending</span> : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><Link href="/submissions/assignments" className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">Assignments</Link><Link href="/submissions/assessments" className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">Assessments</Link></div></td></tr>)}</tbody></table></div>
        )}
        {!isLoading && filteredEnrollments.length > MAX_VISIBLE_STUDENTS && <div className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500 dark:border-[var(--card-border)]"><p>Showing the first {MAX_VISIBLE_STUDENTS} of {filteredEnrollments.length} students — refine your search or course filter to narrow the list.</p></div>}
      </div>
    </div>
  )
}