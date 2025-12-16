import { useFeaturedCourses as useSharedFeaturedCourses } from '@encreasl/ui/courses-hooks'
import type { Course } from '@/types/course'

export function useFeaturedCourses(limit: number = 8, options?: { enabled?: boolean }) {
  const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true'
  return useSharedFeaturedCourses<Course>(limit, { enabled: options?.enabled, debug })
}
