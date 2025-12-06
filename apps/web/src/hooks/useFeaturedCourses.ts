import { useState, useEffect, useCallback } from 'react'
import type { Course, CoursesResponse } from '@/types/course'

interface UseFeaturedReturn {
  courses: Course[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  totalCourses: number
  refetch: () => void
  loadMore: () => void
}

export function useFeaturedCourses(limit: number = 8): UseFeaturedReturn {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCourses, setTotalCourses] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchCourses = useCallback(async (pageToFetch: number, replace: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        status: 'published',
        limit: String(limit),
        page: String(pageToFetch),
        featured: 'true',
      })

      const fullUrl = `/api/courses?${params}`
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error(`Failed to fetch featured courses: ${response.status}`)
      const data: CoursesResponse = await response.json()
      setCourses(prev => replace ? (data.docs || []) : [...prev, ...(data.docs || [])])
      setTotalCourses(data.totalDocs || 0)
      setHasMore(Boolean(data.hasNextPage))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured courses')
      setCourses([])
      setTotalCourses(0)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchCourses(1, true)
  }, [fetchCourses])

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return
    try {
      setIsLoadingMore(true)
      const currentPage = Math.max(1, Math.ceil(courses.length / Math.max(1, limit)))
      const nextPage = currentPage + 1
      await fetchCourses(nextPage, false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoading, isLoadingMore, hasMore, courses.length, limit, fetchCourses])

  return {
    courses,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    totalCourses,
    refetch: () => fetchCourses(1, true),
    loadMore,
  }
}
