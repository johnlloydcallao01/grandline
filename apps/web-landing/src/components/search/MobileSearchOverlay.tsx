'use client'

import React, { useEffect, useRef } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { SearchList } from './SearchList'

export function MobileSearchOverlay(): React.ReactNode {
    const {
        isOverlayOpen,
        setOverlayOpen,
        query,
        setQuery,
        getSuggestions,
        setMode,
        loadRecentKeywords,
        persistRecentKeyword,
        setTyping,
    } = useSearch()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOverlayOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 50)
            return () => clearTimeout(t)
        }
    }, [isOverlayOpen])

    useEffect(() => {
        if (!isOverlayOpen) {
            setTyping(false)
            return
        }

        loadRecentKeywords()

        const v = query.trim()
        if (v.length > 0) {
            setTyping(true)
            getSuggestions(v)
        } else {
            setTyping(false)
            setMode('suggestions')
        }
    }, [isOverlayOpen])

    if (!isOverlayOpen) return null

    return (
        <>
            {/* Backdrop - only on desktop */}
            <div className="hidden md:block fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm" onClick={() => { setTyping(false); setOverlayOpen(false) }}></div>

            {/* Search Modal */}
            <div className="fixed inset-0 md:inset-auto md:top-[20%] md:left-1/2 md:-translate-x-1/2 z-[1001] bg-white md:rounded-xl md:shadow-2xl md:w-[90%] md:max-w-2xl md:max-h-[70vh] flex flex-col overflow-hidden">
                <div className="p-3 md:p-4 flex items-center gap-2 border-b border-gray-200">
                    <button
                        onClick={() => { setTyping(false); setOverlayOpen(false) }}
                        className="w-8 h-8 rounded-full bg-white md:bg-gray-100 border md:border-0 shadow-md md:shadow-none flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <i className="fa fa-arrow-left text-gray-900"></i>
                    </button>
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => {
                                const v = e.target.value
                                setQuery(v)
                                setTyping(true)
                                getSuggestions(v)
                            }}
                            onKeyDown={async e => {
                                if (e.key === 'Enter') {
                                    const v = query.trim()
                                    if (!v) return
                                    setTyping(false)
                                    await persistRecentKeyword(v)
                                    setOverlayOpen(false)
                                    window.location.href = `https://app.grandlinemaritime.com/results?search_query=${encodeURIComponent(v)}`
                                }
                            }}
                            className="w-full h-10 border border-gray-300 rounded-md pl-3 pr-10 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c]"
                            placeholder="Search courses"
                        />
                        {query.trim().length > 0 && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setMode('suggestions'); loadRecentKeywords(); setTyping(false) }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                                aria-label="Clear"
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <SearchList />
                </div>
            </div>
        </>
    )
}
