import { useState, useEffect, useCallback } from 'react';

// Course type matching your CMS API
interface Course {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
}

interface CoursesResponse {
  docs: Course[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseCoursesOptions {
  status?: 'published' | 'draft';
  limit?: number;
  page?: number;
}

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  totalCourses: number;
  refetch: () => void;
}

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
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

      // Use the correct CMS API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
      const fullUrl = `${apiUrl}/lms/courses?${params}`;

      console.log('🔍 COURSES: Fetching from:', fullUrl);

      // Fetch from your CMS API
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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
