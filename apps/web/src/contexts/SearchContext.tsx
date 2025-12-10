'use client'

import React, { createContext, useContext, useMemo, useRef, useState } from 'react'
import { useUser } from '@/hooks/useAuth'
import type { SearchResult, Suggestion } from '@/types/search'

interface SearchContextValue {
  query: string
  setQuery: (v: string) => void
  results: SearchResult[]
  setResults: (r: SearchResult[]) => void
  recentKeywords: string[]
  suggestions: Suggestion[]
  setSuggestions: (s: Suggestion[]) => void
  mode: 'suggestions' | 'results'
  setMode: (m: 'suggestions' | 'results') => void
  isDropdownOpen: boolean
  setDropdownOpen: (v: boolean) => void
  isOverlayOpen: boolean
  setOverlayOpen: (v: boolean) => void
  isLoading: boolean
  isRecentLoading: boolean
  error?: string
  selectIndex: number
  setSelectIndex: (i: number) => void
  isTyping: boolean
  setTyping: (v: boolean) => void
  search: (q: string) => Promise<void>
  getSuggestions: (q: string) => Promise<Suggestion[]>
  searchByCategory: (categoryLabel: string) => Promise<void>
  onSuggestionClick: (s: Suggestion) => Promise<void>
  loadRecentKeywords: () => void
  saveRecentKeyword: (kw: string) => void
  removeRecentKeyword: (kw: string) => void
  clearRecentKeywords: () => void
  persistRecentKeyword: (kw: string) => Promise<void>
}

const SearchContext = createContext<SearchContextValue | null>(null)

const cache = new Map<string, { ts: number; data: SearchResult[] }>()

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentKeywords, setRecentKeywords] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [mode, setMode] = useState<'suggestions' | 'results'>('suggestions')
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isOverlayOpen, setOverlayOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isRecentLoading, setRecentLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectIndex, setSelectIndex] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const [isTyping, setTyping] = useState(false)
  const suggSeqRef = useRef(0)
  const { user } = useUser()

  const loadRecentKeywords = () => {
    try {
      if (user && user.role === 'trainee') {
        setRecentLoading(true)
        fetch(`/api/search/recent?userId=${encodeURIComponent(String(user.id))}`)
          .then(r => r.json())
          .then(j => {
            const remote = Array.isArray(j?.keywords) ? j.keywords as string[] : []
            setRecentKeywords(remote)
          })
          .catch(() => setRecentKeywords([]))
          .finally(() => setRecentLoading(false))
      } else {
        setRecentKeywords([])
        setRecentLoading(false)
      }
    } catch (_e) { void 0 }
  }

  const saveRecentKeyword = (_kw: string) => {
    try { void 0 } catch (_e) { void 0 }
  }

  const removeRecentKeyword = (_kw: string) => {
    try { void 0 } catch (_e) { void 0 }
  }

  const clearRecentKeywords = () => {
    try { setRecentKeywords([]) } catch (_e) { void 0 }
  }

  const persistRecentKeyword = async (kw: string) => {
    try {
      if (!user || user.role !== 'trainee') return
      const v = kw.trim()
      if (!v) return
      await fetch('/api/search/recent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: v, userId: user.id }),
      })
      setRecentLoading(true)
      await fetch(`/api/search/recent?userId=${encodeURIComponent(String(user.id))}`)
        .then(r => r.json())
        .then(j => {
          const remote = Array.isArray(j?.keywords) ? j.keywords as string[] : []
          setRecentKeywords(remote)
        })
        .catch(() => void 0)
        .finally(() => setRecentLoading(false))
    } catch (_e) { void 0 }
  }

  const search = async (q: string) => {
    const v = q.trim().toLowerCase().replace(/\s+/g, ' ')
    setQuery(v)
    setError(undefined)
    setTyping(false)
    if (v.length < 2) {
      setResults([])
      return
    }
    const now = Date.now()
    const cached = cache.get(v)
    if (cached && now - cached.ts < 60000) {
      setResults(cached.data)
      return
    }
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(v)}&limit=8`, { signal: ac.signal })
      const json = await resp.json()
      const data: SearchResult[] = json.results || []
      setResults(data)
      cache.set(v, { ts: Date.now(), data })
      setMode('results')
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError('Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getSuggestions = async (q: string) => {
    try {
      const seq = ++suggSeqRef.current
      const resp = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      const json = await resp.json()
      const items: Suggestion[] = json.suggestions || []
      if (suggSeqRef.current === seq && isTyping) {
        setSuggestions(items)
        setMode('suggestions')
      }
      return items
    } catch {
      if (isTyping) setSuggestions([])
      return []
    }
  }

  const searchByCategory = async (categoryLabel: string) => {
    const v = categoryLabel.trim().toLowerCase().replace(/\s+/g, ' ')
    setQuery(categoryLabel)
    setError(undefined)
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    try {
      const resp = await fetch(`/api/search?categoryLabel=${encodeURIComponent(v)}&limit=8`, { signal: ac.signal })
      const json = await resp.json()
      const data: SearchResult[] = json.results || []
      setResults(data)
      setMode('results')
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError('Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const onSuggestionClick = async (s: Suggestion) => {
    setTyping(false)
    if (s.kind === 'category') {
      saveRecentKeyword(s.label)
      await persistRecentKeyword(s.label)
      await searchByCategory(s.label)
    } else {
      saveRecentKeyword(s.label)
      await persistRecentKeyword(s.label)
      await search(s.label)
    }
  }

  const value = useMemo(() => ({
    query, setQuery,
    results, setResults,
    recentKeywords,
    suggestions, setSuggestions,
    mode, setMode,
    isDropdownOpen, setDropdownOpen,
    isOverlayOpen, setOverlayOpen,
    isLoading, error,
    isRecentLoading,
    selectIndex, setSelectIndex,
    isTyping, setTyping,
    search,
    getSuggestions,
    searchByCategory,
    onSuggestionClick,
    loadRecentKeywords,
    saveRecentKeyword,
    removeRecentKeyword,
    clearRecentKeywords,
    persistRecentKeyword,
  } as SearchContextValue & {
    loadRecentKeywords: () => void
    saveRecentKeyword: (kw: string) => void
    removeRecentKeyword: (kw: string) => void
    clearRecentKeywords: () => void
    persistRecentKeyword: (kw: string) => Promise<void>
  }), [
    query, results, recentKeywords, suggestions, mode, isDropdownOpen, isOverlayOpen, isLoading, error, selectIndex, user
  ])

  return React.createElement(SearchContext.Provider, { value }, children)
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within SearchProvider')
  return ctx
}
