'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { EligibleEnrollment } from '@encreasl/cms-types'
import { getEligibleEnrollments } from './actions'

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const FileCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
)
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)
const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
)
const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
)
const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
)
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
)
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
)
const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
)

const ISSUANCE_STEPS = [
  { title: 'Validation', desc: 'Checks if the student passed and has no existing certificate.' },
  { title: 'Generation', desc: 'Creates a PDF using the assigned template and student data.' },
  { title: 'Storage', desc: 'Saves the certificate record and PDF file to the database.' },
  { title: 'Notification', desc: 'Updates the enrollment status to "Certificate Issued".' },
]

export default function CertificateIssuancePage() {
  const [enrollments, setEnrollments] = useState<EligibleEnrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<EligibleEnrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('Processing...')

  const comboboxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevQueryRef = useRef(query)

  const load = useCallback(async (search?: string) => {
    if (search === undefined) {
      setIsLoading(true)
    } else {
      setIsSearching(true)
    }
    try {
      setError(null)
      setEnrollments(await getEligibleEnrollments(search ? { search } : {}))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load eligible enrollments')
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (prevQueryRef.current === query) return
    prevQueryRef.current = query
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, load])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (enrollment: EligibleEnrollment) => {
    if (!enrollment.hasTemplate) return
    setSelectedId(String(enrollment.id))
    setSelectedEnrollment(enrollment)
    setQuery(`${enrollment.studentName} — ${enrollment.courseTitle}`)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedId('')
    setSelectedEnrollment(null)
    setQuery('')
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEnrollment) return

    setIsSubmitting(true)
    setMessage(null)
    setProgress(0)
    setProgressMessage('Initiating...')

    try {
      if (!selectedEnrollment.hasTemplate) {
        throw new Error('This course does not have a Certificate Template assigned.')
      }

      const response = await fetch('/api/proxy-issuance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: selectedEnrollment.id }),
      })

      if (!response.body) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error || 'No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value, { stream: true })
        const lines = chunkValue.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          let data: any = null
          try {
            data = JSON.parse(line)
          } catch {
            continue
          }

          if (data.error) {
            throw new Error(data.message || 'Server error occurred')
          }

          if (data.progress != null) {
            flushSync(() => {
              setProgress(data.progress)
              if (data.message) setProgressMessage(data.message)
            })
          }

          if (data.success) {
            setMessage({ type: 'success', text: 'Certificate successfully issued!' })
            setSelectedId('')
            setSelectedEnrollment(null)
            setQuery('')
            load()
          }
        }
      }
    } catch (err) {
      setProgress(0)
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred during issuance.' })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => {
        if (progress >= 100) setProgress(0)
      }, 3000)
    }
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between dark:border-[var(--card-border)]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Certificate Issuance</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Manually verify and issue certificates for completed enrollments in your courses.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <ShieldCheckIcon className="h-5 w-5" />
          System Ready
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/60 p-4 dark:border-[var(--card-border)] dark:bg-gray-800/50">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                <FileCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Issuance Details
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? 'Loading...' : `${enrollments.length} eligible enrollment${enrollments.length !== 1 ? 's' : ''} found`}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {message && (
                <div className={`mb-8 flex items-start gap-3 rounded-lg border p-4 shadow-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                  {message.type === 'success' ? <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" /> : <AlertCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />}
                  <div className="text-sm font-medium">{message.text}</div>
                </div>
              )}

              {error && !isLoading && (
                <div className="mb-8 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Failed to load eligible enrollments</div>
                    <div className="text-xs mt-1">{error}</div>
                    <button onClick={() => load()} className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label htmlFor="enrollment-combobox" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Select Eligible Course Enrollment
                  </label>

                  <div className="relative" ref={comboboxRef}>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        ref={inputRef}
                        id="enrollment-combobox"
                        type="text"
                        className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-base text-gray-900 shadow-sm placeholder-gray-500 transition duration-150 ease-in-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[var(--card-background)] dark:text-gray-100 dark:placeholder:text-gray-400"
                        placeholder="Search by student name or course title..."
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value)
                          setIsOpen(true)
                          if (event.target.value === '') setSelectedId('')
                        }}
                        onFocus={() => setIsOpen(true)}
                        autoComplete="off"
                        disabled={isSubmitting}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {selectedId ? (
                          <div onClick={handleClear} className="cursor-pointer">
                            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setIsOpen(!isOpen)
                              if (!isOpen) inputRef.current?.focus()
                            }}
                          >
                            <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
                          </div>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-[var(--card-background)] dark:ring-gray-600 sm:text-sm">
                        {isLoading || isSearching ? (
                          <div className="flex cursor-default items-center justify-center px-4 py-4 text-gray-500 dark:text-gray-400">
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500 dark:border-gray-400"></div>
                            Loading...
                          </div>
                        ) : enrollments.length === 0 ? (
                          <div className="cursor-default px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                            {isSearching ? 'Searching...' : query.trim() ? 'No enrollments match your search.' : 'No eligible enrollments found.'}
                          </div>
                        ) : (
                          enrollments.map((enrollment) => {
                            const isSelected = selectedId === String(enrollment.id)
                            return (
                              <div
                                key={enrollment.id}
                                className={`relative cursor-pointer select-none border-b border-gray-50 py-3 pl-4 pr-9 last:border-0 dark:border-gray-800 ${enrollment.hasTemplate ? 'text-gray-900 hover:bg-blue-50 dark:text-gray-100 dark:hover:bg-blue-900/20' : 'cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600'}`}
                                onClick={() => enrollment.hasTemplate ? handleSelect(enrollment) : null}
                              >
                                <div className="flex flex-col">
                                  <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                                    {enrollment.studentName} — {enrollment.courseTitle}
                                  </span>
                                  {!enrollment.hasTemplate && (
                                    <span className="mt-0.5 text-xs italic text-red-400 dark:text-red-500">
                                      (No Template Assigned)
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                                    <CheckIcon className="h-5 w-5" />
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
                    Type to search, then click to select.
                  </p>
                </div>

                <div className="flex items-center justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedEnrollment || enrollments.length === 0}
                    className="inline-flex items-center rounded-xl border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-3 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-5 w-5" />
                        Issue Certificate Now
                      </>
                    )}
                  </button>
                </div>
                {isSubmitting && (
                  <div className="mt-4">
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">{Math.round(progress)}% — {progressMessage}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedEnrollment && (
            <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm ring-4 ring-blue-50/50 dark:border-blue-800 dark:bg-[var(--card-background)] dark:ring-blue-900/20">
              <div className="border-b border-blue-100 bg-blue-50/80 p-4 dark:border-blue-800 dark:bg-blue-900/30">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300">Selection Summary</h3>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Student</label>
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    {selectedEnrollment.studentName}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Course</label>
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedEnrollment.courseTitle}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Completion Date</label>
                  <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {selectedEnrollment.completedAt ? new Date(selectedEnrollment.completedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <CheckCircleIcon className="h-4 w-4" />
                  Ready for issuance
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
            <div className="border-b border-gray-200 bg-gray-50/30 p-5 dark:border-[var(--card-border)] dark:bg-gray-800/30">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Issuance Process</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {ISSUANCE_STEPS.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Certificates are issued only for enrollments in your own courses and only when the course has a certificate template assigned.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}