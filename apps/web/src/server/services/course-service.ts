import 'server-only';

// Media interface from CMS API
export interface Media {
  id: number;
  alt?: string | null;
  cloudinaryPublicId?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

// Course interface matching CMS API
export interface Course {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  thumbnail?: Media | null;
  bannerImage?: Media | null;
}

export interface CoursesResponse {
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

// Export convenience functions
export const getCourses = CourseService.getCourses;
export const getCourseCount = CourseService.getCourseCount;