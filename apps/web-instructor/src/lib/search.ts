'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchDataSource } from '@encreasl/ui/search'

const RECENT_KEY = 'gl:instructor-recent-searches'
const MAX_RECENT = 10

export function useInstructorSearch() {
  const router = useRouter()

  const dataSource = useMemo<SearchDataSource>(
    () => ({
      recentSearchEnabled: true,

      search: async (query, signal) => {
        const resp = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=50`,
          signal ? { signal } : undefined,
        )
        const json = await resp.json()
        return Array.isArray(json?.results) ? json.results : []
      },

      searchByCategory: async () => [],

      getSuggestions: async (query) => {
        const resp = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}`,
        )
        const json = await resp.json()
        return Array.isArray(json?.suggestions) ? json.suggestions : []
      },

      loadRecentKeywords: async () => {
        try {
          if (typeof window === 'undefined') return []
          const raw = localStorage.getItem(RECENT_KEY)
          return raw ? JSON.parse(raw) : []
        } catch {
          return []
        }
      },

      persistRecentKeyword: async (keyword) => {
        try {
          if (typeof window === 'undefined') return
          const raw = localStorage.getItem(RECENT_KEY)
          const existing: string[] = raw ? JSON.parse(raw) : []
          const filtered = existing.filter(
            (k) => k.toLowerCase() !== keyword.toLowerCase(),
          )
          const updated = [keyword, ...filtered].slice(0, MAX_RECENT)
          localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
        } catch {
          // ignore
        }
      },
    }),
    [],
  )

  const navigateToResults = useCallback(
    (query: string) => {
      router.push(`/search?search_query=${encodeURIComponent(query)}` as never)
    },
    [router],
  )

  return { dataSource, navigateToResults }
}
