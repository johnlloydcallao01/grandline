'use client'

import React, { useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchProvider, useSearch } from '@/contexts/SearchContext'
import { DesktopSearchDropdown } from '@/components/search/DesktopSearchDropdown'
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay'

function ResultsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const searchQuery = searchParams.get('search_query') || ''
    const searchRef = useRef<HTMLFormElement>(null)
    const {
        query,
        setQuery,
        search,
        results,
        isLoading,
        lastCompletedKey,
        error,
        getSuggestions,
        setTyping,
        persistRecentKeyword,
        setDropdownOpen,
        setOverlayOpen,
        setMode,
        loadRecentKeywords,
        saveRecentKeyword,
    } = useSearch()

    const normalizedQueryParam = searchQuery.trim().toLowerCase().replace(/\s+/g, ' ')
    const hasValidQueryParam = normalizedQueryParam.length >= 2
    const queryParamKey = hasValidQueryParam ? `q:${normalizedQueryParam}` : ''
    const isProcessing = hasValidQueryParam && (isLoading || lastCompletedKey !== queryParamKey)

    useEffect(() => {
        // Trigger search whenever URL query changes
        if (searchQuery) {
            setQuery(searchQuery)
            const performSearch = async () => {
                await persistRecentKeyword(searchQuery)
                await search(searchQuery)
            }
            performSearch()
        }
    }, [searchQuery]) // Only searchQuery dependency to avoid loops

    // Handle click outside and keyboard events (same as Header)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setDropdownOpen(false)
                if (query.trim().length === 0) setMode('suggestions')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [query, setDropdownOpen, setMode])


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        const v = query.trim()
        setTyping(false)
        if (v.length < 2) {
            setDropdownOpen(true)
            setMode('suggestions')
            loadRecentKeywords()
            return
        }
        saveRecentKeyword(query)
        await persistRecentKeyword(v)
        setDropdownOpen(false)
        router.push(`/results?search_query=${encodeURIComponent(v)}` as any)
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">

                {/* Desktop Search Form with inline Back button (hidden on mobile) */}
                <div className="hidden lg:flex items-center gap-3 w-full px-2.5 pt-4 mb-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Back"
                    >
                        <i className="fa fa-arrow-left"></i>
                    </button>
                    <form ref={searchRef} onSubmit={handleSearch} className="flex-1 flex">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search"
                                value={query}
                                onFocus={() => {
                                    setTyping(false)
                                    setDropdownOpen(true)
                                    const hasQuery = query.trim().length > 0
                                    loadRecentKeywords()
                                    setMode('suggestions')
                                    if (hasQuery) {
                                        getSuggestions(query)
                                    }
                                }}
                                onChange={e => {
                                    const v = e.target.value
                                    setQuery(v)
                                    setTyping(true)
                                    getSuggestions(v)
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] text-gray-900 placeholder-gray-500"
                            />
                            {query.trim().length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => { setQuery(''); setMode('suggestions'); loadRecentKeywords(); setTyping(false); setDropdownOpen(true) }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                                    aria-label="Clear"
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            )}
                            <DesktopSearchDropdown />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 text-gray-700 focus:outline-none" aria-label="Search">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    </form>
                </div>

                {/* Mobile Search Form (visible on mobile only) */}
                <div className="lg:hidden">
                    <div className="px-2.5 py-3 flex items-center gap-2 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center"
                        >
                            <i className="fa fa-arrow-left"></i>
                        </button>
                        <div
                            className="relative flex-1 cursor-pointer"
                            onClick={() => { setOverlayOpen(true); loadRecentKeywords(); }}
                        >
                            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search courses"
                                value={query}
                                readOnly
                                className="w-full h-10 border border-gray-300 rounded-md pl-10 pr-10 focus:outline-none cursor-pointer"
                            />
                            {query.trim().length > 0 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setQuery('');
                                        setOverlayOpen(true);
                                        loadRecentKeywords();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-400 text-white hover:bg-gray-500 flex items-center justify-center"
                                    aria-label="Clear"
                                >
                                    <i className="fa fa-times text-xs"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <MobileSearchOverlay />


                {/* Results List */}
                <div className="bg-white rounded-lg shadow">
                    {isProcessing ? (
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
                    ) : error ? (
                        <div className="p-6 text-sm text-gray-700">
                            {error}
                        </div>
                    ) : results.length === 0 && hasValidQueryParam ? (
                        <div className="p-10 text-center">
                            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <i className="fa fa-search"></i>
                            </div>
                            <div className="text-base font-medium text-gray-900">No results found</div>
                            <div className="mt-1 text-sm text-gray-600">Try different keywords.</div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {results.map(r => (
                                <Link
                                    key={r.id}
                                    href={r.href as any}
                                    className="px-2.5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
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
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div >
        </div >
    )
}

export default function ResultsPage() {
    return (
        <SearchProvider>
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-4xl mx-auto">
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
