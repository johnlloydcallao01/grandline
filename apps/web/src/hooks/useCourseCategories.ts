import { useState, useEffect } from 'react'
import type { CourseCategory } from '@/server'

let categoriesCache: { data: CourseCategory[]; ts: number } | null = null
let categoriesPromise: Promise<CourseCategory[]> | null = null
const CACHE_TTL = 300000

export function useCourseCategories() {
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        const isReload = typeof window !== 'undefined' && (() => {
          try {
            const entries = performance.getEntriesByType('navigation') as any
            return Array.isArray(entries) && entries[0] && entries[0].type === 'reload'
          } catch { return false }
        })()

        setError(null)

        // Serve from memory cache without toggling loading state
        if (!isReload && categoriesCache && Date.now() - categoriesCache.ts < CACHE_TTL) {
          if (mounted) {
            setCategories(categoriesCache.data)
            setIsLoading(false)
          }
          return
        }

        if (!isReload && categoriesPromise) {
          const arr = await categoriesPromise
          if (mounted) {
            setCategories(arr)
            setIsLoading(false)
          }
          return
        }

        setIsLoading(true)
        categoriesPromise = (async () => {
          const res = await fetch('/api/course-categories', isReload ? { cache: 'no-store' } : undefined)
          if (!res.ok) throw new Error(`Failed: ${res.status}`)
          const data = await res.json() as { count: number; categories: CourseCategory[] }
          const arr = Array.isArray(data.categories) ? data.categories : []
          categoriesCache = { data: arr, ts: Date.now() }
          return arr
        })()

        const arr = await categoriesPromise
        if (mounted) setCategories(arr)
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load categories')
      } finally {
        categoriesPromise = null
        if (mounted) setIsLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  return { categories, isLoading, error }
}
