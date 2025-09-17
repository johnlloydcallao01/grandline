import 'server-only';
import type {
  Media,
  Course,
  User,
  Instructor,
  CourseWithInstructor,
  CoursesResponse,
  CoursesWithInstructorResponse,
  CourseQueryParams
} from '@/types/course';

// Re-export types for backward compatibility
export type {
  Media,
  Course,
  User,
  Instructor,
  CourseWithInstructor,
  CoursesResponse,
  CoursesWithInstructorResponse,
  CourseQueryParams
};

export interface CoursesResponseLegacy {
  docs: Course[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CourseServiceOptions {
  status?: 'published' | 'draft';
  limit?: number;
  page?: number;
}

export class CourseService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
  
  /**
   * Fetch courses from CMS with ISR optimization
   * Optimized for server-side rendering with error handling
   */
  static async getCourses(options: CourseServiceOptions = {}): Promise<Course[]> {
    const {
      status = 'published',
      limit = 8,
      page = 1
    } = options;

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Build query parameters
      const params = new URLSearchParams({
        status,
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add API key authentication
      const apiKey = process.env.PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${CourseService.API_BASE}/courses?${params}`, {
        next: { revalidate: 300 }, // 5 minutes cache for ISR
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      const data: CoursesResponse = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Fetch individual course by ID from CMS with ISR optimization
   * Optimized for server-side rendering with error handling
   */
  static async getCourseById(id: string): Promise<Course | null> {
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key authentication
      const apiKey = process.env.PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${CourseService.API_BASE}/courses/${id}?depth=3`, {
        next: { revalidate: 300 }, // 5 minutes cache for ISR
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Course not found
        }
        throw new Error(`Failed to fetch course: ${response.status}`);
      }
      
      const course: Course = await response.json();
      return course;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Fetch individual course with instructor data by ID from CMS with ISR optimization
   * Optimized for server-side rendering with error handling
   */
  static async getCourseByIdWithInstructor(id: string): Promise<CourseWithInstructor | null> {
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key authentication
      const apiKey = process.env.PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${CourseService.API_BASE}/courses/${id}?depth=3`, {
        next: { 
          revalidate: 300, // 5 minutes cache for ISR
          tags: [`course-${id}`] // Enable tag-based revalidation
        },
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Course not found
        }
        throw new Error(`Failed to fetch course: ${response.status}`);
      }
      
      const course: CourseWithInstructor = await response.json();
      return course;
    } catch (error) {
      console.error('Error fetching course with instructor by ID:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Get course count for pagination/display purposes
   */
  static async getCourseCount(status: 'published' | 'draft' = 'published'): Promise<number> {
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const params = new URLSearchParams({
        status,
        limit: '1', // Minimal fetch for count
        page: '1',
      });

      // Add API key authentication
      const apiKey = process.env.PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${CourseService.API_BASE}/courses?${params}`, {
        next: { revalidate: 300 },
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course count: ${response.status}`);
      }
      
      const data: CoursesResponse = await response.json();
      return data.totalDocs || 0;
    } catch (error) {
      console.error('Error fetching course count:', error);
      return 0;
    }
  }
}

// Export specific functions for convenience
export const getCourses = CourseService.getCourses;
export const getCourseCount = CourseService.getCourseCount;
export const getCourseById = CourseService.getCourseById;
export const getCourseByIdWithInstructor = CourseService.getCourseByIdWithInstructor;