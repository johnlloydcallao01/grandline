'use client'

import React, { useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchProvider, useSearch } from '@/contexts/SearchContext'

function ResultsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const searchQuery = searchParams.get('search_query') || ''
    const {
        query,
        setQuery,
        search,
        results,
        isLoading,
        getSuggestions,
        setTyping,
        persistRecentKeyword,
    } = useSearch()
    const hasSearched = useRef(false)

    useEffect(() => {
        if (searchQuery && !hasSearched.current) {
            setQuery(searchQuery)
            // Check if it's a category search or regular search
            const performSearch = async () => {
                await persistRecentKeyword(searchQuery)
                await search(searchQuery)
            }
            performSearch()
            hasSearched.current = true
        }
    }, [searchQuery])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        const v = query.trim()
        if (v.length < 2) return

        await persistRecentKeyword(v)
        router.push(`/results?search_query=${encodeURIComponent(v)}` as any)
        hasSearched.current = false
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">



                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="p-3 flex items-center gap-2 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center"
                        >
                            <i className="fa fa-arrow-left"></i>
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search courses"
                                value={query}
                                onChange={e => {
                                    const v = e.target.value
                                    setQuery(v)
                                    setTyping(true)
                                    getSuggestions(v)
                                }}
                                className="w-full h-10 border border-gray-300 rounded-md pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c]"
                            />
                            {query.trim().length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                                    aria-label="Clear"
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Results Header */}
                {searchQuery && (
                    <div className="mb-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Results for "{searchQuery}"
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {isLoading ? 'Searching...' : `${results.length} course${results.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>
                )}

                {/* Results List */}
                <div className="bg-white rounded-lg shadow">
                    {(isLoading || (searchQuery && !hasSearched.current)) ? (
                        <div className="divide-y divide-gray-100">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="flex items-center gap-4 animate-pulse">
                                        <div className="w-20 h-20 rounded-md bg-gray-200 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center">
                            <i className="fa fa-search text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray-600">No courses found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {results.map(r => (
                                <a
                                    key={r.id}
                                    href={r.href}
                                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                                >
                                    {r.thumbnail ? (
                                        <img
                                            src={r.thumbnail}
                                            alt=""
                                            className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                            <i className="fa fa-book text-gray-400 text-2xl"></i>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-medium text-gray-900 group-hover:text-[#201a7c] transition-colors truncate">
                                            {r.title}
                                        </h3>
                                        {r.subtitle && (
                                            <p className="text-sm text-gray-600 mt-1 truncate">{r.subtitle}</p>
                                        )}
                                    </div>
                                    <i className="fa fa-chevron-right text-gray-400 flex-shrink-0"></i>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResultsPage() {
    return (
        <SearchProvider>
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="bg-white rounded-lg shadow">
                            <div className="divide-y divide-gray-100">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <div key={idx} className="p-4">
                                        <div className="flex items-center gap-4 animate-pulse">
                                            <div className="w-20 h-20 rounded-md bg-gray-200 flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            }>
                <ResultsPageContent />
            </Suspense>
        </SearchProvider>
    )
}
