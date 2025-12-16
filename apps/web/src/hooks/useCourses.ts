import { useCourses as useSharedCourses } from '@encreasl/ui/courses-hooks';
import type { Course, CourseQueryParams } from '@/types/course';

type UseCoursesOptions = CourseQueryParams & { enabled?: boolean };

export function useCourses(options: UseCoursesOptions = {}) {
  const debug = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';
  return useSharedCourses<Course>({ ...options, debug });
}
