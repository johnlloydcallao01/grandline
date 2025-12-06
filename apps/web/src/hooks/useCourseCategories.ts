import { useState, useEffect } from 'react'
import type { CourseCategory } from '@/server'

export function useCourseCategories() {
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/course-categories', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed: ${res.status}`)
        const data = await res.json() as { count: number; categories: CourseCategory[] }
        if (mounted) setCategories(Array.isArray(data.categories) ? data.categories : [])
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load categories')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  return { categories, isLoading, error }
}

