'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import {
  getInstructorStudentOverview,
  type StudentOverviewData,
  type StudentRow,
} from './actions'

const Link = NextLink as any
const ITEMS_PER_PAGE = 25

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
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
)
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
)
const BackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
)

const LEVEL_STYLES: Record<string, string> = {
  standard: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  suspended: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  dropped: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

function LevelBadge({ level }: { level?: string | null }) {
  const styles = LEVEL_STYLES[level || 'standard'] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles}`}>{level || 'standard'}</span>
}

function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles}`}>{status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}</span>
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

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StudentOverviewPage() {
  const [data, setData] = useState<StudentOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setData(await getInstructorStudentOverview())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1)
    }, 250)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchTerm, courseFilter])

  const query = searchTerm.trim().toLowerCase()

  const allowedTraineeIds = useCallback(() => {
    if (courseFilter === 'all' || !data) return null
    const set = new Set<number>()
    for (const enrollment of data.enrollments) {
      if (String(enrollment.courseId) === courseFilter) set.add(enrollment.traineeId)
    }
    return set
  }, [courseFilter, data])

  const filteredStudents = (() => {
    if (!data) return []
    const allowed = allowedTraineeIds()
    return data.students.filter((student) => {
      if (allowed && !allowed.has(student.traineeId)) return false
      if (!query) return true
      return student.name.toLowerCase().includes(query)
        || student.email.toLowerCase().includes(query)
        || student.srn.toLowerCase().includes(query)
    })
  })()

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const visibleStudents = filteredStudents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
  const summary = data?.summary

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><UsersIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load students</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  const metricCards = [
    { label: 'Students in My Courses', value: summary?.totalStudents ?? '—', icon: <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Enrolled', value: summary?.totalEnrollments ?? '—', icon: <BookIcon className="h-5 w-5 text-green-600 dark:text-green-400" />, color: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Average Grade', value: summary?.averageGrade != null ? `${summary.averageGrade}%` : '—', icon: <TrendingUpIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Pending Grading', value: summary?.totalPending ?? '—', icon: <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-50 dark:bg-amber-950/30' },
  ]

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-3">
        <Link href="/gradebook" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><BackIcon className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Overview</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">View grades and performance for students in the courses you teach</p>
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
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[var(--card-border)]">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Students</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isLoading ? 'Loading students...' : `${filteredStudents.length} of ${summary?.totalStudents ?? 0} students shown`}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-72"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, SRN, or email..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div>
            <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All Courses</option>{data?.courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>)}</select>
          </div>
        </div>

        {isLoading ? <div className="space-y-4 p-6">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div> : filteredStudents.length === 0 ? (
          <div className="p-12 text-center"><UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No students found</h3><p className="text-sm text-gray-500 dark:text-gray-400">{query || courseFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No students are enrolled in your courses yet.'}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Student</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">SRN</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Level</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Courses</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Grade</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{visibleStudents.map((student) => <tr key={student.traineeId} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/30"><UserIcon className="h-4 w-4 text-blue-500" /></div><div className="min-w-0"><p className="max-w-[160px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</p>{student.email && <p className="max-w-[160px] truncate text-xs text-gray-400">{student.email}</p>}</div></div></td><td className="px-4 py-3"><span className="font-mono text-xs text-gray-600 dark:text-gray-400">{student.srn || '—'}</span></td><td className="px-4 py-3"><LevelBadge level={student.level} /></td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{student.enrollmentCount}</td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{student.completedCount}</td><td className="px-4 py-3"><GradeValue grade={student.avgGrade} passingGrade={70} /></td><td className="px-4 py-3">{student.pendingCount > 0 ? <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{student.pendingCount} pending</span> : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}</td><td className="px-4 py-3 text-right"><button onClick={() => setSelectedStudent(student)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"><EyeIcon className="h-3.5 w-3.5" />View</button></td></tr>)}</tbody></table></div>
        )}
        {!isLoading && filteredStudents.length > ITEMS_PER_PAGE && <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-[var(--card-border)]"><p className="text-sm text-gray-500 dark:text-gray-400">Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length}</p><div className="flex gap-2"><button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage === 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Previous</button><button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safePage === totalPages} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Next</button></div></div>}
      </div>

      {selectedStudent && <StudentDrawer student={selectedStudent} enrollments={data?.enrollments || []} courses={data?.courses || []} onClose={() => setSelectedStudent(null)} />}
    </div>
  )
}

function StudentDrawer({ student, enrollments, courses, onClose }: { student: StudentRow; enrollments: StudentOverviewData['enrollments']; courses: StudentOverviewData['courses']; onClose: () => void }) {
  const studentEnrollments = enrollments.filter((enrollment) => enrollment.traineeId === student.traineeId)
  const passingGradeFor = (courseId: number) => courses.find((course) => course.id === courseId)?.passingGrade ?? 70

  const statTiles = [
    { icon: <BookIcon className="h-3.5 w-3.5 text-white" />, label: 'Courses', value: student.enrollmentCount, color: 'bg-blue-600' },
    { icon: <CheckCircleIcon className="h-3.5 w-3.5 text-white" />, label: 'Completed', value: student.completedCount, color: 'bg-green-600' },
    { icon: <ClockIcon className="h-3.5 w-3.5 text-white" />, label: 'In Progress', value: student.inProgressCount, color: 'bg-amber-600' },
    { icon: <TrendingUpIcon className="h-3.5 w-3.5 text-white" />, label: 'Avg Grade', value: student.avgGrade != null ? `${student.avgGrade}%` : '—', color: 'bg-purple-600' },
    { icon: <ClockIcon className="h-3.5 w-3.5 text-white" />, label: 'Pending', value: student.pendingCount, color: 'bg-indigo-600' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div onClick={(event) => event.stopPropagation()} className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-[var(--card-background)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"><UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900 dark:text-gray-100">{student.name}</h2>
              <p className="truncate text-xs text-gray-500">{student.srn}{student.email ? ` · ${student.email}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><XIcon className="h-5 w-5" /></button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-[var(--card-border)] dark:bg-gray-800/50">
            <div><span className="text-xs text-gray-500">Level</span><div className="mt-1"><LevelBadge level={student.level} /></div></div>
            <div><span className="text-xs text-gray-500">SRN</span><p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">{student.srn || '—'}</p></div>
            <div><span className="text-xs text-gray-500">Email</span><p className="mt-1 truncate text-sm text-gray-900 dark:text-gray-100">{student.email || '—'}</p></div>
            <div><span className="text-xs text-gray-500">Enrolled</span><p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(student.enrollmentDate)}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {statTiles.map((tile) => (
              <div key={tile.label} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
                <div className="flex items-center gap-2">
                  <div className={`rounded-md p-1.5 ${tile.color}`}>{tile.icon}</div>
                  <div><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{tile.value}</p><p className="text-[10px] text-gray-500 dark:text-gray-400">{tile.label}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">Course Enrollments</h3>
            {studentEnrollments.length === 0 ? <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No enrollments in your courses</p> : (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[var(--card-border)]">
                <table className="w-full"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Course</th><th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</th><th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Grade</th><th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Eval</th><th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Pending</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Review</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{studentEnrollments.map((enrollment) => <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-3 py-2.5"><span className="block max-w-[150px] truncate text-xs font-medium text-gray-900 dark:text-gray-100">{enrollment.courseTitle}</span></td><td className="px-3 py-2.5"><StatusBadge status={enrollment.status} /></td><td className="px-3 py-2.5"><GradeValue grade={enrollment.finalGrade ?? enrollment.currentGrade} passingGrade={passingGradeFor(enrollment.courseId)} /></td><td className="px-3 py-2.5"><EvalBadge evaluation={enrollment.finalEvaluation} /></td><td className="px-3 py-2.5">{enrollment.pendingCount > 0 ? <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{enrollment.pendingCount}</span> : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}</td><td className="px-3 py-2.5"><div className="flex items-center justify-end gap-1.5"><Link href="/submissions/assignments" className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">Assignments</Link><Link href="/submissions/assessments" className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40">Assessments</Link></div></td></tr>)}</tbody></table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}