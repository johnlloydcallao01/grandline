'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import { getMyCourseCategories } from './actions'
import type {
  CategoryStats,
  InstructorCategoryDoc,
} from '@encreasl/cms-types'

const Link = NextLink as any

const ITEMS_PER_PAGE = 12

// Inline SVG icons (matching web-instructor pattern)
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
)
const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
)
const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
)
const LayersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></svg>
)
const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
)
const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
)

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'course', label: 'Course' },
  { value: 'skill', label: 'Skill' },
  { value: 'topic', label: 'Topic' },
  { value: 'industry', label: 'Industry' },
]

const TYPE_COLORS: Record<string, string> = {
  course: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  skill: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  topic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  industry: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
}

const TYPE_LABELS: Record<string, string> = {
  course: 'Course',
  skill: 'Skill',
  topic: 'Topic',
  industry: 'Industry',
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  draft: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

function CategorySwatch({ color, name }: { color?: string; name: string }) {
  const style = color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
    ? { backgroundColor: color }
    : undefined
  return (
    <span
      className="h-6 w-6 shrink-0 rounded-md border border-gray-200 dark:border-gray-700"
      style={style}
      title={color || name}
      aria-label={color || name}
    />
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<InstructorCategoryDoc[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getMyCourseCategories({
        search: debouncedSearch || undefined,
        categoryType: typeFilter || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      })
      setCategories(data.docs || [])
      setStats(data.stats)
      setTotalDocs(data.totalDocs || 0)
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, typeFilter, currentPage])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter])

  const metricCards = [
    { label: 'Categories Used', value: stats?.totalCategories ?? 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: FolderIcon },
    { label: 'Categorized Courses', value: stats?.categorizedCourses ?? 0, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: BookIcon },
    { label: 'Uncategorized', value: stats?.uncategorizedCourses ?? 0, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: AlertCircleIcon },
    { label: 'Courses / Category', value: stats?.coursesPerCategory ?? 0, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: GridIcon },
  ]

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <FolderIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load categories</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={loadCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Browse the categories used across your courses</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading || !stats ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" /></div>
                  <div><div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          metricCards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[var(--card-background)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-6 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" />
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24 mb-3" />
              <div className="space-y-2">
                {[1, 2].map(j => (
                  <div key={j} className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No categories found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {debouncedSearch || typeFilter
              ? 'No categories match your search criteria. Try adjusting the filters.'
              : 'Your courses are not organized into categories yet. Categories are managed by your administrators.'}
          </p>
        </div>
      ) : (
        <>
          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategorySwatch color={category.colorCode} name={category.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{category.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                        {category.slug ? `/${category.slug}` : `#${category.id}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0 ${TYPE_COLORS[category.categoryType] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {TYPE_LABELS[category.categoryType] || category.categoryType}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <LayersIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                  <span>{category.courseCount} course{category.courseCount !== 1 ? 's' : ''}</span>
                  {!category.isActive && (
                    <span className="ml-auto rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">Inactive</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {category.courses.slice(0, 5).map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}/edit` as any}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/course">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover/course:text-blue-600 dark:group-hover/course:text-blue-400">
                        {course.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${STATUS_COLORS[course.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        {course.status}
                      </span>
                    </Link>
                  ))}
                  {category.courses.length > 5 && (
                    <p className="px-2 pt-1 text-xs text-gray-400 dark:text-gray-500">
                      +{category.courses.length - 5} more course{category.courses.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm px-4 py-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, totalDocs)} of {totalDocs}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      {pageNum}
                    </button>
                  )
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}