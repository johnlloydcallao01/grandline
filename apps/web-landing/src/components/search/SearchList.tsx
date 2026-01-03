'use client'

import React from 'react'
import Link from 'next/link'
import { useSearch } from '@/hooks/useSearch'

function WishlistButton({ courseId }: { courseId: string }) {
    const [wishlisted, setWishlisted] = React.useState(false)

    React.useEffect(() => {
        try {
            const v = localStorage.getItem(`gl:wishlist:course:${courseId}`)
            setWishlisted(!!v)
        } catch { void 0 }
    }, [courseId])

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const next = !wishlisted
                setWishlisted(next)
                try {
                    if (next) {
                        localStorage.setItem(`gl:wishlist:course:${courseId}`, '1')
                    } else {
                        localStorage.removeItem(`gl:wishlist:course:${courseId}`)
                    }
                } catch { void 0 }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
            aria-label="Toggle wishlist"
        >
            <i className={`fa fa-heart ${wishlisted ? 'text-[#ab3b43]' : 'text-gray-300'}`}></i>
        </button>
    )
}

export function SearchList(): React.ReactNode {
    const {
        mode,
        suggestions,
        results,
        query,
        recentKeywords,
        persistRecentKeyword,
        setTyping,
        isRecentLoading,
        isLoading,
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
                                            onClick={async () => {
                                                setTyping(false)
                                                await persistRecentKeyword(kw)
                                                window.location.href = `https://app.grandlinemaritime.com/results?search_query=${encodeURIComponent(kw)}`
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
                            (isRecentLoading || isLoading) ? (
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
                                        <button type="button" onClick={async () => {
                                            setTyping(false)
                                            await persistRecentKeyword(s.label)
                                            window.location.href = `https://app.grandlinemaritime.com/results?search_query=${encodeURIComponent(s.label)}`
                                        }} className="flex items-center gap-3 w-full text-left">
                                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                <i className={`fa ${s.kind === 'category' ? 'fa-folder' : 'fa-book'} text-gray-900`}></i>
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
            ) : (
                <div>
                    <div className="p-2 border-b border-gray-100">
                        <div className="text-xs text-gray-500">Results for "{query}"</div>
                    </div>
                    {isLoading ? (
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
                    ) : results.length === 0 ? (
                        <div className="p-4 text-sm text-gray-600">No courses found</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {results.map(r => (
                                <li key={r.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                                    <Link href={r.href as any} className="flex items-center gap-3 flex-1 min-w-0">
                                        {r.thumbnail ? (
                                            <img src={r.thumbnail} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0"></div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                                            {r.subtitle && (
                                                <div className="text-xs text-gray-600 truncate">{r.subtitle}</div>
                                            )}
                                        </div>
                                    </Link>
                                    <WishlistButton courseId={r.id} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
