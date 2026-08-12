"use client"

import React, { createContext, useContext, useMemo, useRef, useState } from "react"
import type { SearchDataSource, SearchResult, Suggestion } from "./types"

export interface SearchContextValue {
  query: string
  setQuery: (v: string) => void
  results: SearchResult[]
  setResults: (r: SearchResult[]) => void
  recentKeywords: string[]
  suggestions: Suggestion[]
  setSuggestions: (s: Suggestion[]) => void
  mode: "suggestions" | "results"
  setMode: (m: "suggestions" | "results") => void
  isDropdownOpen: boolean
  setDropdownOpen: (v: boolean) => void
  isOverlayOpen: boolean
  setOverlayOpen: (v: boolean) => void
  isLoading: boolean
  lastCompletedKey: string
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
  navigateToResults: (query: string) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

const cache = new Map<string, { ts: number; data: SearchResult[] }>()

export interface SearchProviderProps {
  children: React.ReactNode
  dataSource: SearchDataSource
  onNavigateToResults?: (query: string) => void
}

export function SearchProvider({ children, dataSource, onNavigateToResults }: SearchProviderProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentKeywords, setRecentKeywords] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [mode, setMode] = useState<"suggestions" | "results">("suggestions")
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isOverlayOpen, setOverlayOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [lastCompletedKey, setLastCompletedKey] = useState("")
  const [isRecentLoading, setRecentLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectIndex, setSelectIndex] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const [isTyping, setTyping] = useState(false)
  const suggSeqRef = useRef(0)

  const navigateToResults = (q: string) => {
    onNavigateToResults?.(q)
  }

  const loadRecentKeywords = () => {
    try {
      if (dataSource.recentSearchEnabled) {
        setRecentLoading(true)
        dataSource
          .loadRecentKeywords()
          .then((keywords) => {
            setRecentKeywords(Array.isArray(keywords) ? keywords : [])
          })
          .catch(() => setRecentKeywords([]))
          .finally(() => setRecentLoading(false))
      } else {
        setRecentKeywords([])
        setRecentLoading(false)
      }
    } catch {
      void 0
    }
  }

  const saveRecentKeyword = (_kw: string) => {
    try {
      void 0
    } catch {
      void 0
    }
  }

  const removeRecentKeyword = (_kw: string) => {
    try {
      void 0
    } catch {
      void 0
    }
  }

  const clearRecentKeywords = () => {
    try {
      setRecentKeywords([])
    } catch {
      void 0
    }
  }

  const persistRecentKeyword = async (kw: string) => {
    try {
      if (!dataSource.recentSearchEnabled) return
      const v = kw.trim()
      if (!v) return
      await dataSource.persistRecentKeyword(v)
      setRecentLoading(true)
      await dataSource
        .loadRecentKeywords()
        .then((keywords) => {
          setRecentKeywords(Array.isArray(keywords) ? keywords : [])
        })
        .catch(() => void 0)
        .finally(() => setRecentLoading(false))
    } catch {
      void 0
    }
  }

  const search = async (q: string) => {
    const v = q.trim().toLowerCase().replace(/\s+/g, " ")
    const requestKey = `q:${v}`

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = null

    setLoading(true)
    setResults([])
    setMode("results")
    setQuery(v)
    setError(undefined)
    setTyping(false)

    if (v.length < 2) {
      setResults([])
      setLoading(false)
      setLastCompletedKey(requestKey)
      return
    }
    const now = Date.now()
    const cached = cache.get(v)
    if (cached && now - cached.ts < 60000) {
      setResults(cached.data)
      setLoading(false)
      setLastCompletedKey(requestKey)
      return
    }
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const data = await dataSource.search(v, ac.signal)
      const items: SearchResult[] = Array.isArray(data) ? data : []
      setResults(items)
      cache.set(v, { ts: Date.now(), data: items })
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Search failed")
        setResults([])
      }
    } finally {
      if (abortRef.current === ac) {
        setLoading(false)
        setLastCompletedKey(requestKey)
      }
    }
  }

  const getSuggestions = async (q: string): Promise<Suggestion[]> => {
    try {
      const seq = ++suggSeqRef.current
      const items: Suggestion[] = await dataSource.getSuggestions(q)
      if (suggSeqRef.current === seq) {
        setSuggestions(items)
        setMode("suggestions")
      }
      return items
    } catch {
      setSuggestions([])
      return []
    }
  }

  const searchByCategory = async (categoryLabel: string) => {
    const v = categoryLabel.trim().toLowerCase().replace(/\s+/g, " ")
    const requestKey = `category:${v}`
    setQuery(categoryLabel)
    setError(undefined)
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    setMode("results")
    try {
      const data = await dataSource.searchByCategory(v, ac.signal)
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Search failed")
        setResults([])
      }
    } finally {
      if (abortRef.current === ac) {
        setLoading(false)
        setLastCompletedKey(requestKey)
      }
    }
  }

  const onSuggestionClick = async (s: Suggestion) => {
    setTyping(false)
    if (s.kind === "category") {
      saveRecentKeyword(s.label)
      await persistRecentKeyword(s.label)
      await searchByCategory(s.label)
    } else {
      saveRecentKeyword(s.label)
      await persistRecentKeyword(s.label)
      await search(s.label)
    }
  }

  const value = useMemo(
    () =>
      ({
        query,
        setQuery,
        results,
        setResults,
        recentKeywords,
        suggestions,
        setSuggestions,
        mode,
        setMode,
        isDropdownOpen,
        setDropdownOpen,
        isOverlayOpen,
        setOverlayOpen,
        isLoading,
        lastCompletedKey,
        error,
        isRecentLoading,
        selectIndex,
        setSelectIndex,
        isTyping,
        setTyping,
        navigateToResults,
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
      }) as SearchContextValue,
    [
      query,
      results,
      recentKeywords,
      suggestions,
      mode,
      isDropdownOpen,
      isOverlayOpen,
      isLoading,
      lastCompletedKey,
      isRecentLoading,
      error,
      selectIndex,
      isTyping,
      dataSource,
      onNavigateToResults,
    ],
  )

  return React.createElement(SearchContext.Provider, { value }, children)
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used within SearchProvider")
  return ctx
}
