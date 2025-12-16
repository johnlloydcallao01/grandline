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
  private static readonly API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';

  static async getCourseCategories(limit: number = 50): Promise<CourseCategory[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const apiKey = process.env.PAYLOAD_API_KEY;
      if (apiKey) {
        headers['PAYLOAD_API_KEY'] = apiKey;
      }

      const url = `${CourseCategoryService.API_BASE}/course-categories/active`;
      const init = {
        headers,
        next: { revalidate: 300, tags: ['course-categories'] },
      };

      type FetchResponse = {
        ok: boolean;
        status: number;
        json: () => Promise<unknown>;
      };

      const f = globalThis.fetch as unknown as (
        input: string,
        init?: unknown
      ) => Promise<FetchResponse>;

      const response = await f(url, init);

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = (await response.json()) as { count: number; categories: CourseCategory[] };
      return Array.isArray(data.categories) ? data.categories.slice(0, limit) : [];
    } catch (error) {
      console.error('Error fetching course categories:', error);
      return [];
    }
  }
}

export const getCourseCategories = CourseCategoryService.getCourseCategories;
