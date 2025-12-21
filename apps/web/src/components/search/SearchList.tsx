'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/hooks/useSearch'

export function SearchList(): React.ReactNode {
    const router = useRouter()
    const {
        mode,
        suggestions,
        query,
        setQuery,
        setMode,
        recentKeywords,
        persistRecentKeyword,
        setTyping,
        isRecentLoading,
        setDropdownOpen,
        setOverlayOpen,
        search,
    } = useSearch()

    return (
        <div>
            {mode === 'suggestions' ? (
                <div>
                    {recentKeywords.length > 0 && query.trim().length === 0 && (
                        <div className="border-b border-gray-100">
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="text-xs font-medium text-gray-600">Recent searches</div>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {recentKeywords.map((kw, idx) => (
                                    <li key={`${kw}-${idx}`} className="p-3 hover:bg-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Close UI immediately to prevent flash
                                                setDropdownOpen(false)
                                                setOverlayOpen(false)
                                                // Update search input instantly
                                                setQuery(kw)
                                                // Set mode to results (not suggestions)
                                                setMode('results')
                                                setTyping(false)

                                                // Check if already on results page
                                                if (window.location.pathname === '/results') {
                                                    // Trigger search directly instead of navigating
                                                    search(kw)
                                                } else {
                                                    // Navigate to results page
                                                    router.push(`/results?search_query=${encodeURIComponent(kw)}` as any)
                                                }

                                                // Persist in background
                                                persistRecentKeyword(kw)
                                            }}
                                            className="flex items-center gap-3 w-full text-left"
                                        >
                                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                <i className="fa fa-search"></i>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{kw}</div>
                                                <div className="text-xs text-gray-600 truncate">Keyword</div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {query.trim().length === 0 ? (
                        recentKeywords.length === 0 ? (
                            isRecentLoading ? (
                                <ul className="divide-y divide-gray-100">
                                    {Array.from({ length: 4 }).map((_, idx) => (
                                        <li key={idx} className="p-3">
                                            <div className="flex items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 rounded-md bg-gray-200"></div>
                                                <div className="flex-1">
                                                    <div className="h-3 w-40 bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-sm text-gray-600">No recent searches</div>
                            )
                        ) : null
                    ) : (
                        suggestions.length === 0 ? (
                            <div className="p-4 text-sm text-gray-600">No suggestions</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {suggestions.map((s, idx) => (
                                    <li key={`${s.label}-${idx}`} className="p-3 hover:bg-gray-50">
                                        <button type="button" onClick={() => {
                                            // Close UI immediately to prevent flash
                                            setDropdownOpen(false)
                                            setOverlayOpen(false)
                                            // Update search input instantly
                                            setQuery(s.label)
                                            // Set mode to results (not suggestions)
                                            setMode('results')
                                            setTyping(false)

                                            // Check if already on results page
                                            if (window.location.pathname === '/results') {
                                                // Trigger search directly instead of navigating
                                                search(s.label)
                                            } else {
                                                // Navigate to results page
                                                router.push(`/results?search_query=${encodeURIComponent(s.label)}` as any)
                                            }

                                            // Persist in background
                                            persistRecentKeyword(s.label)
                                        }} className="flex items-center gap-3 w-full text-left">
                                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                <i className={`fa ${s.kind === 'category' ? 'fa-folder' : 'fa-book'}`}></i>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{s.label}</div>
                                                <div className="text-xs text-gray-600 truncate">{s.kind === 'category' ? 'Category' : 'Course'}</div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
                </div>
            ) : null}
        </div>
    )
}
