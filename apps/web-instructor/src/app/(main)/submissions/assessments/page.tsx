'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAssessmentSubmissions,
  getCourseOptions,
  getSubmissionAnswers,
  type AnswerDoc,
  type AssessmentSubmissionDoc,
  type CourseOption,
} from './actions'

const ITEMS_PER_PAGE = 20

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
)
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)
const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
)
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
)
const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
)

function traineeName(submission: AssessmentSubmissionDoc): string {
  const trainee = submission.trainee
  if (!trainee || typeof trainee === 'number') return `Trainee #${submission.id}`
  const user = trainee.user
  if (user && (user.firstName || user.lastName)) return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  return trainee.srn || `Trainee #${trainee.id}`
}

function assessmentTitle(submission: AssessmentSubmissionDoc): string {
  const assessment = submission.assessment
  if (!assessment || typeof assessment === 'number') return `Assessment #${submission.id}`
  return assessment.title || `Assessment #${assessment.id}`
}

function assessmentType(submission: AssessmentSubmissionDoc): string {
  const assessment = submission.assessment
  if (!assessment || typeof assessment === 'number' || !assessment.assessmentType) return ''
  return assessment.assessmentType.replace(/_/g, ' ')
}

function courseTitle(submission: AssessmentSubmissionDoc): string {
  const course = submission.course
  if (!course || typeof course === 'number') return '—'
  return course.title || `Course #${course.id}`
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function passed(submission: AssessmentSubmissionDoc): boolean | null {
  if (submission.status === 'in_progress' || submission.score === undefined || submission.passingScoreSnapshot === undefined) return null
  return submission.score >= submission.passingScoreSnapshot
}

function scoreLabel(submission: AssessmentSubmissionDoc): string {
  if (submission.score === undefined || submission.score === null) return '—'
  return `${Number(submission.score).toFixed(1)}%`
}

function responseText(response: any): string {
  if (response === null || response === undefined) return 'No response'
  const value = response && typeof response === 'object' && 'value' in response ? response.value : response
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  try { return JSON.stringify(value) } catch { return String(value) }
}

export default function AssessmentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AssessmentSubmissionDoc[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<AssessmentSubmissionDoc | null>(null)
  const [answers, setAnswers] = useState<AnswerDoc[]>([])
  const [answersLoading, setAnswersLoading] = useState(false)
  const [answersError, setAnswersError] = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getAssessmentSubmissions({
        search: debouncedSearch || undefined,
        status: statusFilter,
        courseId: courseFilter === 'all' ? undefined : courseFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      })
      setSubmissions(result.docs)
      setTotalDocs(result.totalDocs)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment submissions')
    } finally {
      setIsLoading(false)
    }
  }, [courseFilter, currentPage, debouncedSearch, statusFilter])

  useEffect(() => { loadSubmissions() }, [loadSubmissions])

  useEffect(() => {
    getCourseOptions().then(setCourses).catch(() => { })
  }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchTerm])

  useEffect(() => {
    if (!detail) {
      setAnswers([])
      setAnswersError(null)
      return
    }
    let cancelled = false
    setAnswersLoading(true)
    setAnswersError(null)
    getSubmissionAnswers(detail.id)
      .then((result) => { if (!cancelled) setAnswers(result) })
      .catch((err) => { if (!cancelled) setAnswersError(err instanceof Error ? err.message : 'Failed to load answers') })
      .finally(() => { if (!cancelled) setAnswersLoading(false) })
    return () => { cancelled = true }
  }, [detail])

  const pagePassed = submissions.filter((submission) => passed(submission) === true).length
  const pageFailed = submissions.filter((submission) => passed(submission) === false).length
  const pageInProgress = submissions.filter((submission) => submission.status === 'in_progress').length

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><BookIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load assessment submissions</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={loadSubmissions} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  return (
<div className="space-y-6 py-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assessment Submissions</h1><p className="mt-1 text-gray-500 dark:text-gray-400">Review automated assessment attempts from your courses</p></div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Total', totalDocs, 'text-blue-600 dark:text-blue-400', 'bg-blue-50 dark:bg-blue-950/30'],
          ['Passed', pagePassed, 'text-green-600 dark:text-green-400', 'bg-green-50 dark:bg-green-950/30'],
          ['Failed', pageFailed, 'text-red-600 dark:text-red-400', 'bg-red-50 dark:bg-red-950/30'],
          ['In progress', pageInProgress, 'text-amber-600 dark:text-amber-400', 'bg-amber-50 dark:bg-amber-950/30'],
        ].map(([label, value, color, bg]) => <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div className="flex items-center gap-3"><div className={`rounded-lg p-2.5 ${bg}`}><BookIcon className={`h-5 w-5 ${color}`} /></div><div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isLoading ? '—' : value}</p><p className="text-xs text-gray-500 dark:text-gray-400">{label}{label !== 'Total' ? ' on this page' : ''}</p></div></div></div>)}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
        <div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by trainee, assessment, or course..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div>
        <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All My Courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>)}</select>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All Statuses</option><option value="in_progress">In Progress</option><option value="submitted">Submitted</option><option value="graded">Graded</option></select>
      </div>

      {isLoading ? <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div className="space-y-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div></div> : submissions.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><BookIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No assessment submissions found</h3><p className="text-sm text-gray-500 dark:text-gray-400">{debouncedSearch || statusFilter !== 'all' || courseFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No assessment attempts have been recorded for your courses.'}</p></div> : <>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><table className="w-full min-w-[950px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trainee</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Assessment</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Score</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Attempt</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{submissions.map((submission) => <tr key={submission.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/30"><UserIcon className="h-4 w-4 text-blue-500" /></div><span className="max-w-[160px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{traineeName(submission)}</span></div></td><td className="px-4 py-3"><span className="block max-w-[190px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{assessmentTitle(submission)}</span>{assessmentType(submission) && <span className="text-xs capitalize text-gray-400">{assessmentType(submission)}</span>}</td><td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{courseTitle(submission)}</td><td className="px-4 py-3"><StatusBadge status={submission.status} /></td><td className={`px-4 py-3 text-sm font-medium ${passed(submission) === true ? 'text-green-600 dark:text-green-400' : passed(submission) === false ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>{scoreLabel(submission)}</td><td className="px-4 py-3 text-sm text-gray-500">#{submission.attemptNumber}</td><td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(submission.completedAt)}</td><td className="px-4 py-3 text-right"><button onClick={() => setDetail(submission)} title="Review submission" className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"><EyeIcon className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
        {totalPages > 1 && <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><p className="text-sm text-gray-500">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}</p><div className="flex gap-2"><button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Previous</button><button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Next</button></div></div>}
      </>}

      {detail && <SubmissionDrawer submission={detail} answers={answers} loading={answersLoading} error={answersError} onClose={() => setDetail(null)} />}
    </div>
  )
}

function StatusBadge({ status }: { status: AssessmentSubmissionDoc['status'] }) {
  const styles = status === 'submitted' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : status === 'graded' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  const label = status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles}`}>{label}</span>
}

function SubmissionDrawer({ submission, answers, loading, error, onClose }: { submission: AssessmentSubmissionDoc; answers: AnswerDoc[]; loading: boolean; error: string | null; onClose: () => void }) {
  const result = passed(submission)
  return <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}><div className="absolute inset-0 bg-black/30" /><div onClick={(event) => event.stopPropagation()} className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-[var(--card-background)]"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div><h2 className="truncate pr-4 text-lg font-bold text-gray-900 dark:text-gray-100">Submission Review</h2><p className="text-xs text-gray-500">#{submission.id}</p></div><button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><XIcon className="h-5 w-5" /></button></div><div className="space-y-6 p-6"><div className="flex items-center justify-between"><StatusBadge status={submission.status} />{result === null ? <span className="text-sm text-gray-500">Result unavailable</span> : result ? <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600"><CheckIcon className="h-4 w-4" />Passed</span> : <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600"><AlertIcon className="h-4 w-4" />Failed</span>}</div><div className="grid grid-cols-2 gap-4 border-y py-4 text-sm dark:border-[var(--card-border)]"><div><span className="text-gray-500">Trainee</span><p className="mt-1 flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100"><UserIcon className="h-3.5 w-3.5 text-gray-400" />{traineeName(submission)}</p></div><div><span className="text-gray-500">Assessment</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{assessmentTitle(submission)}</p></div><div><span className="text-gray-500">Course</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{courseTitle(submission)}</p></div><div><span className="text-gray-500">Attempt</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">#{submission.attemptNumber}</p></div><div><span className="text-gray-500">Score</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{scoreLabel(submission)}{submission.pointsPossible !== undefined ? ` (${submission.pointsTotal ?? 0}/${submission.pointsPossible} points)` : ''}</p></div><div><span className="text-gray-500">Passing score</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{submission.passingScoreSnapshot !== undefined ? `${submission.passingScoreSnapshot}%` : '—'}</p></div><div><span className="text-gray-500">Started</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(submission.startedAt)}</p></div><div><span className="text-gray-500">Completed</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(submission.completedAt)}</p></div></div><div><h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">Answer Review</h3>{error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}</div> : answers.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">No answers available for this submission.</div> : <div className="space-y-3">{answers.map((answer, index) => <AnswerCard key={answer.id} answer={answer} index={index} />)}</div>}</div><button onClick={onClose} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button></div></div></div>
}

function AnswerCard({ answer, index }: { answer: AnswerDoc; index: number }) {
  const question = typeof answer.question === 'object' ? answer.question : null
  const type = answer.questionType || question?.type || 'question'
  return <div className={`rounded-lg border p-4 ${answer.isCorrect ? 'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10' : 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10'}`}><div className="mb-2 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Question {index + 1} · {type.replace(/_/g, ' ')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{question?.prompt || `Question #${typeof answer.question === 'number' ? answer.question : answer.id}`}</p></div>{answer.isCorrect ? <CheckIcon className="h-5 w-5 shrink-0 text-green-600" /> : <AlertIcon className="h-5 w-5 shrink-0 text-red-600" />}</div><div className="grid gap-2 text-sm sm:grid-cols-2"><div><span className="text-xs text-gray-500">Response</span><p className="mt-0.5 break-words text-gray-900 dark:text-gray-100">{responseText(answer.response)}</p></div><div><span className="text-xs text-gray-500">Points earned</span><p className="mt-0.5 text-gray-900 dark:text-gray-100">{answer.pointsEarned ?? 0}</p></div></div>{answer.feedback && <div className="mt-3 border-t border-black/5 pt-3 text-sm dark:border-white/10"><span className="text-xs text-gray-500">Feedback</span><p className="mt-0.5 text-gray-700 dark:text-gray-300">{answer.feedback}</p></div>}</div>
}
