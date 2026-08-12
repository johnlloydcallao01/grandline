'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SearchResult } from '@encreasl/ui/search'

const ENTITY_ICONS: Record<string, string> = {
  user: 'fa-user',
  course: 'fa-book',
  announcement: 'fa-bullhorn',
  post: 'fa-newspaper',
  certificate: 'fa-certificate',
  category: 'fa-folder',
  instructor: 'fa-chalkboard-teacher',
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawQuery = searchParams.get('search_query') || ''
  const searchQuery = rawQuery.trim()

  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState(searchQuery)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const normalized = searchQuery.toLowerCase().replace(/\s+/g, ' ')

    if (normalized.length < 2) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const run = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const resp = await fetch(
          `/api/search?q=${encodeURIComponent(normalized)}&limit=50`,
        )
        if (!resp.ok) throw new Error('Search failed')
        const json = await resp.json()
        if (cancelled) return
        const data: SearchResult[] = json.results || []
        setResults(data)
      } catch {
        if (cancelled) return
        setError('Search failed')
        setResults([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  const hasValidQuery = searchQuery.trim().length >= 2

  return (
    <div className="min-h-screen bg-[var(--background)] pb-[15px]">
      <div className="md:px-[10px] px-[10px] md:pt-2 pt-2 md:pb-4 pb-4 lg:hidden sticky top-0 z-30 bg-[var(--background)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--card-background)] shadow-sm border border-[var(--card-border)]"
            aria-label="Back"
          >
            <i className="fa fa-arrow-left text-gray-700 dark:text-gray-300"></i>
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="flex-1 flex items-center gap-2"
          >
            <div className="flex-1 flex items-center bg-[var(--card-background)] rounded-full shadow-sm border border-[var(--card-border)] px-3 py-1.5">
              <input
                type="text"
                value={inputValue}
                readOnly
                className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="w-full pt-[10px] px-[10px]">
        <div className="bg-[var(--card-background)] rounded-lg shadow border border-[var(--card-border)]">
          {isLoading ? (
            <div className="divide-y divide-[var(--card-border)]">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-800 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-gray-700 dark:text-gray-300">{error}</div>
          ) : results.length === 0 && hasValidQuery ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <i className="fa fa-search"></i>
              </div>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                No results found
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Try different keywords.
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-[var(--card-border)]">
              {results.map((r) => {
                const icon = ENTITY_ICONS[r.type] || 'fa-file'
                const isExternal = r.href.startsWith('http')
                const Wrapper = isExternal ? 'a' : Link
                const wrapperProps = isExternal
                  ? { href: r.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: r.href as any }

                return (
                  <Wrapper
                    key={`${r.type}-${r.id}`}
                    {...wrapperProps}
                    className="px-2.5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[var(--muted)] flex-shrink-0">
                      <i className={`fa ${icon}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {r.title}
                      </h3>
                      {r.subtitle && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {r.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 capitalize flex-shrink-0 hidden sm:inline">
                      {r.type}
                    </span>
                    <i className="fa fa-chevron-right text-gray-400 dark:text-gray-500 flex-shrink-0"></i>
                  </Wrapper>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
