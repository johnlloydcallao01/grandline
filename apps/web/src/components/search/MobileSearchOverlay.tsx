'use client'

import React, { useEffect, useRef } from 'react'
import { useSearch } from '@/hooks/useSearch'

export function MobileSearchOverlay(): React.ReactNode {
  const {
    isOverlayOpen,
    setOverlayOpen,
    query,
    setQuery,
    getSuggestions,
    suggestions,
    mode,
    onSuggestionClick,
    results,
    setMode,
    recentKeywords,
    search,
    loadRecentKeywords,
    saveRecentKeyword,
    persistRecentKeyword,
    setTyping,
    isRecentLoading,
  } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOverlayOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOverlayOpen])

  useEffect(() => {
    if (isOverlayOpen) {
      loadRecentKeywords()
      const hasQuery = query.trim().length > 0
      setMode(hasQuery ? 'results' : 'suggestions')
    }
  }, [isOverlayOpen])

  if (!isOverlayOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col overflow-hidden">
      <div className="p-3 flex items-center gap-2 border-b border-gray-200">
        <button onClick={() => { setTyping(false); setOverlayOpen(false) }} className="w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center">
          <i className="fa fa-arrow-left"></i>
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
                await search(v)
              }
            }}
            className="w-full h-10 border border-gray-300 rounded-md pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c]"
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
        {mode === 'suggestions' ? (
          <div>
            {recentKeywords.length > 0 && query.trim().length === 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 text-xs font-medium text-gray-600">Recent searches</div>
                <ul className="divide-y divide-gray-100">
                  {recentKeywords.map((kw, idx) => (
                    <li key={`${kw}-${idx}`} className="p-4">
                      <button
                        type="button"
                        onClick={async () => {
                          saveRecentKeyword(kw)
                          await persistRecentKeyword(kw)
                          await search(kw)
                        }}
                        className="flex items-center gap-3 w-full text-left"
                      >
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
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
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <li key={idx} className="p-4">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-12 h-12 rounded-md bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="h-4 w-56 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded"></div>
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
                    <li key={`${s.label}-${idx}`} className="p-4">
                      <button type="button" onClick={() => onSuggestionClick(s)} className="flex items-center gap-3 w-full text-left">
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
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
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <button type="button" onClick={() => setMode('suggestions')} className="text-sm text-blue-600 hover:underline">Back to suggestions</button>
            </div>
            {results.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No courses found</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.map(r => (
                  <li key={r.id} className="p-4">
                    <a href={r.href} className="flex items-center gap-3">
                      {r.thumbnail ? (
                        <img src={r.thumbnail} alt="" className="w-12 h-12 rounded-md object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-100"></div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                        {r.subtitle && (
                          <div className="text-xs text-gray-600 truncate">{r.subtitle}</div>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
