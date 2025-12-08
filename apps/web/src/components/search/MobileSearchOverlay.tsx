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
      getSuggestions(query)
    }
  }, [isOverlayOpen])

  if (!isOverlayOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="p-3 flex items-center gap-2 border-b border-gray-200">
        <button onClick={() => setOverlayOpen(false)} className="w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center">
          <i className="fa fa-arrow-left"></i>
        </button>
        <input
          ref={inputRef}
          value={query}
          onChange={e => {
            const v = e.target.value
            setQuery(v)
            getSuggestions(v)
          }}
          className="flex-1 h-10 border rounded-md px-3"
          placeholder="Search courses"
        />
      </div>
      <div className="overflow-y-auto">
        {mode === 'suggestions' ? (
          <div>
            {recentKeywords.length > 0 && query.trim().length === 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 text-xs font-medium text-gray-600">Recent searches</div>
                <ul className="divide-y divide-gray-100">
                  {recentKeywords.map((kw, idx) => (
                    <li key={`${kw}-${idx}`} className="p-4">
                      <button type="button" onClick={() => search(kw)} className="flex items-center gap-3 w-full text-left">
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
            {suggestions.length === 0 ? (
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
