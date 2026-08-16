'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAssignmentSubmissions,
  getCourseOptions,
  gradeAssignmentSubmission,
  type AssignmentSubmissionDoc,
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
const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>
)
const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="18" rx="2" /><path d="M9 4V2h6v2M9 12h6M9 16h4" /></svg>
)

function extractText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join('\n')
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text
    return Object.values(value).map(extractText).filter(Boolean).join('\n')
  }
  return ''
}

function traineeName(submission: AssignmentSubmissionDoc): string {
  const trainee = submission.trainee
  if (!trainee || typeof trainee === 'number') return `Trainee #${submission.id}`
  const user = trainee.user
  if (user && (user.firstName || user.lastName)) return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  return trainee.srn || `Trainee #${trainee.id}`
}

function assignmentTitle(submission: AssignmentSubmissionDoc): string {
  const assignment = submission.assignment
  if (!assignment || typeof assignment === 'number') return `Assignment #${submission.id}`
  return assignment.title || `Assignment #${assignment.id}`
}

function courseTitle(submission: AssignmentSubmissionDoc): string {
  const enrollment = submission.enrollment
  if (!enrollment || typeof enrollment === 'number' || !enrollment.course) return '—'
  return typeof enrollment.course === 'object' ? enrollment.course.title || `Course #${enrollment.course.id}` : `Course #${enrollment.course}`
}

function assignmentMaxScore(submission: AssignmentSubmissionDoc): number {
  return typeof submission.assignment === 'object' ? Number(submission.assignment.maxScore ?? 100) : 100
}

function assignmentPassingScore(submission: AssignmentSubmissionDoc): number {
  return typeof submission.assignment === 'object' ? Number(submission.assignment.passingScore ?? 75) : 75
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function mediaUrl(file: any): string | null {
  if (!file || typeof file !== 'object' || !file.url) return null
  if (/^https?:\/\//i.test(file.url)) return file.url
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || ''
  return `${base}${file.url}`
}

export default function AssignmentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AssignmentSubmissionDoc[]>([])
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
  const [detail, setDetail] = useState<AssignmentSubmissionDoc | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getAssignmentSubmissions({
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
      setError(err instanceof Error ? err.message : 'Failed to load assignment submissions')
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

  const openDetail = (submission: AssignmentSubmissionDoc) => {
    setDetail(submission)
    setScore(submission.score !== undefined ? String(submission.score) : '')
    setFeedback(extractText(submission.feedback))
    setActionError(null)
  }

  const handleGrade = async (status: 'graded' | 'returned_for_revision') => {
    if (!detail) return
    try {
      setIsSaving(true)
      setActionError(null)
      const trimmedFeedback = feedback.trim()
      if (status === 'graded' && !score.trim()) {
        throw new Error('A score is required when marking work as graded')
      }
      if (status === 'returned_for_revision' && !trimmedFeedback) {
        throw new Error('Feedback is required when returning work for revision')
      }
      const updated = await gradeAssignmentSubmission({
        id: detail.id,
        status,
        score: status === 'graded' ? Number(score) : undefined,
        feedback: trimmedFeedback,
      })
      setSubmissions((items) => items.map((item) => item.id === updated.id ? updated : item))
      setDetail(updated)
      setScore(updated.score !== undefined ? String(updated.score) : '')
      setFeedback(extractText(updated.feedback))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update submission')
    } finally {
      setIsSaving(false)
    }
  }

  const pendingCount = submissions.filter((item) => item.status === 'submitted' || item.status === 'returned_for_revision').length
  const gradedCount = submissions.filter((item) => item.status === 'graded').length
  const returnedCount = submissions.filter((item) => item.status === 'returned_for_revision').length

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><ClipboardIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load assignment submissions</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={loadSubmissions} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  return <div className="space-y-6 py-6">
    <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignment Submissions</h1><p className="mt-1 text-gray-500 dark:text-gray-400">Review and grade trainee assignment work from your courses</p></div>

    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[
        ['Total', totalDocs, 'text-blue-600 dark:text-blue-400', 'bg-blue-50 dark:bg-blue-950/30'],
        ['Pending', pendingCount, 'text-amber-600 dark:text-amber-400', 'bg-amber-50 dark:bg-amber-950/30'],
        ['Graded', gradedCount, 'text-green-600 dark:text-green-400', 'bg-green-50 dark:bg-green-950/30'],
        ['Returned', returnedCount, 'text-red-600 dark:text-red-400', 'bg-red-50 dark:bg-red-950/30'],
      ].map(([label, value, color, bg]) => <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div className="flex items-center gap-3"><div className={`rounded-lg p-2.5 ${bg}`}><ClipboardIcon className={`h-5 w-5 ${color}`} /></div><div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isLoading ? '—' : value}</p><p className="text-xs text-gray-500 dark:text-gray-400">{label}{label !== 'Total' ? ' on this page' : ''}</p></div></div></div>)}
    </div>

    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
      <div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by trainee, assignment, or course..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div>
      <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All My Courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.code ? ` (${course.code})` : ''}</option>)}</select>
      <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100"><option value="all">All Statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="graded">Graded</option><option value="returned_for_revision">Returned</option></select>
    </div>

    {isLoading ? <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div className="space-y-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div></div> : submissions.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><ClipboardIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No assignment submissions found</h3><p className="text-sm text-gray-500 dark:text-gray-400">{debouncedSearch || statusFilter !== 'all' || courseFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No assignment submissions have been recorded for your courses.'}</p></div> : <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><table className="w-full min-w-[900px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Trainee</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Assignment</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Course</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Score</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Files</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{submissions.map((submission) => { const max = assignmentMaxScore(submission); const passing = assignmentPassingScore(submission); const isPassing = submission.score !== undefined && submission.score >= passing; return <tr key={submission.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{traineeName(submission)}</td><td className="px-4 py-3"><span className="block max-w-[190px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">{assignmentTitle(submission)}</span><span className="text-xs text-gray-400">Max {max}</span></td><td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{courseTitle(submission)}</td><td className="px-4 py-3"><StatusBadge status={submission.status} /></td><td className={`px-4 py-3 text-sm font-medium ${isPassing ? 'text-green-600 dark:text-green-400' : submission.score !== undefined ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>{submission.score !== undefined ? `${submission.score} / ${max}` : '—'}</td><td className="px-4 py-3 text-sm text-gray-500">{submission.uploadedFiles?.length || 0}</td><td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(submission.submittedAt)}</td><td className="px-4 py-3 text-right"><button onClick={() => openDetail(submission)} title="Review and grade" className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"><EyeIcon className="h-4 w-4" /></button></td></tr> })}</tbody></table></div>
      {totalPages > 1 && <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><p className="text-sm text-gray-500">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}</p><div className="flex gap-2"><button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Previous</button><button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Next</button></div></div>}
    </>}

    {detail && <GradeDrawer submission={detail} score={score} feedback={feedback} actionError={actionError} isSaving={isSaving} onScoreChange={setScore} onFeedbackChange={setFeedback} onGrade={handleGrade} onClose={() => !isSaving && setDetail(null)} />}
  </div>
}

function StatusBadge({ status }: { status: AssignmentSubmissionDoc['status'] }) {
  const styles = status === 'graded' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : status === 'returned_for_revision' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : status === 'submitted' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  const label = status === 'returned_for_revision' ? 'Returned' : status.charAt(0).toUpperCase() + status.slice(1)
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles}`}>{label}</span>
}

function GradeDrawer({ submission, score, feedback, actionError, isSaving, onScoreChange, onFeedbackChange, onGrade, onClose }: { submission: AssignmentSubmissionDoc; score: string; feedback: string; actionError: string | null; isSaving: boolean; onScoreChange: (value: string) => void; onFeedbackChange: (value: string) => void; onGrade: (status: 'graded' | 'returned_for_revision') => void; onClose: () => void }) {
  const maxScore = assignmentMaxScore(submission)
  const passingScore = assignmentPassingScore(submission)
  const files = Array.isArray(submission.uploadedFiles) ? submission.uploadedFiles : []
  const canGrade = submission.status === 'submitted' || submission.status === 'graded'
  return <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}><div className="absolute inset-0 bg-black/30" /><div onClick={(event) => event.stopPropagation()} className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-[var(--card-background)]"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><div><h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Assignment Review</h2><p className="text-xs text-gray-500">#{submission.id}</p></div><button onClick={onClose} disabled={isSaving} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><XIcon className="h-5 w-5" /></button></div><div className="space-y-6 p-6"><div className="flex items-center justify-between"><StatusBadge status={submission.status} /><span className="text-sm text-gray-500">{formatDate(submission.submittedAt)}</span></div><div className="grid grid-cols-2 gap-4 border-y py-4 text-sm dark:border-[var(--card-border)]"><div><span className="text-gray-500">Trainee</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{traineeName(submission)}</p></div><div><span className="text-gray-500">Assignment</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{assignmentTitle(submission)}</p></div><div><span className="text-gray-500">Course</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{courseTitle(submission)}</p></div><div><span className="text-gray-500">Score</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{submission.score !== undefined ? `${submission.score} / ${maxScore}` : 'Not graded'}</p></div><div><span className="text-gray-500">Passing score</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{passingScore}</p></div><div><span className="text-gray-500">Graded</span><p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{formatDate(submission.gradedAt)}</p></div></div><section><h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">Submitted Text</h3><div className="min-h-20 whitespace-pre-wrap rounded-lg border bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">{extractText(submission.submittedText) || 'No written response.'}</div></section>{files.length > 0 && <section><h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">Uploaded Files ({files.length})</h3><div className="space-y-2">{files.map((file, index) => { const url = mediaUrl(file); const objectFile = typeof file === 'object' ? file : null; return <div key={objectFile?.id || index} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 dark:border-gray-700"><div className="flex min-w-0 items-center gap-2"><FileIcon className="h-4 w-4 shrink-0 text-gray-400" /><div className="min-w-0"><p className="truncate text-sm text-gray-900 dark:text-gray-100">{objectFile?.filename || `File #${file}`}</p>{objectFile?.filesize && <p className="text-xs text-gray-500">{(objectFile.filesize / 1024).toFixed(1)} KB</p>}</div></div>{url && <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700">Download</a>}</div> })}</div></section>}{submission.feedback && <section><h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">Existing Feedback</h3><p className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300">{extractText(submission.feedback)}</p></section>}{canGrade && <section className="border-t pt-5 dark:border-[var(--card-border)]"><h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">Grade Submission</h3>{actionError && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}<div className="mb-4"><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Score (0–{maxScore})</label><input type="number" min="0" max={maxScore} step="0.01" value={score} onChange={(event) => onScoreChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div><div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</label><textarea rows={5} value={feedback} onChange={(event) => onFeedbackChange(event.target.value)} placeholder="Share feedback with the trainee..." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100" /></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><button onClick={() => onGrade('returned_for_revision')} disabled={isSaving} className="flex-1 rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">{isSaving ? 'Saving...' : 'Return for Revision'}</button><button onClick={() => onGrade('graded')} disabled={isSaving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isSaving ? 'Saving...' : submission.status === 'graded' ? 'Save Regrade' : 'Mark as Graded'}</button></div></section>}{submission.status === 'draft' && <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800/50">Draft submissions cannot be graded until the trainee submits the assignment.</p>}{submission.status === 'returned_for_revision' && <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800/50">This is a historical returned submission. Grade the trainee&apos;s new submission instead.</p>}<button onClick={onClose} disabled={isSaving} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button></div></div></div>
}
