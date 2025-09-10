import 'server-only';

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  icon?: {
    id: number;
    url: string;
    cloudinaryURL?: string;
    alt?: string;
  };
}

export interface CourseCategoryResponse {
  docs: CourseCategory[];
  totalDocs: number;
  limit: number;
  page: number;
}

export class CourseCategoryService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://grandline-cms.vercel.app/api';
  
  /**
   * Fetch course categories from CMS
   * Optimized for server-side rendering with error handling
   */
  static async getCourseCategories(limit: number = 50): Promise<CourseCategory[]> {
    try {
      const response = await fetch(`${CourseCategoryService.API_BASE}/lms/course-categories?limit=${limit}`, {
        next: { revalidate: 300 }, // 5 minutes cache for ISR
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data: CourseCategoryResponse = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching course categories:', error);
      return []; // Graceful fallback
    }
  }
}

// Export convenience function
export const getCourseCategories = CourseCategoryService.getCourseCategories;