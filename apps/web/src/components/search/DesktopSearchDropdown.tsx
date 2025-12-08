'use client'

import React from 'react'
import { useSearch } from '@/hooks/useSearch'

export function DesktopSearchDropdown(): React.ReactNode {
  const {
    isDropdownOpen,
    mode,
    suggestions,
    results,
    onSuggestionClick,
    setMode,
    query,
    recentKeywords,
    search,
  } = useSearch()

  if (!isDropdownOpen) return null

  return (
    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-md shadow max-h-96 overflow-auto border border-gray-200">
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
                    <button type="button" onClick={() => search(kw)} className="flex items-center gap-3 w-full text-left">
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
          {suggestions.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No suggestions</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((s, idx) => (
                <li key={`${s.label}-${idx}`} className="p-3 hover:bg-gray-50">
                  <button type="button" onClick={() => onSuggestionClick(s)} className="flex items-center gap-3 w-full text-left">
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
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between p-2 border-b border-gray-100">
            <div className="text-xs text-gray-500">Results for "{query}"</div>
            <button type="button" onClick={() => setMode('suggestions')} className="text-xs text-blue-600 hover:underline">Back</button>
          </div>
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No courses found</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map(r => (
                <li key={r.id} className="p-3 hover:bg-gray-50">
                  <a href={r.href} className="flex items-center gap-3">
                    {r.thumbnail ? (
                      <img src={r.thumbnail} alt="" className="w-10 h-10 rounded-md object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100"></div>
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
  )
}
