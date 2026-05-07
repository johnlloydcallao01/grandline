'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SearchResult } from '@/types/search'
import { useUser } from '@/hooks/useAuth'

export default function ResultsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const rawQuery = searchParams.get('search_query') || ''
    const searchQuery = rawQuery.trim()
    const { user } = useUser()

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

                if (user && user.role === 'trainee') {
                    try {
                        await fetch('/api/search/recent', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ keyword: searchQuery, userId: user.id }),
                        })
                    } catch {
                        void 0
                    }
                }

                const resp = await fetch(`/api/search?q=${encodeURIComponent(normalized)}&limit=50`)
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
    }, [searchQuery, user])

    const hasValidQuery = searchQuery.trim().length >= 2

    const openSearchOverlay = (options?: { clearQuery?: boolean }) => {
        if (typeof window === 'undefined') return
        const detail = { clearQuery: !!options?.clearQuery }
        window.dispatchEvent(new CustomEvent('gl:open-search-overlay', { detail }))
    }

    return (
        <div className="min-h-screen bg-[var(--background)] pb-[15px]">
            {/* Mobile / Tablet header */}
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
                        onSubmit={e => {
                            e.preventDefault()
                            openSearchOverlay()
                        }}
                        className="flex-1 flex items-center gap-2"
                    >
                        <div
                            className="flex-1 flex items-center bg-[var(--card-background)] rounded-full shadow-sm border border-[var(--card-border)] px-3 py-1.5 cursor-pointer"
                            onClick={() => openSearchOverlay()}
                        >
                            <input
                                type="text"
                                value={inputValue}
                                readOnly
                                className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Search"
                            />
                            {inputValue.trim().length > 0 && (
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation()
                                        openSearchOverlay({ clearQuery: true })
                                    }}
                                    className="ml-1 w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400"
                                    aria-label="Clear"
                                >
                                    <i className="fa fa-times text-sm"></i>
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--card-background)] shadow-sm border border-[var(--card-border)]"
                            aria-label="More options"
                        >
                            <i className="fa fa-ellipsis-v text-gray-800 dark:text-gray-200"></i>
                        </button>
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
                                        <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-gray-800 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-6 text-sm text-gray-700 dark:text-gray-300">
                            {error}
                        </div>
                    ) : results.length === 0 && hasValidQuery ? (
                        <div className="p-10 text-center">
                            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <i className="fa fa-search"></i>
                            </div>
                            <div className="text-base font-medium text-gray-900 dark:text-gray-100">No results found</div>
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Try different keywords.</div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="divide-y divide-[var(--card-border)]">
                            {results.map(r => (
                                <Link
                                    key={r.id}
                                    href={r.href as any}
                                    className="px-2.5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                >
                                    {r.thumbnail ? (
                                        <img
                                            src={r.thumbnail}
                                            alt=""
                                            className="w-20 h-20 rounded-md object-cover flex-shrink-0 border border-gray-100 dark:border-gray-800"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                            <i className="fa fa-book text-gray-400 dark:text-gray-500 text-2xl"></i>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#201a7c] dark:group-hover:text-[#5c54e0] transition-colors truncate">
                                            {r.title}
                                        </h3>
                                        {r.subtitle && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{r.subtitle}</p>
                                        )}
                                    </div>
                                    <i className="fa fa-chevron-right text-gray-400 dark:text-gray-500 flex-shrink-0"></i>
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
