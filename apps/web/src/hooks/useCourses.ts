import { useState, useEffect, useCallback } from 'react';
import type { Course, CoursesResponse, CourseQueryParams } from '@/types/course';

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  totalCourses: number;
  refetch: () => void;
}

export function useCourses(options: CourseQueryParams = {}): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);

  const {
    status = 'published',
    limit = 10,
    page = 1
  } = options;

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        status,
        limit: limit.toString(),
        page: page.toString(),
      });

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
      console.log('📋 COURSES: Data received:', data);

      setCourses(data.docs || []);
      setTotalCourses(data.totalDocs || 0);
    } catch (err) {
      console.error('❌ COURSES: Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      setCourses([]);
      setTotalCourses(0);
    } finally {
      setIsLoading(false);
    }
  }, [status, limit, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    totalCourses,
    refetch: fetchCourses,
  };
}
