'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/hooks/useSearch'
import { SearchList } from './SearchList'

export function MobileSearchOverlay(): React.ReactNode {
  const router = useRouter()
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

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOverlayOpen])

  if (!isOverlayOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] bg-[var(--background)] flex flex-col overflow-hidden">
      <div className="p-3 flex items-center gap-2 border-b border-[var(--card-border)]">
        <button onClick={() => { setTyping(false); setOverlayOpen(false) }} className="w-8 h-8 rounded-full bg-[var(--card-background)] border border-[var(--card-border)] shadow-md flex items-center justify-center text-[var(--foreground)]">
          <i className="fa fa-arrow-left"></i>
        </button>
        <div className="relative flex-1">
          <button
            type="button"
            onClick={async () => {
              const v = query.trim()
              if (!v) return
              setTyping(false)
              await persistRecentKeyword(v)
              setOverlayOpen(false)
              router.push(`/results?search_query=${encodeURIComponent(v)}` as any)
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-gray-600 dark:hover:text-gray-300 z-10"
            aria-label="Search"
          >
            <i className="fa fa-search"></i>
          </button>
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
                router.push(`/results?search_query=${encodeURIComponent(v)}` as any)
              }
            }}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#201a7c]/20 focus:border-[#201a7c] bg-[var(--card-background)] text-[var(--foreground)] placeholder-[var(--muted)]"
            placeholder="Search courses"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => { setQuery(''); setMode('suggestions'); loadRecentKeywords(); setTyping(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
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
  )
}
