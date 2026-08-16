'use client'

import React, { useCallback, useEffect, useState } from 'react'
import NextLink from 'next/link'
import {
  getGradeSetupReference,
  type GradeSetupData,
} from './actions'

const Link = NextLink as any

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
)
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
)
const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
)
const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" /></svg>
)
const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
)

export default function GradeSetupPage() {
  const [data, setData] = useState<GradeSetupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setData(await getGradeSetupReference())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grade scales')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const summary = data?.summary

  if (error) {
    return <div className="flex min-h-[400px] items-center justify-center p-6"><div className="text-center"><SettingsIcon className="mx-auto mb-4 h-12 w-12 text-red-400" /><p className="mb-2 font-medium text-gray-900 dark:text-gray-100">Failed to load grade setup</p><p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{error}</p><button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button></div></div>
  }

  const metricCards = [
    { label: 'Institution Scales', value: summary?.totalScales ?? '—', icon: <TagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Used by My Courses', value: summary?.usedByMyCourses ?? '—', icon: <BookIcon className="h-5 w-5 text-green-600 dark:text-green-400" />, color: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Course References', value: summary?.courseReferences ?? '—', icon: <SettingsIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Unused by My Courses', value: summary?.unusedByMyCourses ?? '—', icon: <TagIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-50 dark:bg-amber-950/30' },
  ]

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-3">
        <Link href="/gradebook" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><BackIcon className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grade Setup</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Grade scales are managed by the institution. View the mapping used by your courses</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-800 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Grade scales are institution-wide configuration managed by administrators. Instructors can view the grade bands and which of their courses reference each scale, but cannot create, edit, or delete them.</p>
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

      {isLoading ? (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}</div>
      ) : !data || data.scales.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]"><SettingsIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" /><h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">No grade scales defined</h3><p className="text-sm text-gray-500 dark:text-gray-400">The institution has not configured any grade scales yet.</p></div>
      ) : (
        <div className="space-y-6">
          {data.scales.map((scale) => (
            <div key={scale.id} className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--card-border)] dark:bg-[var(--card-background)]">
              <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-[var(--card-border)]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/30"><SettingsIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                    <h2 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">{scale.title}</h2>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{scale.description || 'No description'}</p>
                </div>
                <span className={`inline-flex shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-medium ${scale.usedByCourses.length > 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{scale.usedByCourses.length > 0 ? `${scale.usedByCourses.length} of your course${scale.usedByCourses.length > 1 ? 's' : ''} use this scale` : 'Not used by your courses'}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]"><thead><tr className="border-b border-gray-200 bg-gray-50/60 dark:border-[var(--card-border)] dark:bg-gray-800/50"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Grade</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Range</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">GPA</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{scale.grades.map((grade, index) => <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-3"><span className="inline-flex rounded-md border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 dark:border-purple-800/50 dark:bg-purple-900/30 dark:text-purple-300">{grade.label}</span></td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{grade.minScore}% – {grade.maxScore}%</td><td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{grade.gpaValue != null ? grade.gpaValue.toFixed(1) : '—'}</td><td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{grade.description || '—'}</td></tr>)}</tbody></table>
              </div>

              {scale.usedByCourses.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 bg-gray-50/40 px-5 py-3 dark:border-[var(--card-border)] dark:bg-gray-800/20">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Used by your courses:</span>
                  {scale.usedByCourses.map((course) => (
                    <span key={course.id} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-[var(--card-background)] dark:text-gray-300 dark:ring-gray-700"><BookIcon className="h-3 w-3 text-blue-500" />{course.title}{course.code ? ` (${course.code})` : ''}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}