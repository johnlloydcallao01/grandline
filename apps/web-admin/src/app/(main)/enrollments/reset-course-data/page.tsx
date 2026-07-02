'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  Search, Loader2, AlertTriangle, CheckCircle, User,
  BookOpen, Clock, Shield, FileText, FileCheck,
} from '@/components/ui/IconWrapper'
import { searchEnrollments, getEnrollmentProgress, type EnrollmentOption } from './actions'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const STEP_DEFS = [
  { key: 'submission-answers', label: 'Assessment answers', icon: FileText },
  { key: 'assessment-submissions', label: 'Assessment submissions', icon: FileCheck },
  { key: 'assignment-submissions', label: 'Assignment submissions', icon: FileText },
  { key: 'course-item-progress', label: 'Lesson progress', icon: BookOpen },
  { key: 'certificates', label: 'Certificates', icon: Shield },
  { key: 'enrollment', label: 'Reset enrollment', icon: Clock },
]

type StepState = 'pending' | 'active' | 'complete'

export default function ResetCourseDataPage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<EnrollmentOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<EnrollmentOption | null>(null)
  const [phase, setPhase] = useState<'search' | 'confirm' | 'executing' | 'done'>('search')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [progress, setProgress] = useState(0)
  const [currentLabel, setCurrentLabel] = useState('')
  const [stepStates, setStepStates] = useState<Record<string, StepState>>(
    Object.fromEntries(STEP_DEFS.map((s) => [s.key, 'pending' as StepState]))
  )
  const [stepProgress, setStepProgress] = useState<Record<string, { current: number; total: number }>>({})
  const [deletedCount, setDeletedCount] = useState(0)
  const [computedProgress, setComputedProgress] = useState<{ progressPercentage: number; completedItems: number; totalItems: number } | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (value.length < 1) { setResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const docs = await searchEnrollments(value)
        setResults(docs)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  const handleSelect = async (enrollment: EnrollmentOption) => {
    setSelected(enrollment)
    setErrorMsg(null)
    setPhase('confirm')
    setComputedProgress(null)
    const progress = await getEnrollmentProgress(enrollment.id)
    setComputedProgress(progress)
  }

  const handleReset = async () => {
    if (!selected) return
    setPhase('executing')
    setErrorMsg(null)
    setProgress(0)
    setCurrentLabel('Scanning records...')
    setStepStates(Object.fromEntries(STEP_DEFS.map((s) => [s.key, 'pending'])))
    setStepProgress({})
    setDeletedCount(0)

    try {
      const res = await fetch('/api/proxy-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: selected.id }),
      })

      if (!res.ok) {
        throw new Error(`Failed to start reset: ${res.statusText}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)
            if (data.error) throw new Error(data.error)

            switch (data.phase) {
              case 'scan':
                setCurrentLabel(data.label)
                break

              case 'step_skip':
                setStepStates((prev) => ({ ...prev, [data.stepKey]: 'complete' }))
                break

              case 'step_start':
                setStepStates((prev) => ({ ...prev, [data.stepKey]: 'active' }))
                setCurrentLabel(data.label)
                setProgress(data.progress || 0)
                setStepProgress((prev) => ({ ...prev, [data.stepKey]: { current: 0, total: data.total } }))
                break

              case 'step_progress':
                setProgress(data.progress || 0)
                setCurrentLabel(data.label)
                setStepProgress((prev) => ({
                  ...prev,
                  [data.stepKey]: { current: data.current, total: data.total },
                }))
                break

              case 'step_complete':
                setStepStates((prev) => ({ ...prev, [data.stepKey]: 'complete' }))
                setProgress(data.progress || 0)
                setStepProgress((prev) => {
                  const s = prev[data.stepKey]
                  return { ...prev, [data.stepKey]: { current: s?.total || 0, total: s?.total || 0 } }
                })
                break

              case 'done':
                setProgress(100)
                setCurrentLabel('Reset complete')
                setStepStates(Object.fromEntries(STEP_DEFS.map((s) => [s.key, 'complete'])))
                setDeletedCount(data.deleted || 0)
                setPhase('done')
                break
            }
          } catch (parseErr: any) {
            if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr
          }
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to reset enrollment')
      setPhase('confirm')
    }
  }

  const handleNewReset = () => {
    setSelected(null)
    setSearch('')
    setResults([])
    setErrorMsg(null)
    setProgress(0)
    setCurrentLabel('')
    setStepStates(Object.fromEntries(STEP_DEFS.map((s) => [s.key, 'pending'])))
    setPhase('search')
  }

  const getStudentName = (e: EnrollmentOption) => {
    const u = e.student?.user
    if (!u) return '\u2014'
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '\u2014'
  }

  const getStudentEmail = (e: EnrollmentOption) => e.student?.user?.email || '\u2014'
  const getCourseTitle = (e: EnrollmentOption) => e.course?.title || '\u2014'

  const resetSummaryItems = [
    { icon: BookOpen, label: 'Lesson & item progress', description: 'All module lesson completions, quiz answers, and per-item progress records' },
    { icon: FileCheck, label: 'Assessment submissions & answers', description: 'All quiz and exam attempts, scores, and submitted answers' },
    { icon: FileText, label: 'Assignment submissions', description: 'All submitted assignments, uploaded files, grades, and feedback' },
    { icon: Shield, label: 'Certificates', description: 'Any issued certificate for this enrollment will be deleted' },
    { icon: User, label: 'Enrollment status reset', description: 'Status reset to Active, progress set to 0%, all grades and evaluation cleared' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reset Course Data</h1>
        <p className="text-gray-600 mt-1">Clear all progress, submissions, and grades for an enrollment</p>
      </div>

      {errorMsg && (
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-700 underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {phase === 'search' && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Find Enrollment</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by student name, email, or course title..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-white shadow-sm max-h-80 overflow-y-auto">
                {results.map((enrollment) => (
                  <button
                    key={enrollment.id}
                    onClick={() => handleSelect(enrollment)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{getStudentName(enrollment)}</p>
                      <p className="text-xs text-gray-500 truncate">{getStudentEmail(enrollment)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">{getCourseTitle(enrollment)}</p>
                      <p className="text-xs text-gray-500">{formatDate(enrollment.enrolledAt)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                        {enrollment.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {search.length >= 1 && !isSearching && results.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">No enrollments found matching &quot;{search}&quot;</p>
            )}
          </div>
        </div>
      )}

      {phase === 'confirm' && selected && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Confirm Reset</h2>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{getStudentName(selected)}</p>
                <p className="text-xs text-gray-500">{getStudentEmail(selected)}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">{getCourseTitle(selected)}</p>
                <p className="text-xs text-gray-500">Enrolled {formatDate(selected.enrolledAt)}{computedProgress ? ` \u00b7 ${computedProgress.progressPercentage}% progress` : ''}</p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">This action cannot be undone</p>
                  <p className="mt-1">All progress, submissions, grades, and certificates for this enrollment will be permanently deleted. The enrollment will be reset to active with 0% progress.</p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-3">The following will be cleared:</h3>
            <div className="space-y-2">
              {resetSummaryItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <item.icon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => { setSelected(null); setPhase('search') }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Reset Course Data
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'executing' && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Resetting Course Data</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
                <span className="text-sm font-semibold text-blue-600 tabular-nums">{progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              {STEP_DEFS.map((s) => {
                const state = stepStates[s.key] || 'pending'
                const sp = stepProgress[s.key]
                const isComplete = state === 'complete'
                const isActive = state === 'active'

                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      isComplete ? 'bg-green-50' : isActive ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {isComplete ? (
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
                    )}
                    <s.icon className={`h-4 w-4 shrink-0 ${isComplete ? 'text-green-600' : isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-sm flex-1 ${isComplete ? 'text-green-700 font-medium' : isActive ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                    {sp && (
                      <span className="text-xs text-gray-400 tabular-nums">
                        {sp.current}/{sp.total}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && selected && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Reset Complete</h3>
              <p className="text-sm text-green-700 mt-1">
                Successfully deleted {deletedCount} progress record{deletedCount !== 1 ? 's' : ''} and reset the enrollment.
              </p>
              <div className="mt-4 rounded-lg bg-white border border-green-200 px-4 py-3 text-left w-full max-w-sm">
                <p className="text-sm font-medium text-gray-900">{getStudentName(selected)}</p>
                <p className="text-xs text-gray-500">{getCourseTitle(selected)}</p>
                <p className="text-xs text-green-600 mt-1">Status: Active &middot; Progress: 0%</p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleNewReset}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Reset Another Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
