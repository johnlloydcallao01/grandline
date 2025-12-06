import { useState, useEffect, useCallback } from 'react';
import type { Course, CoursesResponse, CourseQueryParams } from '@/types/course';

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  totalCourses: number;
  refetch: () => void;
  loadMore: () => void;
}

export function useCourses(options: CourseQueryParams = {}): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const {
    status = 'published',
    limit = 10,
    category
  } = options;

  const fetchCourses = useCallback(async (pageToFetch: number, replace: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        status,
        limit: limit.toString(),
        page: String(pageToFetch),
      });
      if (typeof category === 'string' && category.length > 0) {
        params.set('course-category', category);
      }

      // Use our secure server-side API route
      const fullUrl = `/api/courses?${params}`;

      console.log('🔍 COURSES: Fetching from:', fullUrl);

      // Fetch from our secure server-side API route (no API key needed client-side)
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 COURSES: Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data: CoursesResponse = await response.json();
      setCourses(prev => replace ? (data.docs || []) : [...prev, ...(data.docs || [])]);
      setTotalCourses(data.totalDocs || 0);
      setHasMore(Boolean(data.hasNextPage));
    } catch (err) {
      console.error('❌ COURSES: Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      setCourses([]);
      setTotalCourses(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [status, limit, category]);

  useEffect(() => {
    fetchCourses(1, true);
  }, [fetchCourses]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const currentPage = Math.max(1, Math.ceil(courses.length / Math.max(1, options.limit || 10)));
      const nextPage = currentPage + 1;
      await fetchCourses(nextPage, false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, courses.length, options.limit, fetchCourses]);

  return {
    courses,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    totalCourses,
    refetch: () => fetchCourses(1, true),
    loadMore,
  };
}
