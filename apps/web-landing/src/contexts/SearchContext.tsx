'use client'

import React, { createContext, useContext, useMemo, useRef, useState } from 'react'
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
    const [lastCompletedKey, setLastCompletedKey] = useState('')
    const [isRecentLoading, setRecentLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [selectIndex, setSelectIndex] = useState(0)
    const abortRef = useRef<AbortController | null>(null)
    const [isTyping, setTypingValue] = useState(false)
    const typingRef = useRef(false)
    const setTyping = (v: boolean) => {
        typingRef.current = v
        setTypingValue(v)
    }
    const suggSeqRef = useRef(0)

    // Using localStorage for recent searches (no authentication in web-landing)
    const RECENT_SEARCHES_KEY = 'gl:recent-searches'
    const MAX_RECENT_SEARCHES = 10

    const loadRecentKeywords = () => {
        try {
            setRecentLoading(true)
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                if (Array.isArray(parsed)) {
                    setRecentKeywords(parsed.slice(0, MAX_RECENT_SEARCHES))
                }
            }
            setRecentLoading(false)
        } catch (_e) {
            setRecentKeywords([])
            setRecentLoading(false)
        }
    }

    const saveRecentKeyword = (kw: string) => {
        try {
            const v = kw.trim()
            if (!v) return

            const current = [...recentKeywords]
            const normalized = v.toLowerCase()

            // Remove if already exists (we'll add it to the front)
            const filtered = current.filter(k => k.toLowerCase() !== normalized)

            // Add to front
            const updated = [v, ...filtered].slice(0, MAX_RECENT_SEARCHES)

            setRecentKeywords(updated)
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
        } catch (_e) { void 0 }
    }

    const removeRecentKeyword = (kw: string) => {
        try {
            const normalized = kw.toLowerCase()
            const updated = recentKeywords.filter(k => k.toLowerCase() !== normalized)
            setRecentKeywords(updated)
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
        } catch (_e) { void 0 }
    }

    const clearRecentKeywords = () => {
        try {
            setRecentKeywords([])
            localStorage.removeItem(RECENT_SEARCHES_KEY)
        } catch (_e) { void 0 }
    }

    const persistRecentKeyword = async (kw: string) => {
        try {
            const v = kw.trim()
            if (!v) return

            const current = [...recentKeywords]
            const normalized = v.toLowerCase()

            // Remove if already exists (we'll add it to the front)
            const filtered = current.filter(k => k.toLowerCase() !== normalized)

            // Add to front
            const updated = [v, ...filtered].slice(0, MAX_RECENT_SEARCHES)

            setRecentKeywords(updated)
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
        } catch (_e) { void 0 }
    }

    const search = async (q: string) => {
        const v = q.trim().toLowerCase().replace(/\s+/g, ' ')
        const requestKey = `q:${v}`

        if (abortRef.current) abortRef.current.abort()
        abortRef.current = null

        // Set loading and clear results IMMEDIATELY (synchronously) before any async work
        setLoading(true)
        setResults([])
        setMode('results')
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
            const resp = await fetch(`/api/search?q=${encodeURIComponent(v)}&limit=50`, { signal: ac.signal })
            const json = await resp.json()
            const data: SearchResult[] = json.results || []
            setResults(data)
            cache.set(v, { ts: Date.now(), data })
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                setError('Search failed')
                setResults([])
            }
        } finally {
            if (abortRef.current === ac) {
                setLoading(false)
                setLastCompletedKey(requestKey)
            }
        }
    }

    const getSuggestions = async (q: string) => {
        try {
            const seq = ++suggSeqRef.current
            const resp = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
            const json = await resp.json()
            const items: Suggestion[] = json.suggestions || []
            if (suggSeqRef.current === seq && typingRef.current) {
                setSuggestions(items)
                setMode('suggestions')
            }
            return items
        } catch {
            if (typingRef.current) setSuggestions([])
            return []
        }
    }

    const searchByCategory = async (categoryLabel: string) => {
        const v = categoryLabel.trim().toLowerCase().replace(/\s+/g, ' ')
        const requestKey = `category:${v}`
        setQuery(categoryLabel)
        setError(undefined)
        if (abortRef.current) abortRef.current.abort()
        const ac = new AbortController()
        abortRef.current = ac
        setLoading(true)
        setMode('results')
        try {
            const resp = await fetch(`/api/search?categoryLabel=${encodeURIComponent(v)}&limit=50`, { signal: ac.signal })
            const json = await resp.json()
            const data: SearchResult[] = json.results || []
            setResults(data)
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                setError('Search failed')
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
        isLoading,
        lastCompletedKey,
        error,
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
    ])

    return React.createElement(SearchContext.Provider, { value }, children)
}

export function useSearch() {
    const ctx = useContext(SearchContext)
    if (!ctx) throw new Error('useSearch must be used within SearchProvider')
    return ctx
}
