'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useAuth'
import type { SearchDataSource } from '@encreasl/ui/search'

export function useWebSearch() {
  const { user } = useUser()
  const router = useRouter()

  const dataSource = useMemo<SearchDataSource>(() => ({
    recentSearchEnabled: !!(user && user.role === 'trainee'),
    search: async (query, signal) => {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`, signal ? { signal } : undefined)
      const json = await resp.json()
      return Array.isArray(json?.results) ? json.results : []
    },
    searchByCategory: async (categoryLabel, signal) => {
      const resp = await fetch(`/api/search?categoryLabel=${encodeURIComponent(categoryLabel)}&limit=50`, signal ? { signal } : undefined)
      const json = await resp.json()
      return Array.isArray(json?.results) ? json.results : []
    },
    getSuggestions: async (query) => {
      const resp = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      const json = await resp.json()
      return Array.isArray(json?.suggestions) ? json.suggestions : []
    },
    loadRecentKeywords: async () => {
      if (!user?.id) return []
      const resp = await fetch(`/api/search/recent?userId=${encodeURIComponent(String(user.id))}`)
      const json = await resp.json()
      return Array.isArray(json?.keywords) ? json.keywords : []
    },
    persistRecentKeyword: async (keyword) => {
      if (!user?.id) return
      await fetch('/api/search/recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, userId: user.id }),
      })
    },
  }), [user])

  const navigateToResults = useCallback((query: string) => {
    router.push(`/results?search_query=${encodeURIComponent(query)}` as any)
  }, [router])

  return { dataSource, navigateToResults }
}
